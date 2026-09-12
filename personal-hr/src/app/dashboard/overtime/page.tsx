import prisma from "@/lib/prisma"
import OvertimeTable from "./OvertimeTable"
import OvertimeRequestForm from "./OvertimeRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function OvertimePage() {
  const [requests, employees] = await Promise.all([
    prisma.overtimeRequest.findMany({
      include: { employee: true },
      orderBy: { date: "desc" },
    }),
    prisma.employee.findMany({ orderBy: { fullName: "asc" } }),
  ])

  const pending = requests.filter((r) => r.status === "PENDING").length

  return (
    <PageTransition>
      <div className="stack-lg">
        <div className="page-header">
          <div>
            <h1 className="page-title">Overtime Requests</h1>
            <p className="page-subtitle">
              {requests.length} request{requests.length !== 1 ? "s" : ""}
              {pending > 0 && (
                <span style={{ color: "var(--color-warning)", marginLeft: 6 }}>
                  · {pending} pending
                </span>
              )}
            </p>
          </div>
          <OvertimeRequestForm employees={employees} />
        </div>

        <OvertimeTable initialRequests={requests} />
      </div>
    </PageTransition>
  )
}
