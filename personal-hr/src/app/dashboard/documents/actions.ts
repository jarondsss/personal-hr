"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, unlink } from "fs/promises"
import path from "path"

export async function getDocumentTemplates() {
  return await prisma.documentTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function uploadTemplate(formData: FormData) {
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
  // Prevent deleting our default seeded templates for safety during testing
  if (['contract-template.docx', 'intern-template.docx', 'keterangan-template.docx'].includes(fileName)) {
    throw new Error("Cannot delete default system templates")
  }

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

// Ensure defaults exist
export async function seedDefaultTemplates() {
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
  return await prisma.employee.findMany({
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      jobTitle: true,
      salary: true,
      joinDate: true,
      status: true
    }
  })
}
