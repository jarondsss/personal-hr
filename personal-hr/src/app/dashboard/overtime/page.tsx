import prisma from "@/lib/prisma"
import OvertimeTable from "./OvertimeTable"
import OvertimeRequestForm from "./OvertimeRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function OvertimePage() {
  const [requests, employees] = await Promise.all([
    prisma.overtimeRequest.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' }
    }),
    prisma.employee.findMany({
      orderBy: { fullName: 'asc' }
    })
  ])

  return (
    <PageTransition>
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Overtime Requests</h1>
          <p className="text-base-content/70">Manage employee overtime (lembur)</p>
        </div>
        <OvertimeRequestForm employees={employees} />
      </div>

      <OvertimeTable initialRequests={requests} />
    </div>
    </PageTransition>
  )
}
