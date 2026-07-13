import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { updateEmployee } from "../../actions"
import { ArrowLeft } from "lucide-react"
import PageTransition from "@/components/PageTransition"

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({
    where: { id }
  })

  if (!employee) notFound()

  const masterData = await prisma.masterData.findMany({
    where: {
      category: { in: ['JOB_TITLE', 'EMP_STATUS'] }
    }
  })

  const jobTitles = masterData.filter(d => d.category === 'JOB_TITLE')
  const empStatuses = masterData.filter(d => d.category === 'EMP_STATUS')

  // Bind the ID to the action
  const updateEmployeeWithId = updateEmployee.bind(null, id)

  // Format dates for input type="date"
  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toISOString().split('T')[0]
  }

  return (
    <PageTransition>
    <div className="space-y-6 max-w-5xl mx-auto pb-10 px-2 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees" className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Employee</h1>
            <p className="text-base-content/70 text-sm mt-1">Update employee information.</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-6 sm:p-10">
          <form action={updateEmployeeWithId} className="space-y-10">
            
            {/* 1. Personal Information */}
            <section>
              <h2 className="text-xl font-semibold border-b pb-2 mb-6 text-primary">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Full Name *</span></label>
                  <input type="text" name="fullName" defaultValue={employee.fullName} className="input input-bordered w-full" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Email Address *</span></label>
                  <input type="email" name="email" defaultValue={employee.email} className="input input-bordered w-full" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Phone Number</span></label>
                  <input type="text" name="phone" defaultValue={employee.phone || ""} className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Emergency Phone</span></label>
                  <input type="text" name="phone2" defaultValue={employee.phone2 || ""} className="input input-bordered w-full" />
                </div>
                
                {/* New Fields */}
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">ID Card (KTP)</span></label>
                  <input type="text" name="idCardNumber" defaultValue={employee.idCardNumber || ""} className="input input-bordered w-full" placeholder="16 digit KTP" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Gender</span></label>
                  <select name="gender" defaultValue={employee.gender || ""} className="select select-bordered w-full">
                    <option value="" disabled>-- Select Gender --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Birth Place</span></label>
                  <input type="text" name="birthPlace" defaultValue={employee.birthPlace || ""} className="input input-bordered w-full" placeholder="e.g. Jakarta" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Birth Date</span></label>
                  <input type="date" name="birthDate" defaultValue={formatDate(employee.birthDate)} className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">NPWP</span></label>
                  <input type="text" name="npwp" defaultValue={employee.npwp || ""} className="input input-bordered w-full" placeholder="15 digit NPWP" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Status PTKP (Pajak)</span></label>
                  <select name="taxStatus" defaultValue={employee.taxStatus || "TK0"} className="select select-bordered w-full">
                    <option value="TK0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
                    <option value="TK1">TK/1 (Tidak Kawin, 1 Tanggungan)</option>
                    <option value="TK2">TK/2 (Tidak Kawin, 2 Tanggungan)</option>
                    <option value="TK3">TK/3 (Tidak Kawin, 3 Tanggungan)</option>
                    <option value="K0">K/0 (Kawin, 0 Tanggungan)</option>
                    <option value="K1">K/1 (Kawin, 1 Tanggungan)</option>
                    <option value="K2">K/2 (Kawin, 2 Tanggungan)</option>
                    <option value="K3">K/3 (Kawin, 3 Tanggungan)</option>
                    <option value="K10">K/I/0 (Kawin Istri Bekerja, 0 Tanggungan)</option>
                    <option value="K11">K/I/1 (Kawin Istri Bekerja, 1 Tanggungan)</option>
                    <option value="K12">K/I/2 (Kawin Istri Bekerja, 2 Tanggungan)</option>
                    <option value="K13">K/I/3 (Kawin Istri Bekerja, 3 Tanggungan)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Bank Name</span></label>
                  <select name="bankName" defaultValue={employee.bankName || "BCA"} className="select select-bordered w-full">
                    <option value="BCA">BCA (Free Transfer Fee)</option>
                    <option value="MANDIRI">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="OTHER">Bank Lainnya</option>
                  </select>
                  <label className="label"><span className="label-text-alt text-warning">Non-BCA = Potong biaya admin</span></label>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Account Number</span></label>
                  <input type="text" name="bankAccount" defaultValue={employee.bankAccount || ""} className="input input-bordered w-full" placeholder="e.g. 1234567890" />
                </div>
                {/* End New Fields */}

                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text font-medium">Address</span></label>
                  <textarea name="address" defaultValue={employee.address || ""} className="textarea textarea-bordered h-24 w-full"></textarea>
                </div>
              </div>
            </section>

            {/* 2. Employment Details */}
            <section>
              <h2 className="text-xl font-semibold border-b pb-2 mb-6 text-primary">Employment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Job Title *</span></label>
                  <select name="jobTitle" defaultValue={employee.jobTitle} className="select select-bordered w-full" required>
                    {jobTitles.map(t => (
                      <option key={t.id} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Employment Status *</span></label>
                  <select name="status" defaultValue={employee.status} className="select select-bordered w-full" required>
                    {empStatuses.map(s => (
                      <option key={s.id} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Join Date *</span></label>
                  <input type="date" name="joinDate" defaultValue={formatDate(employee.joinDate)} className="input input-bordered w-full" required />
                </div>
              </div>
            </section>

            {/* 3. Compensation & Contract */}
            <section>
              <h2 className="text-xl font-semibold border-b pb-2 mb-6 text-primary">Compensation & Contract</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Base Salary *</span></label>
                  <label className="input input-bordered flex items-center gap-2">
                    <span className="text-base-content/50">Rp</span>
                    <input type="number" name="salary" defaultValue={employee.salary} className="grow" required />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Salary Type *</span></label>
                  <select name="salaryType" defaultValue={employee.salaryType} className="select select-bordered w-full" required>
                    <option value="GROSS">Gross</option>
                    <option value="NETT">Nett</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Contract Start Date</span></label>
                  <input type="date" name="startContract" defaultValue={formatDate(employee.startContract)} className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Contract End Date</span></label>
                  <input type="date" name="endContract" defaultValue={formatDate(employee.endContract)} className="input input-bordered w-full" />
                </div>
              </div>
            </section>

            {/* 4. Integrations */}
            <section>
              <h2 className="text-xl font-semibold border-b pb-2 mb-6 text-primary">Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Discord ID</span></label>
                  <input type="text" name="discordId" defaultValue={employee.discordId || ""} className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">GitHub Username</span></label>
                  <input type="text" name="githubUsername" defaultValue={employee.githubUsername || ""} className="input input-bordered w-full" />
                </div>
              </div>
            </section>

            <div className="divider my-8"></div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/employees" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary px-8 rounded-full">Save Changes</button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
    </PageTransition>
  )
}
