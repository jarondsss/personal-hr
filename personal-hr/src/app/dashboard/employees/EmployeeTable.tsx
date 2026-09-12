"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { deleteEmployee, deleteEmployees, deleteEmployeeSkill, addEmployeeSkill, toggleEmployeeStatus } from "./actions"
import { Trash2, Plus } from "lucide-react"

export default function EmployeeTable({ employees: initialEmployees }: { employees: any[] }) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null)
  const [empToDelete, setEmpToDelete] = useState<any | null>(null)
  const [bulkDelete, setBulkDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"details" | "leaves_overtime">("details")
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState("INTERMEDIATE")
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState(0)

  const pageSize = 10
  const totalPages = Math.ceil(employees.length / pageSize)
  const activePage = Math.min(currentPage, totalPages || 1)
  const startIndex = (activePage - 1) * pageSize
  const paginatedEmployees = employees.slice(startIndex, startIndex + pageSize)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const paginatedIds = paginatedEmployees.map((e) => e.id)
    const allSelected = paginatedIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) paginatedIds.forEach((id) => next.delete(id))
      else paginatedIds.forEach((id) => next.add(id))
      return next
    })
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    await deleteEmployees(Array.from(selectedIds))
    setIsDeleting(false)
    setBulkDelete(false)
    setSelectedIds(new Set())
  }

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka)

  const handleDelete = async () => {
    if (!empToDelete) return
    setIsDeleting(true)
    await deleteEmployee(empToDelete.id)
    setIsDeleting(false)
    setEmpToDelete(null)
  }

  const handleToggleStatus = async (emp: any) => {
    setTogglingId(emp.id)
    const result = await toggleEmployeeStatus(emp.id, emp.isActive)
    if (result.success) {
      setEmployees((prev: any[]) =>
        prev.map((e: any) => e.id === emp.id ? { ...e, isActive: result.newIsActive } : e)
      )
    }
    setTogglingId(null)
  }

  const empTypeTone = (status: string) => {
    const s = status?.toLowerCase()
    if (s === "fulltime" || s === "full time" || s === "full-time") return "info"
    if (s === "intern" || s === "internship" || s === "magang") return "warning"
    if (s === "freelance" || s === "freelancer" || s === "part time" || s === "parttime") return "success"
    return "neutral"
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

  const modalBoxStyle: React.CSSProperties = {
    backgroundColor: "var(--color-surface)",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.04)",
    padding: "var(--space-6)",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  }

  return (
    <>
      <div className="surface surface-flush">
        {/* Bulk selection bar */}
        {selectedIds.size > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 20px",
              backgroundColor: "var(--color-primary-soft)",
              borderBottom: "1px solid var(--color-primary-border)",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 500, color: "var(--color-primary-hover)" }}>
              {selectedIds.size} employee{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <button
              className="btn btn-xs btn-error"
              onClick={() => setBulkDelete(true)}
              style={{ fontSize: 12 }}
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto" style={{ minHeight: 460 }}>
          <table className="table w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                <th style={{ width: 44, paddingLeft: 20 }}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={paginatedEmployees.length > 0 && paginatedEmployees.every((e) => selectedIds.has(e.id))}
                      onChange={toggleAll}
                    />
                  </label>
                </th>
                <th>Name</th>
                <th>Job Title</th>
                <th>Type</th>
                <th>Active</th>
                <th>Join Date</th>
                <th style={{ paddingRight: 20, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: direction * 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td style={{ paddingLeft: 20 }}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(emp.id)}
                        onChange={() => toggleSelect(emp.id)}
                      />
                    </label>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
                      {emp.fullName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                      {emp.email}
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    {emp.jobTitleLabel || emp.jobTitle.replace(/_/g, " ")}
                  </td>
                  {/* Employment Type */}
                  <td>
                    <span className="chip" data-tone={empTypeTone(emp.status)}>
                      {emp.status || "—"}
                    </span>
                  </td>
                  {/* Active / Inactive */}
                  <td>
                    <span
                      className="chip"
                      data-tone={emp.isActive ? "success" : "danger"}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    {new Date(emp.joinDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </td>
                  <td style={{ paddingRight: 20 }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>
                      <button
                        onClick={() => setSelectedEmp(emp)}
                        style={{
                          padding: "4px 10px",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "var(--color-info)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: "var(--radius-xs)",
                          transition: "background-color 0.12s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--color-info-soft)")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        View
                      </button>
                      <Link
                        href={`/dashboard/employees/${emp.id}/edit`}
                        style={{
                          padding: "4px 10px",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "var(--color-warning)",
                          textDecoration: "none",
                          borderRadius: "var(--radius-xs)",
                          transition: "background-color 0.12s",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--color-warning-soft)")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        Edit
                      </Link>
                      {/* Toggle Active/Inactive */}
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        disabled={togglingId === emp.id}
                        title={emp.isActive ? "Set Inactive" : "Set Active"}
                        style={{
                          padding: "4px 10px",
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: emp.isActive ? "var(--color-warning)" : "var(--color-success)",
                          background: "none",
                          border: "none",
                          cursor: togglingId === emp.id ? "not-allowed" : "pointer",
                          borderRadius: "var(--radius-xs)",
                          transition: "background-color 0.12s",
                          opacity: togglingId === emp.id ? 0.6 : 1,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        onMouseOver={(e) => {
                          if (togglingId !== emp.id) {
                            e.currentTarget.style.backgroundColor = emp.isActive
                              ? "var(--color-warning-soft)"
                              : "var(--color-success-soft)"
                          }
                        }}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {togglingId === emp.id ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : emp.isActive ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                            Deactivate
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEmpToDelete(emp)}
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
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {employees.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--color-text-muted)",
            }}
          >
            <div style={{ marginBottom: 8, fontSize: "0.9rem" }}>No employees found.</div>
            <div style={{ fontSize: "0.8125rem" }}>Click &ldquo;Add Employee&rdquo; to get started.</div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderTop: "1px solid var(--color-border)",
              backgroundColor: "var(--color-elevated)",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              Page {activePage} of {totalPages} &middot; {employees.length} employees
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn btn-sm btn-outline"
                disabled={activePage === 1}
                onClick={() => { setDirection(-1); setCurrentPage((p) => Math.max(p - 1, 1)) }}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-primary"
                disabled={activePage === totalPages}
                onClick={() => { setDirection(1); setCurrentPage((p) => Math.min(p + 1, totalPages)) }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          Modal: View Employee Detail
      ══════════════════════════════════════════ */}
      {selectedEmp && (
        <div style={modalOverlayStyle} onClick={() => { setSelectedEmp(null); setActiveTab("details"); setNewSkill("") }}>
          <div style={{ ...modalBoxStyle, maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
                  Employee Profile
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: "3px 0 0" }}>
                  {selectedEmp.fullName}
                </p>
              </div>
              <button
                onClick={() => { setSelectedEmp(null); setActiveTab("details"); setNewSkill("") }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4, borderRadius: "var(--radius-xs)", display: "flex" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="halo-tabs" style={{ marginBottom: 20 }}>
              {(["details", "leaves_overtime"] as const).map((tab) => (
                <button
                  key={tab}
                  className="halo-tab"
                  style={{
                    color: activeTab === tab ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    backgroundColor: activeTab === tab ? "var(--color-surface)" : "transparent",
                    boxShadow: activeTab === tab ? "var(--shadow-xs)" : "none",
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "details" ? "Details" : "Leave & Overtime"}
                </button>
              ))}
            </div>

            {/* Details tab */}
            {activeTab === "details" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
                  {[
                    { label: "Full Name", value: selectedEmp.fullName },
                    { label: "Job Title", value: selectedEmp.jobTitleLabel || selectedEmp.jobTitle.replace(/_/g, " ") },
                    { label: "Email", value: selectedEmp.email },
                    { label: "Employment Type", value: <span className="chip" data-tone={empTypeTone(selectedEmp.status)}>{selectedEmp.status || "—"}</span> },
                    { label: "Active Status", value: <span className="chip" data-tone={selectedEmp.isActive ? "success" : "danger"}>{selectedEmp.isActive ? "Active" : "Inactive"}</span> },
                    { label: "Phone", value: selectedEmp.phone || "—" },
                    { label: "Emergency Phone", value: selectedEmp.phone2 || "—" },
                    { label: "ID Card (KTP)", value: selectedEmp.idCardNumber || "—" },
                    { label: "Gender", value: selectedEmp.gender || "—" },
                    { label: "Birth Place / Date", value: `${selectedEmp.birthPlace || "—"}, ${selectedEmp.birthDate ? new Date(selectedEmp.birthDate).toLocaleDateString() : "—"}` },
                    { label: "Tax Status / NPWP", value: `${selectedEmp.taxStatus || "—"} / ${selectedEmp.npwp || "—"}` },
                  ].map((field) => (
                    <div key={field.label}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 4 }}>
                        {field.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 4 }}>
                      Address
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                      {selectedEmp.address || "—"}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, backgroundColor: "var(--color-border)" }} />

                {/* Salary & contract */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
                  {[
                    { label: "Salary", value: <><span style={{ color: "var(--color-success)", fontWeight: 600 }}>{formatRupiah(selectedEmp.salary)}</span> <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>({selectedEmp.salaryType})</span></> },
                    { label: "Join Date", value: new Date(selectedEmp.joinDate).toLocaleDateString() },
                    { label: "Contract Start", value: selectedEmp.startContract ? new Date(selectedEmp.startContract).toLocaleDateString() : "—" },
                    { label: "Contract End", value: selectedEmp.endContract ? new Date(selectedEmp.endContract).toLocaleDateString() : "—" },
                    { label: "Discord ID", value: selectedEmp.discordId || "—" },
                    { label: "GitHub Username", value: selectedEmp.githubUsername || "—" },
                  ].map((field) => (
                    <div key={field.label}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 4 }}>
                        {field.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, backgroundColor: "var(--color-border)" }} />

                {/* Skills */}
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
                    Skills
                  </div>
                  {selectedEmp.skills?.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {selectedEmp.skills.map((s: any) => (
                        <span key={s.id} className="chip" data-tone={s.level === "EXPERT" || s.level === "ADVANCED" ? "success" : "neutral"} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {s.skill}
                          <span style={{ opacity: 0.6, textTransform: "none", fontWeight: 400 }}>· {s.level.toLowerCase()}</span>
                          <button
                            type="button"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex", opacity: 0.6, marginLeft: 2 }}
                            onClick={async () => {
                              await deleteEmployeeSkill(s.id)
                              setSelectedEmp((prev: any) => prev ? { ...prev, skills: prev.skills.filter((sk: any) => sk.id !== s.id) } : null)
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: 12 }}>No skills submitted.</p>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="Add skill..."
                      value={newSkill}
                      style={{ flex: 1, height: 34, fontSize: "0.875rem" }}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && newSkill.trim()) {
                          e.preventDefault()
                          await addEmployeeSkill(selectedEmp.id, newSkill, newSkillLevel)
                          setSelectedEmp((prev: any) => prev ? { ...prev, skills: [...(prev.skills || []), { id: `temp-${Date.now()}`, skill: newSkill.trim(), level: newSkillLevel }] } : null)
                          setNewSkill("")
                        }
                      }}
                    />
                    <select
                      className="select select-bordered"
                      value={newSkillLevel}
                      style={{ width: 130, height: 34, fontSize: "0.875rem" }}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!newSkill.trim()}
                      style={{ height: 34, minHeight: 34, padding: "0 12px" }}
                      onClick={async () => {
                        if (!newSkill.trim()) return
                        await addEmployeeSkill(selectedEmp.id, newSkill, newSkillLevel)
                        setSelectedEmp((prev: any) => prev ? { ...prev, skills: [...(prev.skills || []), { id: `temp-${Date.now()}`, skill: newSkill.trim(), level: newSkillLevel }] } : null)
                        setNewSkill("")
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Leave & Overtime tab */}
            {activeTab === "leaves_overtime" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Leave quotas */}
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
                    Leave Quotas
                  </h4>
                  {selectedEmp.leaveQuotas?.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 4 }}>
                      {selectedEmp.leaveQuotas.map((q: any) => (
                        <div
                          key={q.id}
                          style={{
                            padding: "10px 12px",
                            backgroundColor: "var(--color-elevated)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 3 }}>
                            {q.leaveType}
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 400, marginLeft: 4 }}>
                              ({q.year})
                            </span>
                          </div>
                          <div style={{ color: "var(--color-text-secondary)" }}>
                            Used: <strong>{q.used}</strong> / {q.quota} days
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>No leave quotas set.</p>
                  )}
                </div>

                {/* Leave history */}
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
                    Leave History
                  </h4>
                  {selectedEmp.leaveRequests?.length > 0 ? (
                    <div style={{ overflowX: "auto", maxHeight: 160, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                      <table className="table table-xs w-full">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Date Range</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmp.leaveRequests.map((r: any) => (
                            <tr key={r.id}>
                              <td style={{ color: "var(--color-text-primary)" }}>{r.leaveType}</td>
                              <td style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>
                                {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                              </td>
                              <td>
                                <span className="chip" data-tone={r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "danger" : "warning"}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>No leave history.</p>
                  )}
                </div>

                <div style={{ height: 1, backgroundColor: "var(--color-border)" }} />

                {/* Overtime history */}
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 10 }}>
                    Overtime History
                  </h4>
                  {selectedEmp.overtimes?.length > 0 ? (
                    <div style={{ overflowX: "auto", maxHeight: 200, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                      <table className="table table-xs w-full">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Hours</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmp.overtimes.map((o: any) => (
                            <tr key={o.id}>
                              <td style={{ color: "var(--color-text-primary)" }}>{new Date(o.date).toLocaleDateString()}</td>
                              <td style={{ color: "var(--color-text-secondary)", fontSize: "0.75rem" }}>{o.startTime} – {o.endTime}</td>
                              <td style={{ color: "var(--color-text-secondary)" }}>{o.durationHours} hrs</td>
                              <td>
                                <span className="chip" data-tone={o.status === "APPROVED" ? "success" : o.status === "REJECTED" ? "danger" : "warning"}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>No overtime history.</p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
              <button
                className="btn btn-outline"
                onClick={() => { setSelectedEmp(null); setActiveTab("details"); setNewSkill("") }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          Modal: Confirm Delete
      ══════════════════════════════════════════ */}
      {empToDelete && (
        <div style={modalOverlayStyle} onClick={() => !isDeleting && setEmpToDelete(null)}>
          <div style={{ ...modalBoxStyle, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-danger-soft)",
                  border: "1px solid var(--color-danger-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0, marginBottom: 6 }}>
                  Delete Employee
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Are you sure you want to delete <strong style={{ color: "var(--color-text-primary)" }}>{empToDelete.fullName}</strong>? This will permanently remove all related data.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setEmpToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner loading-sm" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {bulkDelete && (
        <div style={modalOverlayStyle} onClick={() => !isDeleting && setBulkDelete(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
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
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-primary)", margin: 0, marginBottom: 6 }}>
                  Delete {selectedIds.size} Employees
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  This action cannot be undone and will remove all related data for the selected employees.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setBulkDelete(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleBulkDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner loading-sm" /> : `Delete ${selectedIds.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
