import prisma from "@/lib/prisma"
import LeaveTable from "./LeaveTable"
import LeaveRequestForm from "./LeaveRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function LeavePage() {
  // Sekuensial: pool koneksi DB terbatas (connection_limit=1)
  const requests = await prisma.leaveRequest.findMany({
    include: {
      employee: {
        select: { id: true, fullName: true, jobTitle: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  })
  const leaveTypes = await prisma.masterData.findMany({
    where: { category: "LEAVE_TYPE" },
    orderBy: { label: "asc" },
  })

  const pending = requests.filter((r) => r.status === "PENDING").length

  return (
    <PageTransition>
      <div className="stack-lg">
        <div className="page-header">
          <div>
            <h1 className="page-title">Leave Requests</h1>
            <p className="page-subtitle">
              {requests.length} request{requests.length !== 1 ? "s" : ""}
              {pending > 0 && (
                <span style={{ color: "var(--color-warning)", marginLeft: 6 }}>
                  · {pending} pending
                </span>
              )}
            </p>
          </div>
          <LeaveRequestForm employees={employees} leaveTypes={leaveTypes} />
        </div>

        <LeaveTable initialRequests={requests} />
      </div>
    </PageTransition>
  )
}
