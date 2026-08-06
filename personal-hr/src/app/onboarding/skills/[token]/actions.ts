"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const

function parseSkillRows(formData: FormData): { skill: string; level: string }[] {
  const rows: { skill: string; level: string }[] = []
  const seen = new Set<string>()

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("skill_")) continue
    const index = key.replace("skill_", "")
    const level = formData.get(`level_${index}`)?.toString()
    const skill = value.toString().trim()
    if (!skill || seen.has(skill.toLowerCase())) continue
    seen.add(skill.toLowerCase())
    rows.push({
      skill,
      level: LEVELS.includes(level as any) ? level! : "INTERMEDIATE",
    })
  }

  return rows
}

export async function submitSkills(token: string, formData: FormData) {
  const link = await prisma.skillLink.findUnique({
    where: { token },
    include: { employee: true },
  })
  if (!link) throw new Error("Invalid link")
  if (!link.employeeId || !link.employee) throw new Error("Link is not linked to an employee")

  const employee = link.employee
  const rows = parseSkillRows(formData)

  // Replace entire skill set: delete all, then insert current rows.
  await prisma.$transaction([
    prisma.employeeSkill.deleteMany({ where: { employeeId: employee.id } }),
    ...rows.map((r) =>
      prisma.employeeSkill.create({
        data: { employeeId: employee.id, skill: r.skill, level: r.level },
      })
    ),
  ])

  await prisma.skillLink.update({
    where: { token },
    data: { isUsed: true },
  })

  revalidatePath("/dashboard/employees")
  revalidatePath(`/onboarding/skills/${token}`)
  return { ok: true }
}
