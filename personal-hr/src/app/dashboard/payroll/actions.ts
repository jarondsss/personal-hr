"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { endOfMonth, startOfMonth, differenceInBusinessDays } from "date-fns"
import { calculatePPh21 } from "./pph21-calculator"

export async function generatePayroll(formData: FormData) {
  await getRequiredAdminSession()

  try {
    const month = parseInt(formData.get("month") as string)
    const year = parseInt(formData.get("year") as string)

    // Get closed overtime periods that END in this payroll month
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0)

    const closedPeriods = await prisma.overtimePeriod.findMany({
      where: {
        status: 'CLOSED',
        periodEnd: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      include: {
        summaries: true
      }
    })

    // Build overtime pay map from closed periods
    const overtimePayMap = new Map<string, number>()
    for (const period of closedPeriods) {
      for (const summary of period.summaries) {
        const currentPay = overtimePayMap.get(summary.employeeId) || 0
        overtimePayMap.set(summary.employeeId, currentPay + summary.totalPay)
      }
    }

    // Get all employees
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        salary: true,
        salaryType: true,
        taxStatus: true,
        joinDate: true,
        leaveRequests: {
          where: {
            status: 'APPROVED',
            leaveType: 'UNPAID',
            startDate: { gte: monthStart },
            endDate: { lte: monthEnd }
          }
        }
      }
    })

    // Total hari kerja ideal dalam sebulan
    const WORKING_DAYS_MONTH = 22;

    const upserts = employees.map((emp) => {
      // 1. Get overtime pay from closed periods (already calculated)
      const overtimePay = overtimePayMap.get(emp.id) || 0

      let basicSalary = emp.salary

      // 2. Prorate for New Employees (Join Date logic)
      // Rumus: (Hari kerja dia / 22) * Gaji Pokok
      if (emp.joinDate > monthStart) {
        if (emp.joinDate > monthEnd) {
          basicSalary = 0
        } else {
          const actualWorkingDays = differenceInBusinessDays(monthEnd, emp.joinDate) + 1
          basicSalary = (actualWorkingDays / WORKING_DAYS_MONTH) * emp.salary
        }
      }

      // 3. Deduction for UNPAID leaves
      if (basicSalary > 0 && emp.leaveRequests.length > 0) {
        let totalUnpaidLeaveDays = 0;
        emp.leaveRequests.forEach(leave => {
          totalUnpaidLeaveDays += differenceInBusinessDays(leave.endDate, leave.startDate) + 1
        })
        const salaryPerDay = emp.salary / WORKING_DAYS_MONTH;
        basicSalary = Math.max(0, basicSalary - totalUnpaidLeaveDays * salaryPerDay);
      }

      const grossSalary = basicSalary + overtimePay

      // PPh21 only applies to basic salary (uang lembur NON-PPh21 / tidak kena pajak)
      const deductions = emp.salaryType === 'GROSS'
        ? calculatePPh21(basicSalary, emp.taxStatus)
        : 0

      const netSalary = grossSalary - deductions

      return prisma.payroll.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
        update: { basicSalary, overtimePay, deductions, netSalary },
        create: { employeeId: emp.id, month, year, basicSalary, overtimePay, deductions, netSalary, status: 'DRAFT' }
      })
    })

    await prisma.$transaction(upserts)

    revalidatePath("/dashboard/payroll")
    return { success: true }
  } catch (error) {
    console.error("Generate payroll error:", error)
    return { error: "Failed to generate payroll" }
  }
}

export async function markAsPaid(payrollId: string) {
  await getRequiredAdminSession()

  try {
    await prisma.payroll.update({
      where: { id: payrollId },
      data: { status: 'PAID' }
    })
    revalidatePath("/dashboard/payroll")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update payroll status" }
  }
}
