"use client"

import { useState } from "react"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import { saveAs } from "file-saver"

type Template = {
  id: string
  name: string
  fileName: string
}

export default function DocumentGenerator({ 
  employees, 
  templates 
}: { 
  employees: any[], 
  templates: Template[] 
}) {
  const [selectedEmp, setSelectedEmp] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emp = employees.find(e => e.id === selectedEmp)
  const tpl = templates.find(t => t.id === selectedTemplate)

  // Pre-calculate data for preview and generation
  // Changed keys to match user's template using [Bracket] format in docx
  const docData = emp ? {
    "Nama Lengkap Karyawan": emp.fullName,
    "Tempat/Tgl Lahir Karyawan": (emp.birthPlace && emp.birthDate) ? `${emp.birthPlace}, ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(emp.birthDate))}` : "-",
    "Jenis Kelamin Karyawan": emp.gender || "-",
    "Alamat Karyawan": emp.address || "-",
    "No KTP Karyawan": emp.idCardNumber || "-",
    "Jabatan Karyawan": emp.jobTitle,
    "Tanggal Mulai Kontrak": emp.joinDate ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(emp.joinDate)) : "-",
    "Tanggal Selesai Kontrak": emp.endContract ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(emp.endContract)) : "-",
    "Gaji Karyawan": new Intl.NumberFormat('id-ID').format(emp.salary),
    "Tanggal kontrak": new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())
  } : null

  const handleGenerate = async () => {
    if (!docData || !tpl) return
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/templates/${tpl.fileName}`)
      if (!response.ok) throw new Error("Template file not found on server")

      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      
      // Configure docxtemplater to use [ ] instead of { }
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '[', end: ']' }
      })

      doc.render(docData)

      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      saveAs(out, `${tpl.name}_${docData["Nama Lengkap Karyawan"].replace(/\s+/g, '_')}.docx`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to generate document")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">Generate Document</h2>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Employee</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              <option value="" disabled>-- Select an employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} - {emp.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Template</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="" disabled>-- Select template --</option>
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-base-200 p-4 rounded-lg mb-6 text-sm">
          <p className="font-bold mb-2">Variables expected in your Word template:</p>
          <div className="flex flex-wrap gap-3 opacity-80">
            <code>[Nama Lengkap Karyawan]</code>
            <code>[Tempat/Tgl Lahir Karyawan]</code>
            <code>[Jenis Kelamin Karyawan]</code>
            <code>[Alamat Karyawan]</code>
            <code>[No KTP Karyawan]</code>
            <code>[Jabatan Karyawan]</code>
            <code>[Tanggal Mulai Kontrak]</code>
            <code>[Tanggal Selesai Kontrak]</code>
            <code>[Gaji Karyawan]</code>
            <code>[Tanggal kontrak]</code>
          </div>
        </div>

        <div className="card-actions justify-end gap-2">
          {/* Review Modal Trigger */}
          <button 
            className="btn btn-outline" 
            disabled={!docData || !tpl}
            onClick={() => (document.getElementById('review_modal') as HTMLDialogElement)?.showModal()}
          >
            Review Data
          </button>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!docData || !tpl || isGenerating}
          >
            {isGenerating ? <span className="loading loading-spinner"></span> : 'Download Document'}
          </button>
        </div>

        {/* Review Modal */}
        <dialog id="review_modal" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Review Injected Data</h3>
            <p className="text-sm opacity-70 mb-4">
              Ini data yang bakal direplace ke dalem dokumen Word lu. Pastiin formatnya udah bener.
            </p>
            
            {docData && (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="font-mono text-xs w-1/2">[Nama Lengkap Karyawan]</td><td className="font-semibold">{docData["Nama Lengkap Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Tempat/Tgl Lahir Karyawan]</td><td className="font-semibold">{docData["Tempat/Tgl Lahir Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Jenis Kelamin Karyawan]</td><td className="font-semibold">{docData["Jenis Kelamin Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Alamat Karyawan]</td><td className="font-semibold">{docData["Alamat Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[No KTP Karyawan]</td><td className="font-semibold">{docData["No KTP Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Jabatan Karyawan]</td><td className="font-semibold">{docData["Jabatan Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Tanggal Mulai Kontrak]</td><td className="font-semibold">{docData["Tanggal Mulai Kontrak"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Tanggal Selesai Kontrak]</td><td className="font-semibold">{docData["Tanggal Selesai Kontrak"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Gaji Karyawan]</td><td className="font-semibold">Rp {docData["Gaji Karyawan"]}</td></tr>
                    <tr><td className="font-mono text-xs">[Tanggal kontrak]</td><td className="font-semibold">{docData["Tanggal kontrak"]}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

      </div>
    </div>
  )
}
