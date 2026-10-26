import prisma from "@/lib/prisma"
import { getCachedCompanyProfile } from "@/lib/cache"
import PayrollTable from "./PayrollTable"
import PageTransition from "@/components/PageTransition"

export const metadata = {
  title: "Payroll Management | Personal HR",
}

export default async function PayrollPage() {
  // Parallel queries with limit to recent payrolls + cached company profile
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Only fetch payrolls from last 12 months
  const yearThreshold = currentMonth < 12 ? currentYear - 1 : currentYear;
  const monthThreshold = currentMonth < 12 ? currentMonth : 1;

  const [payrolls, companyProfile] = await Promise.all([
    prisma.payroll.findMany({
      where: {
        OR: [
          { year: { gte: yearThreshold } },
        ],
      },
      include: {
        employee: {
          select: {
            fullName: true,
            jobTitle: true,
            taxStatus: true,
            bankName: true,
            bankAccount: true,
            npwp: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { employee: { fullName: "asc" } },
      ],
      take: 500, // Reasonable limit
    }),
    getCachedCompanyProfile(), // Cached for 1 hour
  ]);

  return (
    <PageTransition>
      <div className="stack-lg">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payroll Management</h1>
            <p className="page-subtitle">Generate and manage employee salaries</p>
          </div>
        </div>

        <PayrollTable payrolls={payrolls} companyProfile={companyProfile} />
      </div>
    </PageTransition>
  )
}
