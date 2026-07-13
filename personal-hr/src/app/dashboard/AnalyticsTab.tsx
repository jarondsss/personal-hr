import prisma from "@/lib/prisma"

export default async function AnalyticsTab() {
  const [
    employees,
    projects,
    masterData,
  ] = await Promise.all([
    prisma.employee.findMany({
      select: {
        salary: true,
        jobTitle: true,
        status: true,
      }
    }),
    prisma.project.findMany({
      include: {
        members: true
      }
    }),
    prisma.masterData.findMany()
  ])

  const jobTitleMap = new Map(masterData.filter(d => d.category === "JOB_TITLE").map(d => [d.value, d.label]))

  // 1. Avg Salary & Salary Info
  const validSalaries = employees.filter(e => e.salary > 0)
  const totalSalary = validSalaries.reduce((sum, e) => sum + e.salary, 0)
  const avgSalary = validSalaries.length ? Math.round(totalSalary / validSalaries.length) : 0
  const maxSalary = validSalaries.length ? Math.max(...validSalaries.map(e => e.salary)) : 0

  // 2. Department/Role Breakdown
  const rolesBreakdown = employees.reduce((acc: Record<string, number>, e) => {
    const title = jobTitleMap.get(e.jobTitle) || e.jobTitle || "TBD"
    acc[title] = (acc[title] || 0) + 1
    return acc
  }, {})

  // 3. Status Breakdown
  const statusBreakdown = employees.reduce((acc: Record<string, number>, e) => {
    const status = e.status || "Active"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  // 4. Project Allocation
  const totalAllocations = projects.reduce((sum, p) => sum + p.members.length, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className="stack-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-tile" data-tone="success">
          <div className="stat-head">
            <span className="stat-eyebrow">Average Basic Salary</span>
          </div>
          <div className="stat-value" style={{ fontSize: "1.75rem" }}>
            {formatCurrency(avgSalary)}
          </div>
          <div className="stat-meta">
            <span className="stat-foot">Per employee with active salary</span>
          </div>
        </div>

        <div className="stat-tile" data-tone="info">
          <div className="stat-head">
            <span className="stat-eyebrow">Max Basic Salary</span>
          </div>
          <div className="stat-value" style={{ fontSize: "1.75rem" }}>
            {formatCurrency(maxSalary)}
          </div>
          <div className="stat-meta">
            <span className="stat-foot">Highest contract tier</span>
          </div>
        </div>

        <div className="stat-tile" data-tone="warning">
          <div className="stat-head">
            <span className="stat-eyebrow">Project Allocation Rate</span>
          </div>
          <div className="stat-value" style={{ fontSize: "1.75rem" }}>
            {totalAllocations} member(s)
          </div>
          <div className="stat-meta">
            <span className="stat-foot">Assigned to {projects.length} project(s)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Titles distribution */}
        <div className="surface">
          <h2 className="t-title-md mb-4" style={{ fontSize: "0.9375rem" }}>Personnel by Job Title</h2>
          <div className="stack-sm" style={{ gap: "var(--space-3)" }}>
            {Object.entries(rolesBreakdown).map(([title, count]) => {
              const percentage = employees.length ? (count / employees.length) * 100 : 0
              return (
                <div key={title} className="stack-sm" style={{ gap: 4 }}>
                  <div className="row-between">
                    <span className="t-body-sm" style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{title}</span>
                    <span className="t-mono-sm" style={{ color: "var(--color-text-secondary)" }}>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="surface">
          <h2 className="t-title-md mb-4" style={{ fontSize: "0.9375rem" }}>Status Distribution</h2>
          <div className="stack-sm" style={{ gap: "var(--space-3)" }}>
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const percentage = employees.length ? (count / employees.length) * 100 : 0
              return (
                <div key={status} className="stack-sm" style={{ gap: 4 }}>
                  <div className="row-between">
                    <span className="t-body-sm" style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{status}</span>
                    <span className="t-mono-sm" style={{ color: "var(--color-text-secondary)" }}>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
