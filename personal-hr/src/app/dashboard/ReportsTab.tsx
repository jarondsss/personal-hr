import prisma from "@/lib/prisma"

export default async function ReportsTab() {
  // Aggregate payroll reports available in the database
  const payrollMonths = await prisma.payroll.groupBy({
    by: ["month", "year"],
    _count: {
      id: true
    },
    _sum: {
      basicSalary: true,
      overtimePay: true,
      deductions: true,
      netSalary: true
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" }
    ]
  })

  const formatCurrency = (val: number | null) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  const getMonthName = (monthNum: number) => {
    return new Date(2000, monthNum - 1, 1).toLocaleString("en-US", { month: "long" })
  }

  return (
    <div className="surface stack-md">
      <div className="row-between">
        <div className="stack-sm">
          <h2 className="t-title-md" style={{ fontSize: "0.9375rem" }}>
            Monthly Payroll Reports
          </h2>
          <p className="t-body-sm">
            Overview of total distributions and CSV export
          </p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="table w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">Period</th>
              <th className="text-right">Generated Slip</th>
              <th className="text-right">Total Basic Salary</th>
              <th className="text-right">Total Overtime Pay</th>
              <th className="text-right">Total Deductions</th>
              <th className="text-right">Total Net Salary</th>
              <th className="text-right">Export</th>
            </tr>
          </thead>
          <tbody>
            {payrollMonths.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-muted">
                  No payroll records found to generate reports.
                </td>
              </tr>
            ) : (
              payrollMonths.map((p) => (
                <tr key={`${p.year}-${p.month}`}>
                  <td className="text-left font-semibold">
                    {getMonthName(p.month)} {p.year}
                  </td>
                  <td className="text-right font-mono">{p._count.id}</td>
                  <td className="text-right font-mono">{formatCurrency(p._sum.basicSalary)}</td>
                  <td className="text-right font-mono">{formatCurrency(p._sum.overtimePay)}</td>
                  <td className="text-right font-mono">{formatCurrency(p._sum.deductions)}</td>
                  <td className="text-right font-mono text-success font-semibold">{formatCurrency(p._sum.netSalary)}</td>
                  <td className="text-right">
                    <a
                      href={`/api/dashboard/reports?month=${p.month}&year=${p.year}`}
                      download
                      className="btn btn-xs btn-outline btn-primary rounded-lg px-3 whitespace-nowrap"
                    >
                      Export CSV
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
