"use server"

import prisma from "@/lib/prisma"
import { getRequiredAdminSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { endOfMonth, startOfMonth, differenceInBusinessDays, isWeekend } from "date-fns"
import { calculatePPh21 } from "./pph21-calculator"

export async function generatePayroll(formData: FormData) {
  await getRequiredAdminSession()

  try {
    const month = parseInt(formData.get("month") as string)
    const year = parseInt(formData.get("year") as string)

    // Get all public holidays from Master Data
    const publicHolidaysData = await prisma.masterData.findMany({
      where: { category: "PUBLIC_HOLIDAY" }
    })
    const publicHolidayDates = publicHolidaysData.map(h => new Date(h.value).toISOString().split('T')[0])

    const isPublicHolidayOrWeekend = (date: Date) => {
      if (isWeekend(date)) return true
      const dateString = date.toISOString().split('T')[0]
      return publicHolidayDates.includes(dateString)
    }

    // Get all employees
    const employees = await prisma.employee.findMany({
      include: {
        overtimes: {
          where: {
            status: 'APPROVED',
            date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0)
            }
          }
        },
        leaveRequests: {
          where: {
            status: 'APPROVED',
            leaveType: 'UNPAID',
            startDate: {
              gte: new Date(year, month - 1, 1),
            },
            endDate: {
              lte: new Date(year, month, 0)
            }
          }
        }
      }
    })

    // Total hari kerja ideal dalam sebulan
    const WORKING_DAYS_MONTH = 22;

    for (const emp of employees) {
      // 1. Calculate Overtime (Standar Depnaker)
      const HOURLY_RATE = emp.salary / 173;
      let overtimePay = 0;

      for (const ot of emp.overtimes) {
        const hours = ot.durationHours;
        if (hours <= 0) continue;

        // Cek apakah tanggal lembur jatuh di hari libur/weekend atau hari libur nasional
        if (isPublicHolidayOrWeekend(new Date(ot.date))) {
          // Weekend / Public Holiday Overtime
          if (hours <= 8) {
            overtimePay += hours * 2.0 * HOURLY_RATE;
          } else if (hours <= 9) {
            overtimePay += (8 * 2.0 * HOURLY_RATE) + ((hours - 8) * 3.0 * HOURLY_RATE);
          } else {
            overtimePay += (8 * 2.0 * HOURLY_RATE) + (1 * 3.0 * HOURLY_RATE) + ((hours - 9) * 4.0 * HOURLY_RATE);
          }
        } else {
          // Weekday Overtime
          if (hours <= 1) {
            overtimePay += hours * 1.5 * HOURLY_RATE;
          } else {
            overtimePay += (1 * 1.5 * HOURLY_RATE) + ((hours - 1) * 2.0 * HOURLY_RATE);
          }
        }
      }

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

      // NETT salary means tax is company-borne, so employee take-home is not deducted.
      const deductions = emp.salaryType === 'GROSS'
        ? calculatePPh21(grossSalary, emp.taxStatus)
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
