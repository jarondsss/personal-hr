import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import AnalyticsTab from "./AnalyticsTab";
import ReportsTab from "./ReportsTab";
import DashboardTabs from "./DashboardTabs";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function DashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab || "overview";
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Common overview stats logic
  const [
    employeeCount,
    activeProjects,
    pendingLeaves,
    pendingOvertimes,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.overtimeRequest.count({ where: { status: "PENDING" } }),
  ]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const currentPayrolls = await prisma.payroll.count({
    where: { month, year },
  });

  return (
    <div className="stack-lg">
      {/* Page header */}
      <div className="row-between">
        <div className="stack-sm">
          <h1 className="t-headline-lg" style={{ fontSize: "1.75rem" }}>
            Welcome back, Admin
          </h1>
          <p className="t-body-sm" style={{ marginTop: 2 }}>
            Here&apos;s what&apos;s happening across your organization today.
          </p>
        </div>
        <DashboardTabs currentTab={currentTab} />
      </div>

      {currentTab === "overview" && (
        <>
          {/* Stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-tile" data-tone="info">
              <div className="stat-head">
                <span className="stat-eyebrow">Total Employees</span>
              </div>
              <div className="stat-value">{employeeCount}</div>
              <div className="stat-meta">
                <span className="stat-foot">Active workforce</span>
                <Link href="/dashboard/employees" className="stat-foot-link">
                  View all <IconArrowRight />
                </Link>
              </div>
            </div>
            <div className="stat-tile" data-tone="success">
              <div className="stat-head">
                <span className="stat-eyebrow">Active Projects</span>
              </div>
              <div className="stat-value">{activeProjects}</div>
              <div className="stat-meta">
                <span className="stat-foot">Currently in progress</span>
                <Link href="/dashboard/projects" className="stat-foot-link">
                  View all <IconArrowRight />
                </Link>
              </div>
            </div>
            <div className="stat-tile" data-tone="warning">
              <div className="stat-head">
                <span className="stat-eyebrow">Pending Leaves</span>
              </div>
              <div className="stat-value">{pendingLeaves}</div>
              <div className="stat-meta">
                <span className="stat-foot">Awaiting approval</span>
                <Link href="/dashboard/leave" className="stat-foot-link">
                  Review <IconArrowRight />
                </Link>
              </div>
            </div>
            <div className="stat-tile" data-tone="danger">
              <div className="stat-head">
                <span className="stat-eyebrow">Pending Overtime</span>
              </div>
              <div className="stat-value">{pendingOvertimes}</div>
              <div className="stat-meta">
                <span className="stat-foot">Awaiting approval</span>
                <Link href="/dashboard/overtime" className="stat-foot-link">
                  Review <IconArrowRight />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick actions & payroll status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick actions */}
            <div className="lg:col-span-2 surface">
              <div className="stack-sm">
                <span className="t-title-md" style={{ fontSize: "0.9375rem" }}>
                  Quick Actions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <QuickActionCard
                    href="/dashboard/employees/new"
                    label="Add Employee"
                    desc="Register a new team member"
                    svgPaths={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>}
                  />
                  <QuickActionCard
                    href="/dashboard/payroll"
                    label={currentPayrolls > 0 ? "View Payroll" : "Run Payroll"}
                    desc={currentPayrolls > 0 ? `${currentPayrolls} payroll${currentPayrolls > 1 ? 's' : ''} this month` : "Generate this month's payroll"}
                    svgPaths={<><rect x="1" y="5" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="11" x2="23" y2="11" /><circle cx="16" cy="15" r="1" /></>}
                  />
                  <QuickActionCard
                    href="/dashboard/leave"
                    label="Manage Leave"
                    desc={pendingLeaves > 0 ? `${pendingLeaves} pending request${pendingLeaves > 1 ? 's' : ''}` : "View leave requests"}
                    svgPaths={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                  />
                  <QuickActionCard
                    href="/dashboard/documents"
                    label="Generate Documents"
                    desc="Create contracts & letters"
                    svgPaths={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>}
                  />
                </div>
              </div>
            </div>

            {/* Payroll summary */}
            <div className="surface">
              <div className="stack-sm">
                <div className="row-between">
                  <span className="t-title-md" style={{ fontSize: "0.9375rem" }}>
                    Payroll Status
                  </span>
                  <span className="chip" data-tone={currentPayrolls > 0 ? "success" : "warning"}>
                    {currentPayrolls > 0 ? "Completed" : "Pending"}
                  </span>
                </div>
                <div className="stack-sm" style={{ gap: "var(--space-3)" }}>
                  <div className="flex items-center justify-between">
                    <span className="t-label-sm" style={{ textTransform: "none", letterSpacing: 0 }}>Period</span>
                    <span className="t-mono-sm">{new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now)}</span>
                  </div>
                  <div className="halo-divider" />
                  <div className="flex items-center justify-between">
                    <span className="t-label-sm" style={{ textTransform: "none", letterSpacing: 0 }}>Payrolls Generated</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>{currentPayrolls}</span>
                  </div>
                  <div className="halo-divider" />
                  <div className="flex items-center justify-between">
                    <span className="t-label-sm" style={{ textTransform: "none", letterSpacing: 0 }}>Total Employees</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>{employeeCount}</span>
                  </div>
                </div>
                <Link
                  href="/dashboard/payroll"
                  className="btn btn-primary btn-sm"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}
                >
                  Go to Payroll
                  <IconArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {currentTab === "analytics" && <AnalyticsTab />}
      {currentTab === "reports" && <ReportsTab />}
    </div>
  );
}

function QuickActionCard({
  href,
  label,
  desc,
  svgPaths,
}: {
  href: string;
  label: string;
  desc: string;
  svgPaths: React.ReactNode;
}) {
  return (
    <Link href={href} className="quick-action-card">
      <div className="quick-action-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {svgPaths}
        </svg>
      </div>
      <div className="stack-sm" style={{ gap: 4 }}>
        <div className="qa-label">{label}</div>
        <div className="qa-desc">{desc}</div>
      </div>
    </Link>
  );
}

function IconArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
