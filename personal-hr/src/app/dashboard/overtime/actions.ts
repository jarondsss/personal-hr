"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function processOvertimeRequest(id: string, action: 'APPROVED' | 'REJECTED') {
  await getRequiredAdminSession()

  try {
    const request = await prisma.overtimeRequest.findUnique({ where: { id } })
    if (!request || request.status !== 'PENDING') {
      throw new Error("Invalid request or already processed")
    }

    await prisma.overtimeRequest.update({
      where: { id },
      data: { status: action }
    })

    revalidatePath("/dashboard/overtime")
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: error.message || "Failed to process overtime request" }
  }
}

export async function submitOvertimeRequest(formData: FormData) {
  await getRequiredAdminSession()

  const employeeId = formData.get("employeeId") as string
  const dateStr = formData.get("date") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const reason = formData.get("reason") as string

  if (!employeeId || !dateStr || !startTime || !endTime) {
    return { error: "Missing required fields" }
  }

  // Calculate duration in hours
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  
  let durationHours = (endH + endM / 60) - (startH + startM / 60)
  if (durationHours < 0) {
    // Handled overnight shift (crosses midnight)
    durationHours += 24
  }
  
  if (durationHours <= 0) {
    return { error: "Invalid duration" }
  }

  try {
    await prisma.overtimeRequest.create({
      data: {
        employeeId,
        date: new Date(dateStr),
        startTime,
        endTime,
        durationHours: Number(durationHours.toFixed(2)),
        reason: reason || null,
        status: "PENDING"
      }
    })

    revalidatePath("/dashboard/overtime")
    return { success: true }
  } catch (error: any) {
    console.error("Overtime error:", error)
    return { error: error.message || "Failed to submit request" }
  }
}
