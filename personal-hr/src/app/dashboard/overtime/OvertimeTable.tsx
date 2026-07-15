"use client"

import { useState } from "react"
import { processOvertimeRequest } from "./actions"

export default function OvertimeTable({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [reqToProcess, setReqToProcess] = useState<{id: string, action: 'APPROVED' | 'REJECTED'} | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Auto-update state if props change (revalidated by Next.js)
  if (initialRequests !== requests && !isProcessing) {
    setRequests(initialRequests)
  }

  const handleProcess = async () => {
    if (!reqToProcess) return
    setIsProcessing(true)

    const res = await processOvertimeRequest(reqToProcess.id, reqToProcess.action)
    
    if (res.success) {
      setRequests(requests.map(r => 
        r.id === reqToProcess.id ? { ...r, status: reqToProcess.action } : r
      ))
    }
    
    setIsProcessing(false)
    setReqToProcess(null)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'badge-success'
      case 'REJECTED': return 'badge-error'
      default: return 'badge-warning'
    }
  }

  return (
    <>
      <div className="surface surface-flush">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-base-200 text-base-content">
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="font-bold">{req.employee?.fullName || "Unknown Employee"}</div>
                      <div className="text-xs opacity-50">{req.employee?.jobTitle || "-"}</div>
                    </td>
                    <td>{new Date(req.date).toLocaleDateString()}</td>
                    <td>
                      {req.startTime} - {req.endTime}
                    </td>
                    <td>{req.durationHours} hrs</td>
                    <td className="max-w-xs truncate" title={req.reason || '-'}>
                      {req.reason || '-'}
                    </td>
                    <td>
                      <div className={`badge ${getStatusBadge(req.status)} badge-outline text-xs`}>
                        {req.status}
                      </div>
                    </td>
                    <td>
                      {req.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-xs btn-success text-white"
                            onClick={() => setReqToProcess({id: req.id, action: 'APPROVED'})}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-xs btn-error text-white"
                            onClick={() => setReqToProcess({id: req.id, action: 'REJECTED'})}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs opacity-50 text-center block w-full">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              <p>No overtime requests found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {reqToProcess && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className={`text-lg font-bold ${reqToProcess.action === 'APPROVED' ? 'text-success' : 'text-error'}`}>
              Confirm {reqToProcess.action.toLowerCase()}
            </h3>
            <p className="py-4">
              Are you sure you want to <strong>{reqToProcess.action.toLowerCase()}</strong> this overtime request?
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setReqToProcess(null)} disabled={isProcessing}>Cancel</button>
              <button 
                className={`btn ${reqToProcess.action === 'APPROVED' ? 'btn-success text-white' : 'btn-error text-white'}`}
                onClick={handleProcess} 
                disabled={isProcessing}
              >
                {isProcessing ? <span className="loading loading-spinner"></span> : `Yes, ${reqToProcess.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
