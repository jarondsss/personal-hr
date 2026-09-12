"use client"

import { useState, useEffect, useTransition } from "react"
import { createProject } from "./actions"
import ProjectTable from "./ProjectTable"
import PageTransition from "@/components/PageTransition"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await fetch("/api/projects")
    if (res.ok) {
      const data = await res.json()
      setProjects(data)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    await createProject(formData)
    await fetchProjects()
    setShowModal(false)
    const form = document.getElementById("add_project_form") as HTMLFormElement
    if (form) form.reset()
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
    <PageTransition>
      <div className="stack-lg">
        <div className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">
              {projects.length} project{projects.length !== 1 ? "s" : ""} · Manage client engagements
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Project
          </button>
        </div>

        <ProjectTable projects={projects} onRefresh={fetchProjects} />

        {/* Add Project Modal */}
        {showModal && (
          <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-strong)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.70)",
                padding: "var(--space-6)",
                width: "100%",
                maxWidth: 440,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
                  Add New Project
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4, borderRadius: "var(--radius-xs)", display: "flex" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form id="add_project_form" action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="label-text">Project Name *</label>
                  <input type="text" name="projectName" className="input input-bordered w-full" required style={{ height: 38 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="label-text">Client Name *</label>
                  <input type="text" name="clientName" className="input input-bordered w-full" required style={{ height: 38 }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="label-text">Project Type *</label>
                  <select name="status" className="select select-bordered w-full" defaultValue="PRODUCT" required style={{ height: 38 }}>
                    <option value="PRODUCT">Product (Internal)</option>
                    <option value="OUTSOURCE">Outsource (Dedicated)</option>
                    <option value="WHITELABEL">Whitelabel (Project Based)</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid var(--color-border)", marginTop: 4 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
