"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const employeeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  phone2: z.string().nullable().optional(),
  discordId: z.string().nullable().optional(),
  githubUsername: z.string().nullable().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  status: z.string().min(1, "Status is required"),
  salary: z.coerce.number().min(0),
  salaryType: z.string().min(1),
  joinDate: z.string().min(1, "Join date is required"),
  startContract: z.string().nullable().optional(),
  endContract: z.string().nullable().optional(),
  idCardNumber: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  birthPlace: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  npwp: z.string().nullable().optional(),
  taxStatus: z.string().nullable().optional(),
  bankName: z.string().nullable().optional(),
  bankAccount: z.string().nullable().optional(),
})

export async function createEmployee(formData: FormData) {
  await getRequiredAdminSession()

  const data = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || null,
    phone2: formData.get("phone2")?.toString() || null,
    discordId: formData.get("discordId")?.toString() || null,
    githubUsername: formData.get("githubUsername")?.toString() || null,
    jobTitle: formData.get("jobTitle")?.toString() || "",
    status: formData.get("status")?.toString() || "",
    salary: formData.get("salary")?.toString() || "",
    salaryType: formData.get("salaryType")?.toString() || "",
    joinDate: formData.get("joinDate")?.toString() || "",
    startContract: formData.get("startContract")?.toString() || null,
    endContract: formData.get("endContract")?.toString() || null,
    idCardNumber: formData.get("idCardNumber")?.toString() || null,
    gender: formData.get("gender")?.toString() || null,
    birthPlace: formData.get("birthPlace")?.toString() || null,
    birthDate: formData.get("birthDate")?.toString() || null,
    address: formData.get("address")?.toString() || null,
    npwp: formData.get("npwp")?.toString() || null,
    taxStatus: formData.get("taxStatus")?.toString() || null,
    bankName: formData.get("bankName")?.toString() || null,
    bankAccount: formData.get("bankAccount")?.toString() || null,
  }

  const validated = employeeSchema.parse(data)
  const isActiveRaw = formData.get("isActive")?.toString()
  const isActive = isActiveRaw !== "false"

  await prisma.employee.create({
    data: {
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone || null,
      phone2: validated.phone2 || null,
      discordId: validated.discordId || null,
      githubUsername: validated.githubUsername || null,
      jobTitle: validated.jobTitle,
      status: validated.status,
      isActive,
      salary: validated.salary,
      salaryType: validated.salaryType,
      joinDate: new Date(validated.joinDate),
      startContract: validated.startContract ? new Date(validated.startContract) : null,
      endContract: validated.endContract ? new Date(validated.endContract) : null,
      idCardNumber: validated.idCardNumber || null,
      gender: validated.gender || null,
      birthPlace: validated.birthPlace || null,
      birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
      address: validated.address || null,
      npwp: validated.npwp || null,
      taxStatus: validated.taxStatus || null,
      bankName: validated.bankName || "BCA",
      bankAccount: validated.bankAccount || null,
    }
  })

  revalidatePath("/dashboard/employees")
  redirect("/dashboard/employees")
}

export async function updateEmployee(id: string, formData: FormData) {
  await getRequiredAdminSession()

  const data = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || null,
    phone2: formData.get("phone2")?.toString() || null,
    discordId: formData.get("discordId")?.toString() || null,
    githubUsername: formData.get("githubUsername")?.toString() || null,
    jobTitle: formData.get("jobTitle")?.toString() || "",
    status: formData.get("status")?.toString() || "",
    salary: formData.get("salary")?.toString() || "",
    salaryType: formData.get("salaryType")?.toString() || "",
    joinDate: formData.get("joinDate")?.toString() || "",
    startContract: formData.get("startContract")?.toString() || null,
    endContract: formData.get("endContract")?.toString() || null,
    idCardNumber: formData.get("idCardNumber")?.toString() || null,
    gender: formData.get("gender")?.toString() || null,
    birthPlace: formData.get("birthPlace")?.toString() || null,
    birthDate: formData.get("birthDate")?.toString() || null,
    address: formData.get("address")?.toString() || null,
    npwp: formData.get("npwp")?.toString() || null,
    taxStatus: formData.get("taxStatus")?.toString() || null,
    bankName: formData.get("bankName")?.toString() || null,
    bankAccount: formData.get("bankAccount")?.toString() || null,
  }

  const validated = employeeSchema.parse(data)
  const isActiveRaw = formData.get("isActive")?.toString()
  const isActive = isActiveRaw !== "false"

  await prisma.employee.update({
    where: { id },
    data: {
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone || null,
      phone2: validated.phone2 || null,
      discordId: validated.discordId || null,
      githubUsername: validated.githubUsername || null,
      jobTitle: validated.jobTitle,
      status: validated.status,
      isActive,
      salary: validated.salary,
      salaryType: validated.salaryType,
      joinDate: new Date(validated.joinDate),
      startContract: validated.startContract ? new Date(validated.startContract) : null,
      endContract: validated.endContract ? new Date(validated.endContract) : null,
      idCardNumber: validated.idCardNumber || null,
      gender: validated.gender || null,
      birthPlace: validated.birthPlace || null,
      birthDate: validated.birthDate ? new Date(validated.birthDate) : null,
      address: validated.address || null,
      npwp: validated.npwp || null,
      taxStatus: validated.taxStatus || null,
      bankName: validated.bankName || "BCA",
      bankAccount: validated.bankAccount || null,
    }
  })

  revalidatePath("/dashboard/employees")
  redirect("/dashboard/employees")
}

export async function deleteEmployee(id: string) {
  await getRequiredAdminSession()

  await prisma.employee.delete({
    where: { id }
  })
  revalidatePath("/dashboard/employees")
}

export async function deleteEmployees(ids: string[]) {
  await getRequiredAdminSession()

  await prisma.employee.deleteMany({
    where: { id: { in: ids } }
  })
  revalidatePath("/dashboard/employees")
}

export async function deleteEmployeeSkill(skillId: string) {
  await getRequiredAdminSession()
  await prisma.employeeSkill.delete({ where: { id: skillId } })
  revalidatePath("/dashboard/employees")
}

export async function addEmployeeSkill(employeeId: string, skill: string, level: string) {
  await getRequiredAdminSession()
  const validLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]
  await prisma.employeeSkill.create({
    data: {
      employeeId,
      skill: skill.trim(),
      level: validLevels.includes(level) ? level : "INTERMEDIATE",
    },
  })
  revalidatePath("/dashboard/employees")
}

export async function toggleEmployeeStatus(id: string, currentIsActive: boolean) {
  await getRequiredAdminSession()

  await prisma.employee.update({
    where: { id },
    data: { isActive: !currentIsActive },
  })

  revalidatePath("/dashboard/employees")
  return { success: true, newIsActive: !currentIsActive }
}
