"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { deleteEmployee, deleteEmployees } from "./actions"

export default function EmployeeTable({ employees }: { employees: any[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null)
  const [empToDelete, setEmpToDelete] = useState<any | null>(null)
  const [bulkDelete, setBulkDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "leaves_overtime">("details")
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState(0) // 1 for next, -1 for prev

  const pageSize = 10
  const totalPages = Math.ceil(employees.length / pageSize)
  const activePage = Math.min(currentPage, totalPages || 1)
  const startIndex = (activePage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedEmployees = employees.slice(startIndex, endIndex)

  // Calculate height to prevent layout shifts when shifting pages with fewer rows
  const minHeightClass = "min-h-[480px]"

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const paginatedIds = paginatedEmployees.map(e => e.id)
    const allSelected = paginatedIds.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        paginatedIds.forEach(id => next.delete(id))
      } else {
        paginatedIds.forEach(id => next.add(id))
      }
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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka)
  }

  const handleDelete = async () => {
    if (!empToDelete) return
    setIsDeleting(true)
    await deleteEmployee(empToDelete.id)
    setIsDeleting(false)
    setEmpToDelete(null)
  }

  return (
    <>
      <div className="surface surface-flush overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-6 py-3 bg-base-200 border-b border-border">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <button className="btn btn-xs btn-error" onClick={() => setBulkDelete(true)}>
              Delete Selected
            </button>
          </div>
        )}
        <div className={`overflow-x-auto overflow-y-hidden ${minHeightClass}`}>
          <table className="table w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-10 pl-6">
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={
                        paginatedEmployees.length > 0 &&
                        paginatedEmployees.every(e => selectedIds.has(e.id))
                      }
                      onChange={toggleAll}
                    />
                  </label>
                </th>
                <th>Name</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Join Date</th>
                <th className="pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0, y: direction * 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="border-b border-border last:border-0 hover:bg-base-200/30 transition-colors"
                >
                  <td className="pl-6">
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(emp.id)}
                        onChange={() => toggleSelect(emp.id)}
                      />
                    </label>
                  </td>
                  <td>
                    <div className="font-semibold text-white">{emp.fullName}</div>
                    <div className="text-xs text-white/70 mt-0.5">{emp.email}</div>
                  </td>
                  <td className="text-white">{emp.jobTitleLabel || emp.jobTitle.replace(/_/g, ' ')}</td>
                  <td>
                    <span className="chip" data-tone={emp.status === 'Active' ? 'success' : emp.status === 'DRAFT' ? 'warning' : 'neutral'}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="text-white">{new Date(emp.joinDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                  <td className="pr-6">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="btn btn-xs btn-ghost text-info"
                        onClick={() => setSelectedEmp(emp)}
                      >
                        View
                      </button>
                      <Link
                        href={`/dashboard/employees/${emp.id}/edit`}
                        className="btn btn-xs btn-ghost text-warning"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-xs btn-ghost text-error"
                        onClick={() => setEmpToDelete(emp)}
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

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-base-100">
            <span className="text-sm text-white/70">
              Page {activePage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline rounded-xl"
                disabled={activePage === 1}
                onClick={() => {
                  setDirection(-1);
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  // Smoothly scroll container back to top if scrolled
                  const container = document.querySelector('.overflow-x-auto');
                  if (container) container.scrollTop = 0;
                }}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-primary rounded-xl text-white"
                disabled={activePage === totalPages}
                onClick={() => {
                  setDirection(1);
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  // Smoothly scroll container back to top if scrolled
                  const container = document.querySelector('.overflow-x-auto');
                  if (container) container.scrollTop = 0;
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {employees.length === 0 && (
          <div className="text-center py-12 text-secondary">
            <p>No employees found.</p>
            <p className="text-xs opacity-70 mt-1">Click "Add Employee" to create one.</p>
          </div>
        )}
      </div>

      {/* Modal View Detail */}
      {selectedEmp && (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box max-w-2xl bg-base-100">
            <h3 className="text-xl font-bold border-b border-border pb-3 text-primary">Employee Profile</h3>

            {/* Tabs Navigation */}
            <div className="halo-tabs my-4 relative">
              <button
                className={`halo-tab relative z-10 transition-colors duration-150 ${activeTab === 'details' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                onClick={() => setActiveTab('details')}
                style={{ border: 'none' }}
              >
                Employee Details
                {activeTab === 'details' && (
                  <motion.div
                    layoutId="active-employee-tab"
                    className="absolute inset-0 bg-[var(--color-elevated)] border border-[var(--color-primary)] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                className={`halo-tab relative z-10 transition-colors duration-150 ${activeTab === 'leaves_overtime' ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}
                onClick={() => setActiveTab('leaves_overtime')}
                style={{ border: 'none' }}
              >
                Leave & Overtime
                {activeTab === 'leaves_overtime' && (
                  <motion.div
                    layoutId="active-employee-tab"
                    className="absolute inset-0 bg-[var(--color-elevated)] border border-[var(--color-primary)] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>

            <div className="py-4 space-y-6 min-h-[500px]">
              {activeTab === 'details' ? (
                <>
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-white">
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Full Name</p>
                      <p className="font-semibold text-white text-base">{selectedEmp.fullName}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Job Title</p>
                      <p className="font-semibold text-white text-base">{selectedEmp.jobTitleLabel || selectedEmp.jobTitle.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Email</p>
                      <p className="text-white">{selectedEmp.email}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Status</p>
                      <div>
                        <span className="chip" data-tone={selectedEmp.status === 'Active' ? 'success' : selectedEmp.status === 'DRAFT' ? 'warning' : 'neutral'}>
                          {selectedEmp.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Phone</p>
                      <p className="text-white">{selectedEmp.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Emergency Phone</p>
                      <p className="text-white">{selectedEmp.phone2 || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">ID Card (KTP)</p>
                      <p className="text-white">{selectedEmp.idCardNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Gender</p>
                      <p className="text-white">{selectedEmp.gender || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Birth Place / Date</p>
                      <p className="text-white">{selectedEmp.birthPlace || '-'}, {selectedEmp.birthDate ? new Date(selectedEmp.birthDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Tax Status (PTKP) / NPWP</p>
                      <p className="text-white">{selectedEmp.taxStatus || '-'} / {selectedEmp.npwp || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/60 font-semibold mb-1">Address</p>
                      <p className="text-white">{selectedEmp.address || '-'}</p>
                    </div>
                  </div>

                  <hr className="halo-divider my-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm text-white">
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Salary</p>
                      <p className="font-semibold text-success">{formatRupiah(selectedEmp.salary)} <span className="text-xs font-normal text-white/70">({selectedEmp.salaryType})</span></p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Join Date</p>
                      <p className="text-white">{new Date(selectedEmp.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Contract Start</p>
                      <p className="text-white">{selectedEmp.startContract ? new Date(selectedEmp.startContract).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Contract End</p>
                      <p className="text-white">{selectedEmp.endContract ? new Date(selectedEmp.endContract).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>

                  <hr className="halo-divider my-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm text-white">
                    <div>
                      <p className="text-white/60 font-semibold mb-1">Discord ID</p>
                      <p className="text-white">{selectedEmp.discordId || '-'}</p>
                    </div>
                    <div>
                      <p className="text-white/60 font-semibold mb-1">GitHub Username</p>
                      <p className="text-white">{selectedEmp.githubUsername || '-'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Leave Info */}
                  <div>
                    <h4 className="font-bold text-sm text-white/70 uppercase tracking-wider mb-3">Leave Quotas</h4>
                    {selectedEmp.leaveQuotas && selectedEmp.leaveQuotas.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                        {selectedEmp.leaveQuotas.map((q: any) => (
                          <div key={q.id} className="bg-base-200 p-2 rounded text-xs border border-border text-white">
                            <span className="font-semibold block text-white">{q.leaveType} ({q.year})</span>
                            <span className="text-white/70">Used: {q.used} / {q.quota} days</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/50 mb-4">No leave quotas set.</p>
                    )}

                    <h4 className="font-bold text-sm text-white/70 uppercase tracking-wider mb-2">Leave History</h4>
                    {selectedEmp.leaveRequests && selectedEmp.leaveRequests.length > 0 ? (
                      <div className="overflow-x-auto max-h-[150px] border border-border rounded-lg">
                        <table className="table table-xs table-pin-rows w-full text-white">
                          <thead>
                            <tr className="border-b border-border text-white/70">
                              <th>Type</th>
                              <th>Date Range</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEmp.leaveRequests.map((r: any) => (
                              <tr key={r.id} className="border-b border-border last:border-0">
                                <td className="font-semibold text-white">{r.leaveType}</td>
                                <td className="text-white/70">{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</td>
                                <td>
                                  <span className="chip" data-tone={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">No leave history.</p>
                    )}
                  </div>

                  <hr className="halo-divider my-2" />

                  {/* Overtime Info */}
                  <div>
                    <h4 className="font-bold text-sm text-white/70 uppercase tracking-wider mb-2">Overtime History</h4>
                    {selectedEmp.overtimes && selectedEmp.overtimes.length > 0 ? (
                      <div className="overflow-x-auto max-h-[200px] border border-border rounded-lg">
                        <table className="table table-xs table-pin-rows w-full text-white">
                          <thead>
                            <tr className="border-b border-border text-white/70">
                              <th>Date</th>
                              <th>Duration</th>
                              <th>Hours</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEmp.overtimes.map((o: any) => (
                              <tr key={o.id} className="border-b border-border last:border-0">
                                <td className="text-white">{new Date(o.date).toLocaleDateString()}</td>
                                <td className="text-white/70">{o.startTime} - {o.endTime}</td>
                                <td className="text-white/70">{o.durationHours} hrs</td>
                                <td>
                                  <span className="chip" data-tone={o.status === 'APPROVED' ? 'success' : o.status === 'REJECTED' ? 'danger' : 'warning'}>
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">No overtime history.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => { setSelectedEmp(null); setActiveTab("details"); }}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setSelectedEmp(null); setActiveTab("details"); }}>
            <button>close</button>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {empToDelete && (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box">
            <h3 className="text-lg font-bold text-error">Warning: Delete Employee</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{empToDelete.fullName}</strong>?
              <br />
              <span className="text-sm opacity-70">This action cannot be undone and will remove all their related data (projects, leaves, overtimes).</span>
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEmpToDelete(null)} disabled={isDeleting}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner"></span> : 'Yes, Delete'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isDeleting && setEmpToDelete(null)}>
            <button>close</button>
          </div>
        </div>
      )}

      {/* Modal Confirm Bulk Delete */}
      {bulkDelete && (
        <div className="modal modal-open" role="dialog">
          <div className="modal-box">
            <h3 className="text-lg font-bold text-error">Warning: Delete {selectedIds.size} Employees</h3>
            <p className="py-4">
              Are you sure you want to delete these <strong>{selectedIds.size} employees</strong>?
              <br />
              <span className="text-sm opacity-70">This action cannot be undone and will remove all related data.</span>
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setBulkDelete(false)} disabled={isDeleting}>Cancel</button>
              <button className="btn btn-error" onClick={handleBulkDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner"></span> : 'Yes, Delete All'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !isDeleting && setBulkDelete(false)}>
            <button>close</button>
          </div>
        </div>
      )}
    </>
  )
}
