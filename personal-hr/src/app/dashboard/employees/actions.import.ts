"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function importEmployeesCSV(data: any[]) {
  await getRequiredAdminSession()

  const validRows = data.filter((row) => row.fullName && row.email && row.joinDate)
  const invalidCount = data.length - validRows.length

  const result = await prisma.employee.createMany({
    data: validRows.map((row) => ({
      fullName: row.fullName,
      email: row.email,
      phone: row.phone?.trim() || null,
      phone2: row.phone2?.trim() || null,
      idCardNumber: row.idCardNumber?.trim() || null,
      gender: row.gender?.trim() || null,
      birthPlace: row.birthPlace?.trim() || null,
      birthDate: row.birthDate ? new Date(row.birthDate) : null,
      npwp: row.npwp?.trim() || null,
      taxStatus: row.taxStatus?.trim() || null,
      bankName: row.bankName?.trim() || 'BCA',
      bankAccount: row.bankAccount?.trim() || null,
      address: row.address?.trim() || null,
      jobTitle: row.jobTitle?.trim() || 'TBD',
      status: row.status?.trim() || 'Active',
      salary: parseFloat(row.salary) || 0,
      salaryType: row.salaryType?.trim() || 'GROSS',
      joinDate: new Date(row.joinDate),
      startContract: row.startContract ? new Date(row.startContract) : null,
      endContract: row.endContract ? new Date(row.endContract) : null,
      discordId: row.discordId?.trim() || null,
      githubUsername: row.githubUsername?.trim() || null,
    })),
    skipDuplicates: true,
  })

  revalidatePath("/dashboard/employees")
  return { successCount: result.count, failCount: invalidCount + (validRows.length - result.count) }
}

export async function createOnboardingLink(formData: FormData) {
  await getRequiredAdminSession()

  const email = formData.get("email")?.toString()
  const name = formData.get("name")?.toString()

  if (!email || !name) throw new Error("Email and name required")

  const token = crypto.randomUUID()

  await prisma.onboardingLink.create({
    data: { email, name, token }
  })

  revalidatePath("/dashboard/employees")
}

export async function getOnboardingLinks() {
  await getRequiredAdminSession()

  return await prisma.onboardingLink.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function deleteOnboardingLink(id: string) {
  await getRequiredAdminSession()

  await prisma.onboardingLink.delete({ where: { id } })
  revalidatePath("/dashboard/employees")
}

export async function createSkillLink(formData: FormData) {
  await getRequiredAdminSession()

  const employeeId = formData.get("employeeId")?.toString()
  if (!employeeId) throw new Error("Select an employee")

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) throw new Error("Employee not found")

  const token = crypto.randomUUID()
  await prisma.skillLink.create({
    data: { email: employee.email, name: employee.fullName, employeeId: employee.id, token }
  })
  revalidatePath("/dashboard/employees")
}

export async function getSkillLinks() {
  await getRequiredAdminSession()
  return await prisma.skillLink.findMany({ orderBy: { createdAt: "desc" } })
}

export async function deleteSkillLink(id: string) {
  await getRequiredAdminSession()
  await prisma.skillLink.delete({ where: { id } })
  revalidatePath("/dashboard/employees")
}
