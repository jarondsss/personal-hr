"use client"

import { useState } from "react"
import Link from "next/link"
import { deleteProject } from "./actions"

export default function ProjectTable({ projects, onRefresh }: { projects: any[], onRefresh?: () => void }) {
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PRODUCT': return 'badge-primary'
      case 'OUTSOURCE': return 'badge-secondary'
      case 'WHITELABEL': return 'badge-accent'
      default: return 'badge-ghost'
    }
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200 text-base-content">
                <tr>
                  <th>Project Name</th>
                  <th>Client Name</th>
                  <th>Status</th>
                  <th>Members</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id}>
                    <td className="font-bold">{proj.projectName}</td>
                    <td>{proj.clientName}</td>
                    <td>
                      <div className={`badge ${getStatusColor(proj.status)} badge-outline text-xs`}>
                        {proj.status}
                      </div>
                    </td>
                    <td>
                      <div className="avatar-group -space-x-4 rtl:space-x-reverse">
                        {proj.members.slice(0, 3).map((m: any) => (
                          <div key={m.id} className="avatar placeholder" title={m.employee.fullName}>
                            <div className="bg-neutral text-neutral-content w-8 h-8 rounded-full">
                              <span className="text-xs">{m.employee.fullName.substring(0, 2).toUpperCase()}</span>
                            </div>
                          </div>
                        ))}
                        {proj.members.length > 3 && (
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content w-8 h-8 rounded-full">
                              <span className="text-xs">+{proj.members.length - 3}</span>
                            </div>
                          </div>
                        )}
                        {proj.members.length === 0 && <span className="text-sm opacity-50">No members</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link 
                          href={`/dashboard/projects/${proj.id}`}
                          className="btn btn-xs btn-ghost text-info"
                        >
                          Manage
                        </Link>
                        <button 
                          className="btn btn-xs btn-ghost text-error"
                          onClick={() => setProjToDelete(proj)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {projects.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              <p>No projects found.</p>
              <p className="text-sm">Click "Add Project" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {projToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold text-error">Warning: Delete Project</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>{projToDelete.projectName}</strong>? 
              This will remove all employee assignments to this project.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setProjToDelete(null)} disabled={isDeleting}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loading loading-spinner"></span> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
