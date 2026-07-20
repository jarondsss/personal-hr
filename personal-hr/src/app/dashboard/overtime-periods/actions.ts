"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { isWeekend } from "date-fns"

export async function createOvertimePeriod(formData: FormData) {
  await getRequiredAdminSession()

  const periodStartStr = formData.get("periodStart") as string
  const periodEndStr = formData.get("periodEnd") as string

  if (!periodStartStr || !periodEndStr) {
    return { error: "Missing required fields" }
  }

  const periodStart = new Date(periodStartStr)
  const periodEnd = new Date(periodEndStr)

  if (periodStart >= periodEnd) {
    return { error: "Period start must be before period end" }
  }

  try {
    await prisma.overtimePeriod.create({
      data: {
        periodStart,
        periodEnd,
        status: "OPEN"
      }
    })

    revalidatePath("/dashboard/overtime-periods")
    return { success: true }
  } catch (error: any) {
    console.error("Create period error:", error)
    return { error: error.message || "Failed to create period" }
  }
}

export async function closeOvertimePeriod(periodId: string) {
  await getRequiredAdminSession()

  try {
    // Get period
    const period = await prisma.overtimePeriod.findUnique({
      where: { id: periodId }
    })

    if (!period) {
      return { error: "Period not found" }
    }

    if (period.status !== "OPEN") {
      return { error: "Period is already closed" }
    }

    // Get all public holidays from Master Data
    const publicHolidaysData = await prisma.masterData.findMany({
      where: { category: "PUBLIC_HOLIDAY" }
    })
    const publicHolidayDates = publicHolidaysData.map(h =>
      new Date(h.value).toISOString().split('T')[0]
    )

    const isPublicHolidayOrWeekend = (date: Date) => {
      if (isWeekend(date)) return true
      const dateString = date.toISOString().split('T')[0]
      return publicHolidayDates.includes(dateString)
    }

    // Get all approved overtimes in this period
    const overtimes = await prisma.overtimeRequest.findMany({
      where: {
        status: 'APPROVED',
        date: {
          gte: period.periodStart,
          lte: period.periodEnd
        }
      },
      include: {
        employee: true
      }
    })

    // Group by employee and calculate
    const employeeOvertimeMap = new Map<string, { totalHours: number; totalPay: number }>()

    for (const ot of overtimes) {
      const empId = ot.employeeId
      const hours = ot.durationHours
      const HOURLY_RATE = ot.employee.salary / 173

      if (!employeeOvertimeMap.has(empId)) {
        employeeOvertimeMap.set(empId, { totalHours: 0, totalPay: 0 })
      }

      const empData = employeeOvertimeMap.get(empId)!
      empData.totalHours += hours

      // Calculate pay using same logic as payroll (Standar Depnaker)
      let overtimePay = 0

      if (isPublicHolidayOrWeekend(new Date(ot.date))) {
        // Weekend / Public Holiday Overtime
        if (hours <= 8) {
          overtimePay = hours * 2.0 * HOURLY_RATE
        } else if (hours <= 9) {
          overtimePay = (8 * 2.0 * HOURLY_RATE) + ((hours - 8) * 3.0 * HOURLY_RATE)
        } else {
          overtimePay = (8 * 2.0 * HOURLY_RATE) + (1 * 3.0 * HOURLY_RATE) + ((hours - 9) * 4.0 * HOURLY_RATE)
        }
      } else {
        // Weekday Overtime
        if (hours <= 1) {
          overtimePay = hours * 1.5 * HOURLY_RATE
        } else {
          overtimePay = (1 * 1.5 * HOURLY_RATE) + ((hours - 1) * 2.0 * HOURLY_RATE)
        }
      }

      empData.totalPay += overtimePay
    }

    // Create summaries for each employee
    const summaries = Array.from(employeeOvertimeMap.entries()).map(([employeeId, data]) => ({
      employeeId,
      totalHours: data.totalHours,
      totalPay: data.totalPay
    }))

    // Update period status and create summaries in a transaction
    await prisma.$transaction([
      prisma.overtimePeriod.update({
        where: { id: periodId },
        data: {
          status: "CLOSED",
          closedAt: new Date()
        }
      }),
      ...summaries.map(summary =>
        prisma.overtimePeriodSummary.create({
          data: {
            periodId,
            employeeId: summary.employeeId,
            totalHours: summary.totalHours,
            totalPay: summary.totalPay
          }
        })
      )
    ])

    revalidatePath("/dashboard/overtime-periods")
    return { success: true, summaryCount: summaries.length }
  } catch (error: any) {
    console.error("Close period error:", error)
    return { error: error.message || "Failed to close period" }
  }
}

export async function deleteOvertimePeriod(periodId: string) {
  await getRequiredAdminSession()

  try {
    const period = await prisma.overtimePeriod.findUnique({
      where: { id: periodId }
    })

    if (!period) {
      return { error: "Period not found" }
    }

    if (period.status === "CLOSED") {
      return { error: "Cannot delete closed period" }
    }

    await prisma.overtimePeriod.delete({
      where: { id: periodId }
    })

    revalidatePath("/dashboard/overtime-periods")
    return { success: true }
  } catch (error: any) {
    console.error("Delete period error:", error)
    return { error: error.message || "Failed to delete period" }
  }
}
