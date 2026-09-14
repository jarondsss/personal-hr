import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
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
  let analyticsEmployees: { salary: number; jobTitle: string; status: string }[] = [];
  let analyticsProjects: { id: string; _count: { members: number } }[] = [];
  let analyticsJobTitles: { value: string; label: string }[] = [];
  let payrollMonths: {
    month: number;
    year: number;
    _count: { id: number };
    _sum: { basicSalary: number | null; overtimePay: number | null; deductions: number | null; netSalary: number | null };
  }[] = [];

  try {
    [
      employeeCount,
      activeProjects,
      pendingLeaves,
      pendingOvertimes,
      expiringContracts,
      analyticsEmployees,
      analyticsProjects,
      analyticsJobTitles,
      payrollMonths,
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
      prisma.employee.findMany({
        select: { salary: true, jobTitle: true, status: true },
      }),
      prisma.project.findMany({
        select: { id: true, _count: { select: { members: true } } },
      }),
      prisma.masterData.findMany({
        where: { category: "JOB_TITLE" },
        select: { value: true, label: true },
      }),
      prisma.payroll.groupBy({
        by: ["month", "year"],
        _count: { id: true },
        _sum: { basicSalary: true, overtimePay: true, deductions: true, netSalary: true },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
    ]);
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
  }

  const dbError =
    !expiringContracts.length && employeeCount === 0 && pendingLeaves === 0 && pendingOvertimes === 0;

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
    <DashboardClient
      stats={stats}
      quickActions={quickActions}
      soonExpiring={soonExpiring}
      dbError={dbError}
      analytics={{
        employees: analyticsEmployees,
        projects: analyticsProjects,
        jobTitleMap: analyticsJobTitles.map((d) => [d.value, d.label]),
      }}
      reports={{ payrollMonths }}
    />
  );
}
