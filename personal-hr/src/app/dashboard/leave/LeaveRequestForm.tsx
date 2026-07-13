"use client"

import { useState } from "react"
import { submitLeaveRequest } from "./actions"

export default function LeaveRequestForm({ employees, leaveTypes }: { employees: any[], leaveTypes: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const res = await submitLeaveRequest(formData)
      if (res.error) {
        setError(res.error)
      } else {
        const checkbox = document.getElementById('leave-request-modal') as HTMLInputElement
        if (checkbox) checkbox.checked = false
        e.currentTarget.reset()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <label htmlFor="leave-request-modal" className="btn btn-primary rounded-full">
        + New Request
      </label>

      <input type="checkbox" id="leave-request-modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Submit Leave Request</h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="alert alert-error text-sm py-2">{error}</div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold pl-1">Employee</label>
              <select name="employeeId" className="select select-bordered w-full" required defaultValue="">
                <option value="" disabled>Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold pl-1">Leave Type</label>
              <select name="leaveType" className="select select-bordered w-full" required defaultValue="">
                <option value="" disabled>Select type...</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold pl-1">Start Date</label>
                <input type="date" name="startDate" className="input input-bordered w-full" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold pl-1">End Date</label>
                <input type="date" name="endDate" className="input input-bordered w-full" required />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold pl-1">Reason (Optional)</label>
              <textarea name="reason" className="textarea textarea-bordered h-24" placeholder="Brief reason for leave..."></textarea>
            </div>

            <div className="modal-action">
              <label htmlFor="leave-request-modal" className="btn">Cancel</label>
              <button type="submit" className="btn btn-primary rounded-full" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner"></span> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="leave-request-modal">Close</label>
      </div>
    </>
  )
}