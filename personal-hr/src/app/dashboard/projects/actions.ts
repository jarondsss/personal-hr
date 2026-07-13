"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createProject(formData: FormData) {
  await getRequiredAdminSession()

  const clientName = formData.get("clientName") as string
  const projectName = formData.get("projectName") as string
  const status = formData.get("status") as string

  if (!clientName || !projectName || !status) return { error: "Required fields missing" }

  try {
    await prisma.project.create({
      data: { clientName, projectName, status }
    })
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create project" }
  }
}

export async function deleteProject(id: string) {
  await getRequiredAdminSession()

  try {
    await prisma.project.delete({ where: { id } })
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete" }
  }
}

export async function addProjectMember(projectId: string, formData: FormData) {
  await getRequiredAdminSession()

  const employeeId = formData.get("employeeId") as string
  const joinDate = formData.get("joinDate") as string

  if (!employeeId || !joinDate) return { error: "Employee and Join Date are required" }

  try {
    await prisma.projectMember.create({
      data: {
        projectId,
        employeeId,
        joinDate: new Date(joinDate)
      }
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Employee is already assigned to this project" }
    return { error: "Failed to add member" }
  }
}

export async function removeProjectMember(memberId: string, projectId: string) {
  await getRequiredAdminSession()

  try {
    await prisma.projectMember.delete({
      where: { id: memberId }
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to remove member" }
  }
}
