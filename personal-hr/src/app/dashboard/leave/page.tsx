import prisma from "@/lib/prisma"
import LeaveTable from "./LeaveTable"
import LeaveRequestForm from "./LeaveRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function LeavePage() {
  const [requests, employees, leaveTypes] = await Promise.all([
    prisma.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({ orderBy: { fullName: "asc" } }),
    prisma.masterData.findMany({
      where: { category: "LEAVE_TYPE" },
      orderBy: { label: "asc" },
    }),
  ])

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
