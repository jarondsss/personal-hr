"use client"

import React, { useState } from "react"
import { closeOvertimePeriod, deleteOvertimePeriod } from "./actions"
import { format } from "date-fns"

type Period = {
  id: string
  periodStart: Date
  periodEnd: Date
  status: string
  closedAt: Date | null
  summaries: {
    id: string
    totalHours: number
    totalPay: number
    employee: {
      fullName: string
    }
  }[]
}

export default function OvertimePeriodsTable({ initialPeriods }: { initialPeriods: Period[] }) {
  const [periods, setPeriods] = useState(initialPeriods)
  const [loading, setLoading] = useState<string | null>(null)
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null)

  async function handleClose(periodId: string) {
    if (!confirm("Close this period? This will calculate all overtime summaries and cannot be undone.")) {
      return
    }

    setLoading(periodId)
    const result = await closeOvertimePeriod(periodId)

    if (result.error) {
      alert(result.error)
    } else {
      // Refresh the page to get updated data
      window.location.reload()
    }
    setLoading(null)
  }

  async function handleDelete(periodId: string) {
    if (!confirm("Delete this period? This action cannot be undone.")) {
      return
    }

    setLoading(periodId)
    const result = await deleteOvertimePeriod(periodId)

    if (result.error) {
      alert(result.error)
    } else {
      setPeriods(periods.filter(p => p.id !== periodId))
    }
    setLoading(null)
  }

  function toggleExpand(periodId: string) {
    setExpandedPeriod(expandedPeriod === periodId ? null : periodId)
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Period</th>
            <th>Status</th>
            <th>Employees</th>
            <th>Total Hours</th>
            <th>Total Pay</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {periods.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-base-content/70">
                No periods yet. Create one to get started.
              </td>
            </tr>
          )}

          {periods.map((period) => {
            const totalHours = period.summaries.reduce((sum, s) => sum + s.totalHours, 0)
            const totalPay = period.summaries.reduce((sum, s) => sum + s.totalPay, 0)
            const isExpanded = expandedPeriod === period.id

            return (
              <React.Fragment key={period.id}>
                <tr>
                  <td>
                    <div className="font-medium">
                      {format(new Date(period.periodStart), 'MMM dd, yyyy')} - {format(new Date(period.periodEnd), 'MMM dd, yyyy')}
                    </div>
                    {period.closedAt && (
                      <div className="text-xs text-base-content/60">
                        Closed: {format(new Date(period.closedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${period.status === 'OPEN' ? 'badge-warning' : 'badge-success'}`}>
                      {period.status}
                    </span>
                  </td>
                  <td>{period.summaries.length}</td>
                  <td>{totalHours.toFixed(2)} hrs</td>
                  <td>Rp {totalPay.toLocaleString('id-ID')}</td>
                  <td>
                    <div className="flex gap-2">
                      {period.summaries.length > 0 && (
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => toggleExpand(period.id)}
                        >
                          {isExpanded ? '▼' : '▶'} Details
                        </button>
                      )}

                      {period.status === 'OPEN' && (
                        <>
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleClose(period.id)}
                            disabled={loading === period.id}
                          >
                            {loading === period.id ? "Closing..." : "Close Period"}
                          </button>
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => handleDelete(period.id)}
                            disabled={loading === period.id}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>

                {isExpanded && period.summaries.length > 0 && (
                  <tr>
                    <td colSpan={6} className="bg-base-200">
                      <div className="p-4">
                        <h4 className="font-bold mb-2">Employee Breakdown</h4>
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Employee</th>
                              <th>Total Hours</th>
                              <th>Total Pay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {period.summaries.map((summary) => (
                              <tr key={summary.id}>
                                <td>{summary.employee.fullName}</td>
                                <td>{summary.totalHours.toFixed(2)} hrs</td>
                                <td>Rp {summary.totalPay.toLocaleString('id-ID')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
