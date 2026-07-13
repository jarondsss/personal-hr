"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function processLeaveRequest(id: string, action: 'APPROVED' | 'REJECTED') {
  await getRequiredAdminSession()

  try {
    // We use a transaction because if it's APPROVED, we need to deduct the quota
    await prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.findUnique({
        where: { id },
        include: { employee: true }
      })

      if (!request || request.status !== 'PENDING') {
        throw new Error("Invalid request or already processed")
      }

      // Update the request status
      await tx.leaveRequest.update({
        where: { id },
        data: { status: action }
      })

      // If approved, deduct quota
      if (action === 'APPROVED') {
        // Calculate days (simple calculation, doesn't skip weekends/holidays yet)
        // Add +1 because start and end date inclusive
        const diffTime = Math.abs(request.endDate.getTime() - request.startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        
        const currentYear = request.startDate.getFullYear()

        const quota = await tx.leaveQuota.findUnique({
          where: {
            employeeId_leaveType_year: {
              employeeId: request.employeeId,
              leaveType: request.leaveType,
              year: currentYear
            }
          }
        })

        if (quota) {
          await tx.leaveQuota.update({
            where: { id: quota.id },
            data: { used: quota.used + diffDays }
          })
        }
      }
    })

    revalidatePath("/dashboard/leave")
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || "Failed to process leave request" }
  }
}

export async function submitLeaveRequest(formData: FormData) {
  await getRequiredAdminSession()

  const employeeId = formData.get("employeeId") as string
  const leaveType = formData.get("leaveType") as string
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const reason = formData.get("reason") as string

  if (!employeeId || !leaveType || !startDateStr || !endDateStr) {
    return { error: "Missing required fields" }
  }

  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  if (endDate < startDate) {
    return { error: "End date cannot be before start date" }
  }

  try {
    await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate,
        endDate,
        reason: reason || null,
        status: "PENDING"
      }
    })

    revalidatePath("/dashboard/leave")
    return { success: true }
  } catch (error: any) {
    console.error("Leave request error:", error)
    return { error: error.message || "Failed to submit request" }
  }
}
