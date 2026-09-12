"use client"

import { processLeaveRequest } from "./actions"

export default function LeaveTable({ initialRequests: requests }: { initialRequests: any[] }) {
  const handleProcess = async (id: string, action: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this leave request?`)) return
    await processLeaveRequest(id, action)
  }

  const statusTone = (status: string) => {
    if (status === "APPROVED") return "success"
    if (status === "REJECTED") return "danger"
    return "warning"
  }

  return (
    <div className="surface surface-flush">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Date Range</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ textAlign: "right", paddingRight: 20 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <td>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                    {req.employee?.fullName || "Unknown Employee"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                    {req.employee?.jobTitle?.replace(/_/g, " ") || "—"}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {req.leaveType.replace(/_/g, " ")}
                  </span>
                </td>
                <td style={{ whiteSpace: "nowrap", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                  {new Date(req.startDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                    to {new Date(req.endDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </div>
                </td>
                <td
                  style={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                  }}
                  title={req.reason}
                >
                  {req.reason || "—"}
                </td>
                <td>
                  <span className="chip" data-tone={statusTone(req.status)}>
                    {req.status}
                  </span>
                </td>
                <td style={{ paddingRight: 20 }}>
                  {req.status === "PENDING" ? (
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleProcess(req.id, "APPROVED")}
                        style={{
                          padding: "4px 10px",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "var(--color-success)",
                          background: "none",
                          border: "1px solid var(--color-success-border)",
                          cursor: "pointer",
                          borderRadius: "var(--radius-xs)",
                          transition: "background-color 0.12s",
                          backgroundColor: "var(--color-success-soft)",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcess(req.id, "REJECTED")}
                        style={{
                          padding: "4px 10px",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "var(--color-danger)",
                          background: "none",
                          border: "1px solid var(--color-danger-border)",
                          cursor: "pointer",
                          borderRadius: "var(--radius-xs)",
                          backgroundColor: "var(--color-danger-soft)",
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right", display: "block" }}>
                      Processed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "var(--color-text-muted)",
          }}
        >
          <div style={{ marginBottom: 6, fontSize: "0.9rem" }}>No leave requests found.</div>
        </div>
      )}
    </div>
  )
}
