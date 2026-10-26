import prisma from "@/lib/prisma"
import { getCachedJobTitleData } from "@/lib/cache"
import EmployeeTable from "./EmployeeTable"
import ImportEmployeeModal from "./ImportEmployeeModal"
import OnboardingLinksModal from "./OnboardingLinksModal"
import SkillLinksModal from "./SkillLinksModal"
import EmployeeActions from "./EmployeeActions"
import PageTransition from "@/components/PageTransition"

export default async function EmployeesPage() {
  // Parallel queries with optimized selects + caching
  const [employees, jobTitleData, links, skillLinks] = await Promise.all([
    prisma.employee.findMany({
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        phone: true,
        phone2: true,
        discordId: true,
        githubUsername: true,
        jobTitle: true,
        status: true,
        isActive: true,
        salary: true,
        salaryType: true,
        joinDate: true,
        startContract: true,
        endContract: true,
        birthPlace: true,
        birthDate: true,
        gender: true,
        idCardNumber: true,
        npwp: true,
        bankName: true,
        bankAccount: true,
        taxStatus: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            leaveQuotas: true,
            leaveRequests: true,
            overtimes: true,
            skills: true,
          },
        },
      },
      orderBy: { fullName: "asc" },
    }),
    getCachedJobTitleData(), // Cached for 1 hour - returns array
    prisma.onboardingLink.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.skillLink.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  // Convert to Map in memory
  const jobTitleMap = new Map(jobTitleData.map((d) => [d.value, d.label]));

  // Fetch skills separately to avoid N+1
  const employeeIds = employees.map((e) => e.id);
  const skills = await prisma.employeeSkill.findMany({
    where: { employeeId: { in: employeeIds } },
    orderBy: { createdAt: "asc" },
  });

  // Map skills to employees
  const skillsByEmployee = new Map<string, typeof skills>();
  for (const skill of skills) {
    const empSkills = skillsByEmployee.get(skill.employeeId) || [];
    empSkills.push(skill);
    skillsByEmployee.set(skill.employeeId, empSkills);
  }

  const employeesWithLabels = employees.map((emp) => ({
    ...emp,
    jobTitleLabel: jobTitleMap.get(emp.jobTitle) || emp.jobTitle.replace(/_/g, " "),
    skills: skillsByEmployee.get(emp.id) || [],
    leaveQuotas: [], // Not needed for table view
    leaveRequests: [], // Not needed for table view
    overtimes: [], // Not needed for table view
  }));

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
