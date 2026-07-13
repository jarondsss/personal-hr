import prisma from "@/lib/prisma"
import LeaveTable from "./LeaveTable"
import LeaveRequestForm from "./LeaveRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function LeavePage() {
  const [requests, employees, leaveTypes] = await Promise.all([
    prisma.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.employee.findMany({
      orderBy: { fullName: 'asc' }
    }),
    prisma.masterData.findMany({
      where: { category: 'LEAVE_TYPE' },
      orderBy: { label: 'asc' }
    })
  ])

  return (
    <PageTransition>
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <p className="text-base-content/70">Manage employee time-off requests</p>
        </div>
        <LeaveRequestForm employees={employees} leaveTypes={leaveTypes} />
      </div>

      <LeaveTable initialRequests={requests} />
    </div>
    </PageTransition>
  )
}
