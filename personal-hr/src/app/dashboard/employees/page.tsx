import prisma from "@/lib/prisma"
import EmployeeTable from "./EmployeeTable"
import ImportEmployeeModal from "./ImportEmployeeModal"
import OnboardingLinksModal from "./OnboardingLinksModal"
import SkillLinksModal from "./SkillLinksModal"
import EmployeeActions from "./EmployeeActions"
import PageTransition from "@/components/PageTransition"

export default async function EmployeesPage() {
  const [employees, masterData] = await Promise.all([
    prisma.employee.findMany({
      include: {
        leaveQuotas: true,
        leaveRequests: { orderBy: { startDate: "desc" } },
        overtimes: { orderBy: { date: "desc" } },
        skills: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.masterData.findMany({ where: { category: "JOB_TITLE" } }),
  ])

  const jobTitleMap = new Map(masterData.map((d) => [d.value, d.label]))

  const links = await prisma.onboardingLink.findMany({ orderBy: { createdAt: "desc" } })
  const skillLinks = await prisma.skillLink.findMany({ orderBy: { createdAt: "desc" } })

  const employeesWithLabels = employees.map((emp) => ({
    ...emp,
    jobTitleLabel: jobTitleMap.get(emp.jobTitle) || emp.jobTitle.replace(/_/g, " "),
  }))

  return (
    <PageTransition>
      <div className="stack-lg">
        <div className="page-header">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">
              {employees.length} employee{employees.length !== 1 ? "s" : ""} · Manage company personnel
            </p>
          </div>
          <EmployeeActions />
        </div>

        <EmployeeTable employees={employeesWithLabels} />

        {/* Hidden Modals */}
        <ImportEmployeeModal />
        <OnboardingLinksModal links={links} />
        <SkillLinksModal links={skillLinks} employees={employees} />
      </div>
    </PageTransition>
  )
}
