"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function importEmployeesCSV(data: any[]) {
  let successCount = 0;
  let failCount = 0;

  for (const row of data) {
    try {
      // Basic validation
      if (!row.fullName || !row.email) {
        failCount++;
        continue;
      }

      // Check if exists
      const exists = await prisma.employee.findUnique({
        where: { email: row.email }
      })

      if (exists) {
        failCount++;
        continue;
      }

      await prisma.employee.create({
        data: {
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
          jobTitle: row.jobTitle?.trim() || 'TBD', // Default fallback
          status: row.status?.trim() || 'Active', // Default
          salary: parseFloat(row.salary) || 0,
          salaryType: row.salaryType?.trim() || 'GROSS',
          joinDate: row.joinDate ? new Date(row.joinDate) : new Date(), // Default to today
          startContract: row.startContract ? new Date(row.startContract) : null,
          endContract: row.endContract ? new Date(row.endContract) : null,
          discordId: row.discordId?.trim() || null,
          githubUsername: row.githubUsername?.trim() || null,
        }
      })
      successCount++;
    } catch (e) {
      console.error("Failed importing row:", row, e)
      failCount++;
    }
  }

  revalidatePath("/dashboard/employees")
  return { successCount, failCount }
}

export async function createOnboardingLink(formData: FormData) {
  const email = formData.get("email")?.toString()
  const name = formData.get("name")?.toString()

  if (!email || !name) throw new Error("Email and name required")

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

  await prisma.onboardingLink.create({
    data: { email, name, token }
  })

  revalidatePath("/dashboard/employees")
}

export async function getOnboardingLinks() {
  return await prisma.onboardingLink.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function deleteOnboardingLink(id: string) {
  await prisma.onboardingLink.delete({ where: { id } })
  revalidatePath("/dashboard/employees")
}
