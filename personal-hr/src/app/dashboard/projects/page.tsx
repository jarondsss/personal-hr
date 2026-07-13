"use client"

import { useState, useEffect, useTransition } from "react"
import { createProject } from "./actions"
import ProjectTable from "./ProjectTable"
import PageTransition from "@/components/PageTransition"

// We fetch data in a separate Server Component wrapper to keep things clean
export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isPending, startTransition] = useTransition()

  // Polling / fetching manually since we made this a Client Component to handle modal close
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const res = await fetch('/api/projects')
    if (res.ok) {
      const data = await res.json()
      setProjects(data)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    await createProject(formData)
    await fetchProjects()
    
    // Close modal
    const modal = document.getElementById('add_project_modal') as HTMLInputElement
    if (modal) modal.checked = false
    
    // Reset form
    const form = document.getElementById('add_project_form') as HTMLFormElement
    if (form) form.reset()
  }

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <label htmlFor="add_project_modal" className="btn btn-primary rounded-full">
          Add Project
        </label>
      </div>

      <ProjectTable projects={projects} onRefresh={fetchProjects} />

      {/* Add Project Modal */}
      <input type="checkbox" id="add_project_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold border-b pb-2 mb-4">Add New Project</h3>
          <form id="add_project_form" action={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Project Name *</span></label>
              <input type="text" name="projectName" className="input input-bordered w-full" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Client Name *</span></label>
              <input type="text" name="clientName" className="input input-bordered w-full" required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Status *</span></label>
              <select name="status" className="select select-bordered w-full" defaultValue="PRODUCT" required>
                <option value="PRODUCT">Product (Internal)</option>
                <option value="OUTSOURCE">Outsource (Dedicated)</option>
                <option value="WHITELABEL">Whitelabel (Project Based)</option>
              </select>
            </div>
            
            <div className="modal-action mt-6">
              <label htmlFor="add_project_modal" className="btn btn-ghost">Cancel</label>
              <button type="submit" className="btn btn-primary rounded-full">Save Project</button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="add_project_modal">Close</label>
      </div>
    </div>
    </PageTransition>
  )
}
