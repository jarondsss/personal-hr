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
      include: {
        leaveRequests: {
          where: {
            status: 'APPROVED',
            leaveType: 'UNPAID',
            startDate: {
              gte: monthStart,
            },
            endDate: {
              lte: monthEnd
            }
          }
        }
      }
    })

    // Total hari kerja ideal dalam sebulan
    const WORKING_DAYS_MONTH = 22;

    for (const emp of employees) {
      // 1. Get overtime pay from closed periods (already calculated)
      const overtimePay = overtimePayMap.get(emp.id) || 0

      // 2. Base Date calculation (Full month view, e.g. Oct 1 - Oct 31)
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0)

      let basicSalary = emp.salary

      // 3. Prorate for New Employees (Join Date logic)
      // Rumus: (Hari kerja dia / 22) * Gaji Pokok
      if (emp.joinDate > monthStart) {
        if (emp.joinDate > monthEnd) {
          // Join date after this month ends, salary = 0
          basicSalary = 0
        } else {
          // Calculate how many business days they actually worked from joinDate to end of month
          // differenceInBusinessDays doesn't count the start day, so we add 1 if it's a weekday
          const actualWorkingDays = differenceInBusinessDays(monthEnd, emp.joinDate) + 1

          // Apply prorate formula exactly as requested: (Hari kerja / 22) * Gaji
          basicSalary = (actualWorkingDays / WORKING_DAYS_MONTH) * emp.salary
        }
      }

      // 4. Deduction for UNPAID leaves
      if (basicSalary > 0 && emp.leaveRequests.length > 0) {
        let totalUnpaidLeaveDays = 0;
        emp.leaveRequests.forEach(leave => {
           totalUnpaidLeaveDays += differenceInBusinessDays(leave.endDate, leave.startDate) + 1
        })

        const salaryPerDay = emp.salary / WORKING_DAYS_MONTH;
        const unpaidDeduction = totalUnpaidLeaveDays * salaryPerDay;

        basicSalary = Math.max(0, basicSalary - unpaidDeduction);
      }

      const grossSalary = basicSalary + overtimePay

      // PPh21 only applies to basic salary (uang lembur NON-PPh21 / tidak kena pajak)
      const deductions = emp.salaryType === 'GROSS'
        ? calculatePPh21(basicSalary, emp.taxStatus)
        : 0

      const netSalary = grossSalary - deductions

      // Upsert payroll record
      await prisma.payroll.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year
          }
        },
        update: {
          basicSalary,
          overtimePay,
          deductions,
          netSalary,
        },
        create: {
          employeeId: emp.id,
          month,
          year,
          basicSalary,
          overtimePay,
          deductions,
          netSalary,
          status: 'DRAFT'
        }
      })
    }

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
