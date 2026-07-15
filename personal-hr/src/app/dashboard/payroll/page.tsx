import prisma from "@/lib/prisma"
import PayrollTable from "./PayrollTable"
import PageTransition from "@/components/PageTransition"

export const metadata = {
  title: "Payroll Management | Personal HR",
}

export default async function PayrollPage() {
  const [payrolls, companyProfile] = await Promise.all([
    prisma.payroll.findMany({
      include: {
        employee: {
          select: {
            fullName: true,
            jobTitle: true,
            taxStatus: true,
            bankName: true,
            bankAccount: true,
            npwp: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { employee: { fullName: 'asc' } }
      ]
    }),
    prisma.companyProfile.findFirst()
  ])

  return (
    <PageTransition>
    <div className="stack-lg">
      <div>
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <p className="text-base-content/70">Generate and manage employee salaries</p>
      </div>

      <PayrollTable payrolls={payrolls} companyProfile={companyProfile} />
    </div>
    </PageTransition>
  )
}
