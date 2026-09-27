"use client"

import { useState } from "react"
import Link from "next/link"
import PageTransition from "@/components/PageTransition"

type Stat = {
  label: string
  value: number
  foot: string
  href: string
  linkLabel: string
  tone: string
}

type ExpiringContract = {
  id: string
  fullName: string
  jobTitle: string
  endContract: Date | null
  isActive: boolean
}

type AnalyticsData = {
  employees: { salary: number; jobTitle: string; status: string }[]
  projects: { id: string; _count: { members: number } }[]
  jobTitleMap: [string, string][]
}

type ReportsData = {
  payrollMonths: {
    month: number
    year: number
    _count: { id: number }
    _sum: { basicSalary: number | null; overtimePay: number | null; deductions: number | null; netSalary: number | null }
  }[]
}

interface DashboardClientProps {
  stats: Stat[]
  quickActions: { href: string; label: string; desc: string; icon: React.ReactNode }[]
  soonExpiring: ExpiringContract[]
  dbError: boolean
  analytics: AnalyticsData
  reports: ReportsData
}

export default function DashboardClient({
  stats,
  quickActions,
  soonExpiring,
  dbError,
  analytics,
  reports,
}: DashboardClientProps) {
  const [currentTab, setCurrentTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "reports", label: "Reports" },
  ]

  return (
    <PageTransition>
      <div className="stack-lg">
        {/* Page header */}
        <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="stack-sm">
            <h1 className="t-headline-lg">Good morning, Admin</h1>
            <p className="t-body-sm">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {dbError && (
              <span className="chip" data-tone="danger">
                Database tidak terhubung
              </span>
            )}
          </div>
          {/* Inline tabs */}
          <div className="halo-tabs" role="tablist" style={{ flexShrink: 0 }}>
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id
              return (
                <button
                  key={tab.id}
                  className="halo-tab"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCurrentTab(tab.id)}
                  style={{
                    color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    backgroundColor: isActive ? "var(--color-surface)" : "transparent",
                    boxShadow: isActive ? "var(--shadow-xs)" : "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {currentTab === "overview" && (
          <>
            {/* Stat row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-tile" data-tone={stat.tone}>
                  <div className="stat-head">
                    <span className="stat-eyebrow">{stat.label}</span>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-meta">
                    <span className="stat-foot">{stat.foot}</span>
                    <Link href={stat.href} className="stat-foot-link">
                      {stat.linkLabel}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="surface">
              <div className="stack-sm">
                <div className="row-between">
                  <span className="t-title-md">Quick Actions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginTop: 4 }}>
                  {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className="quick-action-card">
                      <div className="quick-action-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          {action.icon}
                        </svg>
                      </div>
                      <div>
                        <div className="qa-label">{action.label}</div>
                        <div className="qa-desc">{action.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Expiring Contracts */}
            <div className="surface">
              <div className="stack-sm">
                <div className="row-between">
                  <div className="stack-xs">
                    <span className="t-title-md">Expiring Contracts</span>
                    <span className="t-body-sm" style={{ color: "var(--color-text-muted)" }}>
                      Contracts expiring within 30 days
                    </span>
                  </div>
                  {soonExpiring.length > 0 && (
                    <span
                      className="chip"
                      data-tone={
                        soonExpiring.some(
                          (e) =>
                            e.endContract &&
                            (new Date(e.endContract).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 14
                        )
                          ? "danger"
                          : "warning"
                      }
                    >
                      {soonExpiring.length} contract{soonExpiring.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {soonExpiring.length > 0 ? (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column" }}>
                    {soonExpiring.map((emp, idx) => {
                      if (!emp.endContract) return null
                      const daysLeft = Math.ceil(
                        (new Date(emp.endContract).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                      const urgent = daysLeft <= 14
                      const accentColor = urgent ? "var(--color-danger)" : "var(--color-warning)"
                      const endDateStr = new Date(emp.endContract).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                      return (
                        <div
                          key={emp.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: "12px 0",
                            borderBottom: idx < soonExpiring.length - 1 ? "1px solid var(--color-border)" : "none",
                            position: "relative",
                          }}
                        >
                          {/* Urgency bar — carries state information, not decoration */}
                          <div style={{
                            width: 3,
                            alignSelf: "stretch",
                            borderRadius: 99,
                            backgroundColor: accentColor,
                            flexShrink: 0,
                          }} />

                          {/* Name + meta */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {emp.fullName}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Ends {endDateStr}</span>
                              <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "var(--color-text-muted)", flexShrink: 0 }} />
                              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: accentColor }}>
                                {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <Link
                              href={`/dashboard/documents?employeeId=${emp.id}`}
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                color: "var(--color-text-secondary)",
                                textDecoration: "none",
                                padding: "4px 8px",
                                borderRadius: "var(--radius-xs)",
                                border: "1px solid var(--color-border)",
                                transition: "border-color 0.12s, color 0.12s",
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor }}
                              onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-secondary)" }}
                            >
                              Docs
                            </Link>
                            <Link
                              href={`/dashboard/employees/${emp.id}/edit`}
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                color: "var(--color-text-secondary)",
                                textDecoration: "none",
                                padding: "4px 8px",
                                borderRadius: "var(--radius-xs)",
                                border: "1px solid var(--color-border)",
                                transition: "border-color 0.12s, color 0.12s",
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor }}
                              onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-secondary)" }}
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "24px 0", display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32, height: 32,
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-success-soft)",
                        border: "1px solid var(--color-success-border)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="t-body-sm" style={{ color: "var(--color-text-muted)" }}>
                      No contracts expiring within 30 days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentTab === "analytics" && <AnalyticsTabClient analytics={analytics} />}
        {currentTab === "reports" && <ReportsTabClient reports={reports} />}
      </div>
    </PageTransition>
  )
}

function AnalyticsTabClient({ analytics }: { analytics: AnalyticsData }) {
  const { employees, projects, jobTitleMap: jobTitleEntries } = analytics
  const jobTitleMap = new Map(jobTitleEntries)

  const validSalaries = employees.filter((e) => e.salary > 0)
  const totalSalary = validSalaries.reduce((sum, e) => sum + e.salary, 0)
  const avgSalary = validSalaries.length ? Math.round(totalSalary / validSalaries.length) : 0
  const maxSalary = validSalaries.length ? Math.max(...validSalaries.map((e) => e.salary)) : 0

  const rolesBreakdown = employees.reduce((acc: Record<string, number>, e) => {
    const title = jobTitleMap.get(e.jobTitle) || e.jobTitle || "TBD"
    acc[title] = (acc[title] || 0) + 1
    return acc
  }, {})

  const statusBreakdown = employees.reduce((acc: Record<string, number>, e) => {
    const status = e.status || "Active"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const totalAllocations = projects.reduce((sum, p) => sum + p._count.members, 0)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val)

  return (
    <div className="stack-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-tile stat-sm" data-tone="success">
          <div className="stat-head"><span className="stat-eyebrow">Average Basic Salary</span></div>
          <div className="stat-value">{formatCurrency(avgSalary)}</div>
          <div className="stat-meta"><span className="stat-foot">Per employee with active salary</span></div>
        </div>
        <div className="stat-tile stat-sm" data-tone="info">
          <div className="stat-head"><span className="stat-eyebrow">Max Basic Salary</span></div>
          <div className="stat-value">{formatCurrency(maxSalary)}</div>
          <div className="stat-meta"><span className="stat-foot">Highest contract tier</span></div>
        </div>
        <div className="stat-tile stat-sm" data-tone="warning">
          <div className="stat-head"><span className="stat-eyebrow">Project Allocation Rate</span></div>
          <div className="stat-value">{totalAllocations} member(s)</div>
          <div className="stat-meta"><span className="stat-foot">Assigned to {projects.length} project(s)</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface">
          <h2 className="t-title-md mb-4">Personnel by Job Title</h2>
          <div className="stack-sm">
            {Object.entries(rolesBreakdown).map(([title, count]) => {
              const percentage = employees.length ? (count / employees.length) * 100 : 0
              return (
                <div key={title} className="stack-xs">
                  <div className="row-between">
                    <span className="t-body-sm t-primary" style={{ fontWeight: 500 }}>{title}</span>
                    <span className="t-mono-sm t-secondary">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="surface">
          <h2 className="t-title-md mb-4">Status Distribution</h2>
          <div className="stack-sm">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const percentage = employees.length ? (count / employees.length) * 100 : 0
              return (
                <div key={status} className="stack-xs">
                  <div className="row-between">
                    <span className="t-body-sm t-primary" style={{ fontWeight: 500 }}>{status}</span>
                    <span className="t-mono-sm t-secondary">{count} ({Math.round(percentage)}%)</span>
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

function ReportsTabClient({ reports }: { reports: ReportsData }) {
  const { payrollMonths } = reports

  const formatCurrency = (val: number | null) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0)

  const getMonthName = (monthNum: number) =>
    new Date(2000, monthNum - 1, 1).toLocaleString("en-US", { month: "long" })

  return (
    <div className="surface stack-md">
      <div className="row-between">
        <div className="stack-sm">
          <h2 className="t-title-md">Monthly Payroll Reports</h2>
          <p className="t-body-sm">Overview of total distributions and CSV export</p>
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
                  <td className="text-left font-semibold">{getMonthName(p.month)} {p.year}</td>
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
