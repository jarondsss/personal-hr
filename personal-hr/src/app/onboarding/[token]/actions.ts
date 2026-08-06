"use server"

import prisma from "@/lib/prisma"

export async function submitOnboarding(token: string, formData: FormData) {
  const link = await prisma.onboardingLink.findUnique({
    where: { token }
  })

  if (!link || link.isUsed) throw new Error("Link invalid or already used")

  const data = {
    fullName: formData.get("fullName")?.toString() || link.name,
    email: formData.get("email")?.toString() || link.email,
    phone: formData.get("phone")?.toString(),
    phone2: formData.get("phone2")?.toString(),
    idCardNumber: formData.get("idCardNumber")?.toString(),
    gender: formData.get("gender")?.toString(),
    birthPlace: formData.get("birthPlace")?.toString(),
    birthDate: formData.get("birthDate")?.toString(),
    address: formData.get("address")?.toString(),
    npwp: formData.get("npwp")?.toString(),
    taxStatus: formData.get("taxStatus")?.toString(),
    bankName: formData.get("bankName")?.toString(),
    bankAccount: formData.get("bankAccount")?.toString(),
  }

  // Create Employee record
  await prisma.employee.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      phone2: data.phone2 || null,
      idCardNumber: data.idCardNumber || null,
      gender: data.gender || null,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      address: data.address || null,
      npwp: data.npwp || null,
      taxStatus: data.taxStatus || null,
      bankName: data.bankName || null,
      bankAccount: data.bankAccount || null,
      // Draft defaults
      jobTitle: "DRAFT_POSITION",
      status: "DRAFT",
      salary: 0,
      salaryType: "GROSS",
      joinDate: new Date()
    }
  })

  await prisma.onboardingLink.update({
    where: { token },
    data: { isUsed: true }
  })

  return { ok: true }
}
