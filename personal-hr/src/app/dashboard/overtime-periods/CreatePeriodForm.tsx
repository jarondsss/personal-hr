"use client"

import { useState } from "react"
import { createOvertimePeriod } from "./actions"

export default function CreatePeriodForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Default: today is July 20, 2026
  // So current period would be June 21 - July 20
  // Next period would be July 21 - Aug 20
  const today = new Date()
  const currentDay = today.getDate()

  // If today >= 21, suggest next period starting from 21st of this month
  // If today < 21, suggest period starting from 21st of last month
  let suggestedStart: Date
  let suggestedEnd: Date

  if (currentDay >= 21) {
    // Suggest next period: 21st of this month to 20th of next month
    suggestedStart = new Date(today.getFullYear(), today.getMonth(), 21)
    suggestedEnd = new Date(today.getFullYear(), today.getMonth() + 1, 20)
  } else {
    // Suggest current period: 21st of last month to 20th of this month
    suggestedStart = new Date(today.getFullYear(), today.getMonth() - 1, 21)
    suggestedEnd = new Date(today.getFullYear(), today.getMonth(), 20)
  }

  const formatDateInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const result = await createOvertimePeriod(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + Create Period
      </button>

      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Overtime Period</h3>

            <form onSubmit={handleSubmit} className="stack">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Period Start (21st)</span>
                </label>
                <input
                  type="date"
                  name="periodStart"
                  className="input input-bordered"
                  defaultValue={formatDateInput(suggestedStart)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Period End (20th)</span>
                </label>
                <input
                  type="date"
                  name="periodEnd"
                  className="input input-bordered"
                  defaultValue={formatDateInput(suggestedEnd)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating..." : "Create Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
