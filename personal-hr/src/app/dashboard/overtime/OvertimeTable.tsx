"use client"

import { useState } from "react"
import { processOvertimeRequest } from "./actions"

export default function OvertimeTable({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [reqToProcess, setReqToProcess] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (initialRequests !== requests && !isProcessing) {
    setRequests(initialRequests)
  }

  const handleProcess = async () => {
    if (!reqToProcess) return
    setIsProcessing(true)
    const res = await processOvertimeRequest(reqToProcess.id, reqToProcess.action)
    if (res.success) {
      setRequests(requests.map((r) =>
        r.id === reqToProcess.id ? { ...r, status: reqToProcess.action } : r
      ))
    }
    setIsProcessing(false)
    setReqToProcess(null)
  }

  const statusTone = (status: string) => {
    if (status === "APPROVED") return "success"
    if (status === "REJECTED") return "danger"
    return "warning"
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(9,9,11,0.75)",
    backdropFilter: "blur(4px)",
  }

  return (
    <>
      <div className="surface surface-flush">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th>Employee</th>
                <th>Date</th>
                <th>Time</th>
                <th>Hours</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: "right", paddingRight: 20 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                      {req.employee?.fullName || "Unknown Employee"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                      {req.employee?.jobTitle?.replace(/_/g, " ") || "—"}
                    </div>
                  </td>
                  <td style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                    {new Date(req.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </td>
                  <td style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                    {req.startTime} – {req.endTime}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}>
                      {req.durationHours}h
                    </span>
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
                    title={req.reason || "—"}
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
                          onClick={() => setReqToProcess({ id: req.id, action: "APPROVED" })}
                          style={{
                            padding: "4px 10px",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "var(--color-success)",
                            border: "1px solid var(--color-success-border)",
                            cursor: "pointer",
                            borderRadius: "var(--radius-xs)",
                            backgroundColor: "var(--color-success-soft)",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReqToProcess({ id: req.id, action: "REJECTED" })}
                          style={{
                            padding: "4px 10px",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "var(--color-danger)",
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
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            No overtime requests found.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {reqToProcess && (
        <div style={modalOverlayStyle} onClick={() => !isProcessing && setReqToProcess(null)}>
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.70)",
              padding: "var(--space-6)",
              width: "100%",
              maxWidth: 400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 600,
              color: reqToProcess.action === "APPROVED" ? "var(--color-success)" : "var(--color-danger)",
              margin: 0,
              marginBottom: 10,
            }}>
              Confirm {reqToProcess.action === "APPROVED" ? "Approval" : "Rejection"}
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0, marginBottom: 20 }}>
              Are you sure you want to <strong style={{ color: "var(--color-text-primary)" }}>{reqToProcess.action.toLowerCase()}</strong> this overtime request?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setReqToProcess(null)} disabled={isProcessing}>
                Cancel
              </button>
              <button
                className={`btn ${reqToProcess.action === "APPROVED" ? "btn-success" : "btn-error"}`}
                onClick={handleProcess}
                disabled={isProcessing}
                style={{ color: "#fff" }}
              >
                {isProcessing ? <span className="loading loading-spinner loading-sm" /> : `Yes, ${reqToProcess.action === "APPROVED" ? "Approve" : "Reject"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
