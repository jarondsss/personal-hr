import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { addProjectMember, removeProjectMember } from "../actions"
import { revalidatePath } from "next/cache"
import PageTransition from "@/components/PageTransition"

export default async function ManageProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        include: { employee: true },
        orderBy: { joinDate: 'desc' }
      }
    }
  })

  if (!project) notFound()

  // Get employees not yet in this project
  const assignedEmpIds = project.members.map(m => m.employeeId)
  const availableEmployees = await prisma.employee.findMany({
    where: {
      id: { notIn: assignedEmpIds }
    },
    orderBy: { fullName: 'asc' }
  })

  const addMemberAction = async (formData: FormData) => {
    "use server"
    await addProjectMember(id, formData)
  }

  return (
    <PageTransition>
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-2 sm:px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.projectName}</h1>
          <p className="text-base-content/70 text-sm mt-1">Client: {project.clientName} | Status: {project.status}</p>
        </div>
        <Link href="/dashboard/projects" className="btn btn-ghost">
          Back to Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Add Member Form */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6">
              <h2 className="card-title text-lg border-b pb-2 mb-2">Assign Member</h2>
              
              <form action={addMemberAction} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Select Employee *</span></label>
                  <select name="employeeId" className="select select-bordered w-full" required defaultValue="">
                    <option value="" disabled>Choose...</option>
                    {availableEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} - {emp.jobTitle.replace(/_/g, ' ')}</option>
                    ))}
                    {availableEmployees.length === 0 && (
                      <option disabled>No available employees</option>
                    )}
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label"><span className="label-text">Join Date *</span></label>
                  <input type="date" name="joinDate" className="input input-bordered w-full" required defaultValue={new Date().toISOString().split('T')[0]} />
                  <label className="label"><span className="label-text-alt opacity-70">Used for prorated payroll calculation</span></label>
                </div>
                
                <button type="submit" className="btn btn-primary w-full mt-2" disabled={availableEmployees.length === 0}>
                  Add to Project
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Col: Member List */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-0">
              <div className="p-6 border-b border-base-200 flex justify-between items-center">
                <h2 className="card-title text-lg">Team Members ({project.members.length})</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Employee</th>
                      <th>Role</th>
                      <th>Join Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.members.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                <span className="font-semibold">{member.employee.fullName.substring(0,2).toUpperCase()}</span>
                              </div>
                            </div>
                            <div className="font-bold">{member.employee.fullName}</div>
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-ghost text-xs">
                            {member.employee.jobTitle.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                        <td className="text-right">
                          <form action={async () => {
                            "use server"
                            await removeProjectMember(member.id, id)
                          }}>
                            <button type="submit" className="btn btn-ghost btn-xs text-error">Remove</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {project.members.length === 0 && (
                <div className="text-center py-10 opacity-50">
                  <p>No members assigned to this project yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
