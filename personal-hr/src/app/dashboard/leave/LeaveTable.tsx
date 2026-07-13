"use client"

import { processLeaveRequest } from "./actions"

export default function LeaveTable({ initialRequests: requests }: { initialRequests: any[] }) {
  const handleProcess = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${action} this leave request?`)) return
    await processLeaveRequest(id, action)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'badge-success'
      case 'REJECTED': return 'badge-error'
      default: return 'badge-warning'
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200 text-base-content">
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
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
                    <div className="text-xs opacity-70">{req.employee?.jobTitle || "-".replace(/_/g, ' ')}</div>
                  </td>
                  <td>
                    <span className="font-semibold">{req.leaveType.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="whitespace-nowrap text-sm">
                    {new Date(req.startDate).toLocaleDateString()} <br/> 
                    to {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="max-w-[200px] truncate" title={req.reason}>
                    {req.reason || '-'}
                  </td>
                  <td>
                    <div className={`badge ${getStatusColor(req.status)} text-xs`}>
                      {req.status}
                    </div>
                  </td>
                  <td>
                    {req.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleProcess(req.id, 'APPROVED')}
                          className="btn btn-xs btn-success text-white"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleProcess(req.id, 'REJECTED')}
                          className="btn btn-xs btn-error text-white"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs opacity-50">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {requests.length === 0 && (
          <div className="text-center py-12 text-base-content/50">
            <p>No leave requests found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
