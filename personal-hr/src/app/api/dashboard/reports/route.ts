import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession, isAdminSession } from "@/lib/session"

function escapeCsv(value: string | number | null | undefined) {
  const raw = String(value ?? "")
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (!isAdminSession(session)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get("month") || "")
  const year = parseInt(searchParams.get("year") || "")

  if (isNaN(month) || isNaN(year)) {
    return new NextResponse("Bad Request: month and year are required", { status: 400 })
  }

  // Get payroll for the specified month and year
  const payrolls = await prisma.payroll.findMany({
    where: { month, year },
    select: {
      basicSalary: true,
      overtimePay: true,
      deductions: true,
      netSalary: true,
      status: true,
      employee: {
        select: {
          id: true,
          fullName: true,
          email: true,
          jobTitle: true,
          salaryType: true,
          bankName: true,
          bankAccount: true,
        },
      },
    },
  })

  // Format headers and rows for CSV
  const csvHeaders = [
    "Employee ID",
    "Employee Name",
    "Email",
    "Job Title",
    "Salary Type",
    "Basic Salary",
    "Overtime Pay",
    "Deductions",
    "Net Salary",
    "Status",
    "Bank Name",
    "Bank Account",
  ]

  const csvRows = payrolls.map((p) => [
    escapeCsv(p.employee.id),
    escapeCsv(p.employee.fullName),
    escapeCsv(p.employee.email),
    escapeCsv(p.employee.jobTitle),
    escapeCsv(p.employee.salaryType),
    p.basicSalary,
    p.overtimePay,
    p.deductions,
    p.netSalary,
    escapeCsv(p.status),
    escapeCsv(p.employee.bankName || "BCA"),
    escapeCsv(p.employee.bankAccount || ""),
  ])

  const csvContent = [
    csvHeaders.join(","),
    ...csvRows.map((row) => row.join(",")),
  ].join("\n")

  const filename = `Payroll_Report_${year}_${String(month).padStart(2, "0")}.csv`

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
