import prisma from "@/lib/prisma"
import OvertimePeriodsTable from "./OvertimePeriodsTable"
import CreatePeriodForm from "./CreatePeriodForm"
import PageTransition from "@/components/PageTransition"

export default async function OvertimePeriodsPage() {
  const periods = await prisma.overtimePeriod.findMany({
    include: {
      summaries: {
        include: {
          employee: true
        }
      }
    },
    orderBy: { periodStart: 'desc' }
  })

  return (
    <PageTransition>
      <div className="stack-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Overtime Periods</h1>
            <p className="text-base-content/70">Manage overtime calculation periods (21st - 20th cycle)</p>
          </div>
          <CreatePeriodForm />
        </div>

        <OvertimePeriodsTable initialPeriods={periods} />
      </div>
    </PageTransition>
  )
}
