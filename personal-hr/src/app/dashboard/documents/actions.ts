"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, unlink, readFile } from "fs/promises"
import path from "path"
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import { getRequiredAdminSession } from "@/lib/session"

export async function getDocumentTemplates() {
  await getRequiredAdminSession()

  return await prisma.documentTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function uploadTemplate(formData: FormData) {
  await getRequiredAdminSession()

  const name = formData.get("name")?.toString()
  const file = formData.get("file") as File

  if (!name || !file) throw new Error("Name and file are required")
  if (!file.name.endsWith('.docx')) throw new Error("Only .docx files are allowed")

  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filePath = path.join(process.cwd(), 'public/templates', fileName)
  await writeFile(filePath, buffer)

  await prisma.documentTemplate.create({
    data: { name, fileName }
  })

  revalidatePath('/dashboard/documents')
}

export async function deleteTemplate(id: string, fileName: string) {
  await getRequiredAdminSession()

  const filePath = path.join(process.cwd(), 'public/templates', fileName)
  try {
    await unlink(filePath)
  } catch (error) {
    console.error("File already deleted or missing", error)
  }

  await prisma.documentTemplate.delete({
    where: { id }
  })

  revalidatePath('/dashboard/documents')
}

export async function generateEmployeeContract(employeeId: string) {
  await getRequiredAdminSession()

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })
    if (!employee) return { error: "Employee not found" }

    // Find the contract template
    const template = await prisma.documentTemplate.findFirst({
      where: { name: { contains: 'PKWT' } }
    })
    if (!template) return { error: "Contract template not found. Please upload a PKWT template first." }

    const filePath = path.join(process.cwd(), 'public/templates', template.fileName)
    const content = await readFile(filePath, 'binary')
    const zip = new PizZip(content)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '[', end: ']' }
    })

    // Fetch company profile for contract header
    const companyProfile = await prisma.companyProfile.findFirst()

    const docData = {
      "Nama Lengkap Karyawan": employee.fullName,
      "Tempat/Tgl Lahir Karyawan": (employee.birthPlace && employee.birthDate) 
        ? `${employee.birthPlace}, ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(employee.birthDate))}` 
        : "-",
      "Jenis Kelamin Karyawan": employee.gender || "-",
      "Alamat Karyawan": employee.address || "-",
      "No KTP Karyawan": employee.idCardNumber || "-",
      "Jabatan Karyawan": employee.jobTitle,
      "Tanggal Mulai Kontrak": employee.startContract
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(employee.startContract))
        : employee.joinDate
          ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(employee.joinDate))
          : "-",
      "Tanggal Selesai Kontrak": employee.endContract 
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(employee.endContract)) 
        : "-",
      "Gaji Karyawan": new Intl.NumberFormat('id-ID').format(employee.salary),
      "Type Salary": employee.salaryType || "-",
      "Tanggal kontrak": new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()),
      // Company profile variables
      "Nama Perusahaan": companyProfile?.companyName || "-",
      "Email Perusahaan": companyProfile?.email || "-",
      "No HP Perusahaan": companyProfile?.phone || "-",
      "Alamat Perusahaan": companyProfile?.address || "-"
    }

    doc.render(docData)

    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    const base64 = buffer.toString('base64')
    const filename = `${template.name}_${employee.fullName.replace(/\s+/g, '_')}.docx`

    return { base64, filename }
  } catch (error: any) {
    console.error("generateEmployeeContract error:", error)
    return { error: error.message || "Failed to generate contract" }
  }
}

// Ensure defaults exist
export async function seedDefaultTemplates() {
  await getRequiredAdminSession()

  const defaults = [
    { name: 'PKWT / Kontrak Kerja', fileName: 'contract-template.docx' },
    { name: 'Internship Agreement', fileName: 'intern-template.docx' },
    { name: 'Surat Keterangan Kerja', fileName: 'keterangan-template.docx' }
  ]

  for (const tpl of defaults) {
    await prisma.documentTemplate.upsert({
      where: { name: tpl.name },
      update: {},
      create: tpl
    })
  }
}

export async function getEmployeesForDocument() {
  await getRequiredAdminSession()

  return await prisma.employee.findMany({
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      birthPlace: true,
      birthDate: true,
      gender: true,
      address: true,
      idCardNumber: true,
      jobTitle: true,
      salary: true,
      salaryType: true,
      joinDate: true,
      startContract: true,
      endContract: true,
      status: true
    }
  })
}
