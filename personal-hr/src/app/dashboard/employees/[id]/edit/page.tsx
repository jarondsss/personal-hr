import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { updateEmployee } from "../../actions"
import { ArrowLeft } from "lucide-react"
import PageTransition from "@/components/PageTransition"

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const { id } = await params
  const employee = await prisma.employee.findUnique({ where: { id } })

  if (!employee) notFound()

  const masterData = await prisma.masterData.findMany({
    where: { category: { in: ["JOB_TITLE", "EMP_STATUS"] } },
  })

  const jobTitles = masterData.filter((d) => d.category === "JOB_TITLE")
  const empStatuses = masterData.filter((d) => d.category === "EMP_STATUS")

  const updateEmployeeWithId = updateEmployee.bind(null, id)

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }

  return (
    <PageTransition>
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 40 }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <Link
            href="/dashboard/employees"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-elevated)",
              color: "var(--color-text-secondary)",
              flexShrink: 0,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="page-title">Edit Employee</h1>
            <p className="page-subtitle">{employee.fullName} · Update employee information.</p>
          </div>
        </div>

        <form action={updateEmployeeWithId} style={{ display: "flex", flexDirection: "column", gap: 2 }}>

          {/* Section 1 — Personal Information */}
          <FormSection title="Personal Information" index={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Full Name" required>
                <input type="text" name="fullName" defaultValue={employee.fullName} className="input input-bordered w-full" required />
              </FormField>
              <FormField label="Email Address" required>
                <input type="email" name="email" defaultValue={employee.email} className="input input-bordered w-full" required />
              </FormField>
              <FormField label="Phone Number">
                <input type="text" name="phone" defaultValue={employee.phone || ""} className="input input-bordered w-full" placeholder="+62..." />
              </FormField>
              <FormField label="Emergency Phone">
                <input type="text" name="phone2" defaultValue={employee.phone2 || ""} className="input input-bordered w-full" placeholder="+62..." />
              </FormField>
              <FormField label="ID Card (KTP)">
                <input type="text" name="idCardNumber" defaultValue={employee.idCardNumber || ""} className="input input-bordered w-full" placeholder="16 digit" />
              </FormField>
              <FormField label="Gender">
                <select name="gender" defaultValue={employee.gender || ""} className="select select-bordered w-full">
                  <option value="" disabled>Select gender...</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </FormField>
              <FormField label="Birth Place">
                <input type="text" name="birthPlace" defaultValue={employee.birthPlace || ""} className="input input-bordered w-full" placeholder="e.g. Jakarta" />
              </FormField>
              <FormField label="Birth Date">
                <input type="date" name="birthDate" defaultValue={formatDate(employee.birthDate)} className="input input-bordered w-full" />
              </FormField>
              <FormField label="NPWP">
                <input type="text" name="npwp" defaultValue={employee.npwp || ""} className="input input-bordered w-full" placeholder="15 digit" />
              </FormField>
              <FormField label="Tax Status (PTKP)">
                <select name="taxStatus" defaultValue={employee.taxStatus || "TK0"} className="select select-bordered w-full">
                  <option value="TK0">TK/0 — Tidak Kawin, 0 Tanggungan</option>
                  <option value="TK1">TK/1 — Tidak Kawin, 1 Tanggungan</option>
                  <option value="TK2">TK/2 — Tidak Kawin, 2 Tanggungan</option>
                  <option value="TK3">TK/3 — Tidak Kawin, 3 Tanggungan</option>
                  <option value="K0">K/0 — Kawin, 0 Tanggungan</option>
                  <option value="K1">K/1 — Kawin, 1 Tanggungan</option>
                  <option value="K2">K/2 — Kawin, 2 Tanggungan</option>
                  <option value="K3">K/3 — Kawin, 3 Tanggungan</option>
                  <option value="K10">K/I/0 — Kawin Istri Bekerja, 0 Tanggungan</option>
                  <option value="K11">K/I/1 — Kawin Istri Bekerja, 1 Tanggungan</option>
                  <option value="K12">K/I/2 — Kawin Istri Bekerja, 2 Tanggungan</option>
                  <option value="K13">K/I/3 — Kawin Istri Bekerja, 3 Tanggungan</option>
                </select>
              </FormField>
              <FormField label="Bank">
                <select name="bankName" defaultValue={employee.bankName || "BCA"} className="select select-bordered w-full">
                  <option value="BCA">BCA (Free Transfer Fee)</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="OTHER">Bank Lainnya</option>
                </select>
                <p style={{ fontSize: "0.75rem", color: "var(--color-warning)", marginTop: 4 }}>
                  Non-BCA dikenakan biaya admin transfer
                </p>
              </FormField>
              <FormField label="Account Number">
                <input type="text" name="bankAccount" defaultValue={employee.bankAccount || ""} className="input input-bordered w-full" placeholder="e.g. 1234567890" />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Address">
                  <textarea name="address" defaultValue={employee.address || ""} className="textarea textarea-bordered w-full" rows={3} />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* Section 2 — Employment Details */}
          <FormSection title="Employment Details" index={2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <FormField label="Job Title" required>
                <select name="jobTitle" defaultValue={employee.jobTitle} className="select select-bordered w-full" required>
                  {jobTitles.map((t) => (
                    <option key={t.id} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Employment Type" required>
                <select name="status" defaultValue={employee.status} className="select select-bordered w-full" required>
                  {empStatuses.map((s) => (
                    <option key={s.id} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Active Status">
                <select name="isActive" defaultValue={employee.isActive ? "true" : "false"} className="select select-bordered w-full">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </FormField>
              <FormField label="Join Date" required>
                <input type="date" name="joinDate" defaultValue={formatDate(employee.joinDate)} className="input input-bordered w-full" required />
              </FormField>
            </div>
          </FormSection>

          {/* Section 3 — Compensation & Contract */}
          <FormSection title="Compensation & Contract" index={3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Base Salary" required>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    color: "var(--color-text-muted)", fontFamily: "var(--font-display)", fontSize: "0.875rem",
                    pointerEvents: "none",
                  }}>Rp</span>
                  <input
                    type="number" name="salary" defaultValue={employee.salary} required
                    className="input input-bordered w-full"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </FormField>
              <FormField label="Salary Type" required>
                <select name="salaryType" defaultValue={employee.salaryType} className="select select-bordered w-full" required>
                  <option value="GROSS">Gross</option>
                  <option value="NETT">Nett</option>
                </select>
              </FormField>
              <FormField label="Contract Start">
                <input type="date" name="startContract" defaultValue={formatDate(employee.startContract)} className="input input-bordered w-full" />
              </FormField>
              <FormField label="Contract End">
                <input type="date" name="endContract" defaultValue={formatDate(employee.endContract)} className="input input-bordered w-full" />
              </FormField>
            </div>
          </FormSection>

          {/* Section 4 — Integrations */}
          <FormSection title="Integrations" index={4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label="Discord ID">
                <input type="text" name="discordId" defaultValue={employee.discordId || ""} className="input input-bordered w-full" placeholder="e.g. 123456789012345678" />
              </FormField>
              <FormField label="GitHub Username">
                <input type="text" name="githubUsername" defaultValue={employee.githubUsername || ""} className="input input-bordered w-full" placeholder="e.g. torvalds" />
              </FormField>
            </div>
          </FormSection>

          {/* Actions */}
          <div style={{
            display: "flex", justifyContent: "flex-end", gap: 10,
            paddingTop: 24, marginTop: 8,
            borderTop: "1px solid var(--color-border)",
          }}>
            <Link href="/dashboard/employees" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" style={{ minWidth: 130 }}>
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </PageTransition>
  )
}

/* ── Shared primitives ── */
function FormSection({ title, index, children }: { title: string; index: number; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      marginBottom: 12,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 24px",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "var(--color-elevated)",
      }}>
        <div style={{
          width: 22, height: 22,
          borderRadius: 6,
          backgroundColor: "var(--color-primary-soft)",
          border: "1px solid var(--color-primary-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: "0.6875rem",
          fontWeight: 700, color: "var(--color-primary-hover)",
          flexShrink: 0,
        }}>
          {index}
        </div>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.875rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--color-text-primary)",
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.8125rem",
        fontWeight: 500,
        color: "var(--color-text-secondary)",
      }}>
        {label}
        {required && <span style={{ color: "var(--color-danger)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}
