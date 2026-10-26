import prisma from "@/lib/prisma"
import { getCachedActiveEmployees, getCachedMasterData } from "@/lib/cache"
import LeaveTable from "./LeaveTable"
import LeaveRequestForm from "./LeaveRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function LeavePage() {
  // Parallel queries - fetch recent leave requests only + cached data
  const [requests, employees, leaveTypes] = await Promise.all([
    prisma.leaveRequest.findMany({
      include: {
        employee: {
          select: { id: true, fullName: true, jobTitle: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Reasonable limit
    }),
    getCachedActiveEmployees(), // Cached for 5 minutes
    getCachedMasterData('LEAVE_TYPE'), // Cached for 1 hour
  ]);

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
