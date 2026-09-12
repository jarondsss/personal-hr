"use client"

import { useState } from "react"
import Link from "next/link"
import { deleteProject } from "./actions"

const statusConfig: Record<string, { label: string; tone: string }> = {
  PRODUCT:    { label: "Product",    tone: "info" },
  OUTSOURCE:  { label: "Outsource",  tone: "success" },
  WHITELABEL: { label: "Whitelabel", tone: "warning" },
}

export default function ProjectTable({ projects, onRefresh }: { projects: any[]; onRefresh?: () => void }) {
  const [projToDelete, setProjToDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!projToDelete) return
    setIsDeleting(true)
    await deleteProject(projToDelete.id)
    if (onRefresh) onRefresh()
    setIsDeleting(false)
    setProjToDelete(null)
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
                <th>Project</th>
                <th>Client</th>
                <th>Type</th>
                <th>Team</th>
                <th style={{ textAlign: "right", paddingRight: 20 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => {
                const config = statusConfig[proj.status] || { label: proj.status, tone: "neutral" }
                return (
                  <tr key={proj.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                        {proj.projectName}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                      {proj.clientName}
                    </td>
                    <td>
                      <span className="chip" data-tone={config.tone}>
                        {config.label}
                      </span>
                    </td>
                    <td>
                      {proj.members?.length > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {proj.members.slice(0, 4).map((m: any) => (
                            <div
                              key={m.id}
                              title={m.employee.fullName}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                backgroundColor: "var(--color-primary-soft)",
                                border: "1.5px solid var(--color-border-strong)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: "var(--color-primary-hover)",
                                fontFamily: "var(--font-display)",
                                marginLeft: m === proj.members[0] ? 0 : -8,
                                position: "relative",
                              }}
                            >
                              {m.employee.fullName.substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                          {proj.members.length > 4 && (
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: 4 }}>
                              +{proj.members.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>No members</span>
                      )}
                    </td>
                    <td style={{ paddingRight: 20 }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <Link
                          href={`/dashboard/projects/${proj.id}`}
                          style={{
                            padding: "4px 10px",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "var(--color-info)",
                            textDecoration: "none",
                            borderRadius: "var(--radius-xs)",
                            backgroundColor: "var(--color-info-soft)",
                            border: "1px solid var(--color-info-border)",
                          }}
                        >
                          Manage
                        </Link>
                        <button
                          onClick={() => setProjToDelete(proj)}
                          style={{
                            padding: "4px 10px",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "var(--color-danger)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "var(--radius-xs)",
                            transition: "background-color 0.12s",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--color-danger-soft)")}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {projects.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-text-muted)" }}>
            <div style={{ marginBottom: 6, fontSize: "0.9rem" }}>No projects found.</div>
            <div style={{ fontSize: "0.8125rem" }}>Click &ldquo;Add Project&rdquo; to create one.</div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {projToDelete && (
        <div style={modalOverlayStyle} onClick={() => !isDeleting && setProjToDelete(null)}>
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
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-danger-soft)",
                  border: "1px solid var(--color-danger-border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0, marginBottom: 6 }}>
                  Delete Project
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Delete <strong style={{ color: "var(--color-text-primary)" }}>{projToDelete.projectName}</strong>? This will remove all employee assignments.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setProjToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner loading-sm" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
