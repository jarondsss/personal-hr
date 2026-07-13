import prisma from "@/lib/prisma"
import EmployeeTable from "./EmployeeTable"
import ImportEmployeeModal from "./ImportEmployeeModal"
import OnboardingLinksModal from "./OnboardingLinksModal"
import EmployeeActions from "./EmployeeActions"
import PageTransition from "@/components/PageTransition"

export default async function EmployeesPage() {
  const [employees, masterData] = await Promise.all([
    prisma.employee.findMany({
      include: {
        leaveQuotas: true,
        leaveRequests: {
          orderBy: { startDate: 'desc' }
        },
        overtimes: {
          orderBy: { date: 'desc' }
        }
      },
      orderBy: { fullName: 'asc' }
    }),
    prisma.masterData.findMany({
      where: { category: 'JOB_TITLE' }
    })
  ])

  // Create a map for job title values to labels
  const jobTitleMap = new Map(masterData.map(d => [d.value, d.label]))

  const links = await prisma.onboardingLink.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Map employees to include job title label
  const employeesWithLabels = employees.map(emp => ({
    ...emp,
    jobTitleLabel: jobTitleMap.get(emp.jobTitle) || emp.jobTitle.replace(/_/g, ' ')
  }))

  return (
    <PageTransition>
    <div className="stack-lg">
      <div className="row-between">
        <div className="stack-sm">
          <h1 className="t-headline-lg" style={{ fontSize: "1.75rem" }}>
            Employees
          </h1>
          <p className="t-body-sm" style={{ marginTop: 2 }}>
            Manage your company personnel
          </p>
        </div>
        <EmployeeActions />
      </div>

      <EmployeeTable employees={employeesWithLabels} />

      {/* Hidden Modals */}
      <ImportEmployeeModal />
      <OnboardingLinksModal links={links} />
    </div>
    </PageTransition>
  )
}
