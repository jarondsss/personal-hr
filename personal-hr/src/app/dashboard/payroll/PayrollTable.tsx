"use client"

import { useState, useRef } from "react"
import { generatePayroll, markAsPaid } from "./actions"
import { generatePayslipOds } from "./PayslipDocument"
import { saveAs } from "file-saver"
import { Check, Printer } from "lucide-react"

export default function PayrollTable({ payrolls, companyProfile }: { payrolls: any[]; companyProfile?: any }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Default to current month/year
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  // Preview state
  const [previewPayroll, setPreviewPayroll] = useState<any | null>(null)
  const previewModalRef = useRef<HTMLDialogElement>(null)

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await generatePayroll(formData)

    if (res.error) setError(res.error)
    else {
      const checkbox = document.getElementById('generate-payroll-modal') as HTMLInputElement
      if (checkbox) checkbox.checked = false
    }

    setIsGenerating(false)
  }

  const handlePay = async (id: string) => {
    if(!confirm("Mark this payroll as PAID?")) return
    await markAsPaid(id)
  }

  const handlePreview = (payroll: any) => {
    setPreviewPayroll(payroll)
    previewModalRef.current?.showModal()
  }

  const handleDownloadOds = async (payroll: any) => {
    try {
      const blob = await generatePayslipOds(payroll, companyProfile)
      saveAs(blob, `Payslip_${payroll.employee?.fullName}_${payroll.year}_${payroll.month}.ods`)
    } catch (err) {
      console.error(err)
      alert("Failed to generate payslip document")
    }
  }

  const escapeHtml = (value: unknown) => String(value ?? "-").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char))

  const handlePrintPdf = () => {
    if (!previewPayroll) return

    const monthName = new Date(2000, previewPayroll.month - 1).toLocaleString('default', { month: 'long' })
    const printWindow = window.open("", "_blank", "width=800,height=1000")
    if (!printWindow) return

    const company = companyProfile || {}

    printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>Payslip ${escapeHtml(previewPayroll.employee?.fullName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 32px; background: #fff; }
    .slip { max-width: 720px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; }
    .header { text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 24px; }
    .logo-container { display: flex; justify-content: center; margin-bottom: 12px; }
    .logo-img { max-height: 60px; max-width: 200px; object-fit: contain; }
    .company-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .company-detail { font-size: 11px; color: #6b7280; margin-bottom: 2px; }
    .title { font-size: 28px; font-weight: 800; letter-spacing: 0.08em; margin: 0; margin-top: 16px; }
    .period { color: #6b7280; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .label { color: #6b7280; font-size: 12px; margin-bottom: 4px; }
    .value { font-weight: 700; font-size: 15px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .plus { color: #059669; }
    .minus { color: #dc2626; }
    .total { margin-top: 24px; padding: 18px; background: #f3f4f6; border-radius: 12px; display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; }
    @media print { body { padding: 0; } .slip { border: 0; border-radius: 0; } }
  </style>
</head>
<body>
  <main class="slip">
    <section class="header">
      ${company.logoUrl ? `<div class="logo-container"><img src="${escapeHtml(company.logoUrl)}" alt="${escapeHtml(company.companyName || '')}" class="logo-img" /></div>` : ''}
      ${company.companyName ? `<div class="company-name">${escapeHtml(company.companyName)}</div>` : ''}
      ${company.address ? `<div class="company-detail">${escapeHtml(company.address)}</div>` : ''}
      <div class="company-detail">${escapeHtml(company.email || '')}${company.phone ? ` | ${escapeHtml(company.phone)}` : ''}</div>
      <h1 class="title">PAYSLIP</h1>
      <div class="period">Periode: ${monthName} ${previewPayroll.year}</div>
    </section>

    <section class="grid">
      <div><div class="label">Nama Karyawan</div><div class="value">${escapeHtml(previewPayroll.employee?.fullName)}</div></div>
      <div><div class="label">Posisi</div><div class="value">${escapeHtml(previewPayroll.employee?.jobTitle)}</div></div>
      <div><div class="label">Bank</div><div class="value">${escapeHtml(previewPayroll.employee?.bankName)} / ${escapeHtml(previewPayroll.employee?.bankAccount)}</div></div>
      <div><div class="label">Status</div><div class="value">${escapeHtml(previewPayroll.status)}</div></div>
    </section>

    <section>
      <div class="row"><strong>Gaji Pokok</strong><span>${formatIDR(previewPayroll.basicSalary)}</span></div>
      <div class="row"><strong>Uang Lembur</strong><span class="plus">+${formatIDR(previewPayroll.overtimePay)}</span></div>
      <div class="row"><strong>Potongan PPh 21</strong><span class="minus">-${formatIDR(previewPayroll.deductions)}</span></div>
    </section>

    <section class="total">
      <span>Total Diterima (THP)</span>
      <span>${formatIDR(previewPayroll.netSalary)}</span>
    </section>
  </main>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
</body>
</html>`)
    printWindow.document.close()
  }

  const filteredPayrolls = payrolls.filter(p => p.month === filterMonth && p.year === filterYear)
  const payrollColumns = [filteredPayrolls.slice(0, 10), filteredPayrolls.slice(10, 20)]

  const handleExportExcel = async () => {
    const xlsx = await import("xlsx")
    const rows = filteredPayrolls.map((payroll) => ({
      Employee: payroll.employee?.fullName || "-",
      Position: payroll.employee?.jobTitle || "-",
      Month: payroll.month,
      Year: payroll.year,
      "Basic Salary": payroll.basicSalary,
      "Overtime Pay": payroll.overtimePay,
      Deductions: payroll.deductions,
      "Net Salary": payroll.netSalary,
      Status: payroll.status,
      Bank: payroll.employee?.bankName || "-",
      "Bank Account": payroll.employee?.bankAccount || "-",
    }))

    const worksheet = xlsx.utils.json_to_sheet(rows)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, "Payroll")
    const out = xlsx.write(workbook, { type: "array", bookType: "xlsx" })
    saveAs(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `Payroll_${filterYear}_${filterMonth}.xlsx`)
  }

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
  }

  return (
    <>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <select
            className="select select-bordered"
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select
            className="select select-bordered"
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-outline rounded-full"
            onClick={handleExportExcel}
            disabled={filteredPayrolls.length === 0}
          >
            Export Excel
          </button>
          <label htmlFor="generate-payroll-modal" className="btn btn-primary rounded-full">
            Generate Payroll
          </label>
        </div>
      </div>

      {/* Main Table */}
      <div className="surface surface-flush">
        <div className="p-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-4">
            {payrollColumns.map((items, index) => (
              <div key={index} className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200 text-base-content">
                    <tr>
                      <th>Employee</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((payroll) => (
                      <tr key={payroll.id}>
                        <td className="font-bold">
                          {payroll.employee?.fullName}
                          <div className="text-xs font-normal opacity-70">{payroll.employee?.jobTitle}</div>
                        </td>
                        <td className="font-bold">{formatIDR(payroll.netSalary)}</td>
                        <td>
                          <div className={`badge ${payroll.status === 'PAID' ? 'badge-success text-white' : 'badge-warning'} badge-sm`}>
                            {payroll.status}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {payroll.status === 'DRAFT' && (
                              <button
                                className="btn btn-square btn-xs btn-success text-white"
                                onClick={() => handlePay(payroll.id)}
                                aria-label="Mark as paid"
                                title="Mark as paid"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-square btn-xs btn-ghost"
                              onClick={() => handlePreview(payroll)}
                              aria-label="Print slip"
                              title="Print slip"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {filteredPayrolls.length === 0 && (
            <div className="text-center py-12 text-base-content/50">
              <p>No payroll data found for this month.</p>
              <label htmlFor="generate-payroll-modal" className="btn btn-ghost btn-sm mt-2 rounded-full">Generate Now</label>
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      <input type="checkbox" id="generate-payroll-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Generate Payroll</h3>
          <p className="text-sm opacity-70 mb-4">
            This will calculate basic salary and approved overtime for all employees in the selected month. Existing DRAFT payrolls will be overwritten.
          </p>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {error && (
              <div className="alert alert-error text-sm py-2">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <div className="label"><span className="label-text">Month</span></div>
                <select name="month" className="select select-bordered" defaultValue={filterMonth}>
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <div className="label"><span className="label-text">Year</span></div>
                <select name="year" className="select select-bordered" defaultValue={filterYear}>
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-action">
              <label htmlFor="generate-payroll-modal" className="btn">Cancel</label>
              <button type="submit" className="btn btn-primary rounded-full" disabled={isGenerating}>
                {isGenerating ? <span className="loading loading-spinner"></span> : 'Generate'}
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="generate-payroll-modal">Close</label>
      </div>

      {/* Preview Modal */}
      <dialog ref={previewModalRef} className="modal">
        <div className="modal-box w-11/12 max-w-2xl bg-base-100 print:p-0 print:shadow-none print:border-0">
          <form method="dialog" className="print:hidden">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>

          {previewPayroll && (
            <div className="print:text-black">
              <div className="text-center mb-8 border-b pb-6">
                {companyProfile?.logoUrl && (
                  <div className="flex justify-center mb-3">
                    <img src={companyProfile.logoUrl} alt="Company Logo" className="max-h-12 object-contain" />
                  </div>
                )}
                {companyProfile?.companyName && (
                  <div className="text-lg font-bold mb-1">{companyProfile.companyName}</div>
                )}
                {companyProfile?.address && (
                  <div className="text-xs opacity-60">{companyProfile.address}</div>
                )}
                <div className="text-xs opacity-60 mb-3">
                  {companyProfile?.email}{companyProfile?.phone ? ` | ${companyProfile.phone}` : ''}
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-wider">Payslip</h2>
                <p className="text-sm opacity-70">Periode: {new Date(2000, previewPayroll.month - 1).toLocaleString('default', { month: 'long' })} {previewPayroll.year}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                <div>
                  <p className="opacity-70">Nama Karyawan</p>
                  <p className="font-semibold text-base">{previewPayroll.employee?.fullName}</p>
                </div>
                <div>
                  <p className="opacity-70">Posisi</p>
                  <p className="font-semibold text-base">{previewPayroll.employee?.jobTitle || '-'}</p>
                </div>
                <div>
                  <p className="opacity-70">Bank</p>
                  <p className="font-semibold">{previewPayroll.employee?.bankName || '-'} / {previewPayroll.employee?.bankAccount || '-'}</p>
                </div>
                <div>
                  <p className="opacity-70">Status</p>
                  <div className={`badge ${previewPayroll.status === 'PAID' ? 'badge-success text-white' : 'badge-warning'} badge-sm mt-1`}>
                    {previewPayroll.status}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center py-2 border-b border-base-200">
                  <span className="font-medium">Gaji Pokok</span>
                  <span>{formatIDR(previewPayroll.basicSalary)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-base-200">
                  <span className="font-medium">Uang Lembur</span>
                  <span className="text-success">+{formatIDR(previewPayroll.overtimePay)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-base-200">
                  <span className="font-medium">Potongan PPh 21</span>
                  <span className="text-error">-{formatIDR(previewPayroll.deductions)}</span>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-xl flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Total Diterima (THP)</span>
                <span className="text-xl font-bold">{formatIDR(previewPayroll.netSalary)}</span>
              </div>

              <div className="modal-action mt-6 print:hidden">
                <form method="dialog">
                  <button className="btn btn-ghost">Close</button>
                </form>
                <button className="btn btn-outline" onClick={handlePrintPdf}>
                  Save as PDF
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownloadOds(previewPayroll)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download .ods
                </button>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}
