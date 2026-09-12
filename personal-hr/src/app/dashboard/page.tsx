import prisma from "@/lib/prisma";
import Link from "next/link";
import AnalyticsTab from "./AnalyticsTab";
import ReportsTab from "./ReportsTab";
import DashboardTabs from "./DashboardTabs";
import PageTransition from "@/components/PageTransition";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const allowedTabs = new Set(["overview", "analytics", "reports"]);
  const currentTab = searchParams.tab && allowedTabs.has(searchParams.tab)
    ? searchParams.tab
    : "overview";

  let employeeCount = 0;
  let activeProjects = 0;
  let pendingLeaves = 0;
  let pendingOvertimes = 0;
  let expiringContracts: {
    id: string;
    fullName: string;
    jobTitle: string;
    endContract: Date | null;
  }[] = [];

  try {
    [
      employeeCount,
      activeProjects,
      pendingLeaves,
      pendingOvertimes,
      expiringContracts,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.project.count(),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.overtimeRequest.count({ where: { status: "PENDING" } }),
      prisma.employee.findMany({
        where: { endContract: { not: null } },
        select: { id: true, fullName: true, jobTitle: true, endContract: true },
        orderBy: { endContract: "asc" },
      }),
    ]);
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }

  const dbError = !expiringContracts.length && employeeCount === 0 && pendingLeaves === 0 && pendingOvertimes === 0;

  const soonExpiring = expiringContracts.filter((e) => {
    if (!e.endContract) return false;
    const daysLeft = (new Date(e.endContract).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30;
  });

  const stats = [
    {
      label: "Total Employees",
      value: employeeCount,
      foot: "Active workforce",
      href: "/dashboard/employees",
      linkLabel: "View all",
      tone: "info",
    },
    {
      label: "Active Projects",
      value: activeProjects,
      foot: "Currently in progress",
      href: "/dashboard/projects",
      linkLabel: "View all",
      tone: "success",
    },
    {
      label: "Pending Leaves",
      value: pendingLeaves,
      foot: "Awaiting approval",
      href: "/dashboard/leave",
      linkLabel: pendingLeaves > 0 ? "Review now" : "View all",
      tone: "warning",
    },
    {
      label: "Pending Overtime",
      value: pendingOvertimes,
      foot: "Awaiting approval",
      href: "/dashboard/overtime",
      linkLabel: pendingOvertimes > 0 ? "Review now" : "View all",
      tone: "danger",
    },
  ];

  const quickActions = [
    {
      href: "/dashboard/employees/new",
      label: "Add Employee",
      desc: "Register a new team member",
      icon: (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </>
      ),
    },
    {
      href: "/dashboard/payroll",
      label: "Payroll",
      desc: "View this month's payroll",
      icon: (
        <>
          <rect x="1" y="5" width="22" height="16" rx="2" />
          <line x1="1" y1="11" x2="23" y2="11" />
          <circle cx="16" cy="15" r="1" />
        </>
      ),
    },
    {
      href: "/dashboard/leave",
      label: "Manage Leave",
      desc: pendingLeaves > 0 ? `${pendingLeaves} pending request${pendingLeaves > 1 ? "s" : ""}` : "View leave requests",
      icon: (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      ),
    },
    {
      href: "/dashboard/documents",
      label: "Generate Docs",
      desc: "Create contracts & letters",
      icon: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="stack-lg">
        {/* Page header */}
        <div className="row-between" style={{ flexWrap: "wrap", gap: 16 }}>
          <div className="stack-sm">
            <h1 className="t-headline-lg">
              Good morning, Admin
            </h1>
            <p className="t-body-sm">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {dbError && (
              <span className="chip" data-tone="danger">
                Database tidak terhubung
              </span>
            )}
          </div>
          <DashboardTabs currentTab={currentTab} />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" style={{ marginTop: 4 }}>
                    {soonExpiring.map((emp) => {
                      if (!emp.endContract) return null;
                      const daysLeft = Math.ceil(
                        (new Date(emp.endContract).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      const urgent = daysLeft <= 14;
                      const warning = daysLeft <= 30 && daysLeft > 14;
                      return (
                        <div
                          key={emp.id}
                          className="quick-action-card"
                          data-tone={urgent ? "danger" : warning ? "warning" : undefined}
                        >
                          <div
                            className="quick-action-icon"
                            style={
                              urgent
                                ? { backgroundColor: "var(--color-danger-soft)", color: "var(--color-danger)" }
                                : warning
                                ? { backgroundColor: "var(--color-warning-soft)", color: "var(--color-warning)" }
                                : undefined
                            }
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                          </div>
                          <div className="stack-xs" style={{ flex: 1, minWidth: 0 }}>
                            <div>
                              <div className="qa-label" style={{ fontSize: 13 }}>{emp.fullName}</div>
                              <div className="qa-desc" style={{ fontSize: 11, marginTop: 1 }}>
                                {daysLeft > 0 ? (
                                  <span style={{ color: urgent ? "var(--color-danger)" : "var(--color-warning)" }}>
                                    {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                                  </span>
                                ) : (
                                  <span style={{ color: "var(--color-danger)" }}>Expired</span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              <Link
                                href={`/dashboard/documents?employeeId=${emp.id}`}
                                className="btn btn-xs btn-primary"
                                style={{ fontSize: 11, height: 24, minHeight: 24, padding: "0 8px" }}
                              >
                                Document
                              </Link>
                              <Link
                                href={`/dashboard/employees/${emp.id}/edit`}
                                className="btn btn-xs btn-outline"
                                style={{ fontSize: 11, height: 24, minHeight: 24, padding: "0 8px" }}
                              >
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "24px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--color-success-soft)",
                        border: "1px solid var(--color-success-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
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

        {currentTab === "analytics" && <AnalyticsTab />}
        {currentTab === "reports" && <ReportsTab />}
      </div>
    </PageTransition>
  );
}
