import prisma from "@/lib/prisma"
import OvertimeTable from "./OvertimeTable"
import OvertimeRequestForm from "./OvertimeRequestForm"
import PageTransition from "@/components/PageTransition"

export default async function OvertimePage() {
  // Sekuensial: pool koneksi DB terbatas (connection_limit=1)
  const requests = await prisma.overtimeRequest.findMany({
    include: {
      employee: {
        select: { id: true, fullName: true, jobTitle: true },
      },
    },
    orderBy: { date: "desc" },
  })
  const employees = await prisma.employee.findMany({
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  })

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
