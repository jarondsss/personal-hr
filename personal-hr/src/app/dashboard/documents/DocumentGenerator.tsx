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
  const docData = emp ? {
    fullName: emp.fullName,
    jobTitle: emp.jobTitle,
    salary: new Intl.NumberFormat('id-ID').format(emp.salary),
    startDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(emp.joinDate)),
    currentDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())
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
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      doc.render(docData)

      const out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      saveAs(out, `${tpl.name}_${docData.fullName.replace(/\s+/g, '_')}.docx`)
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
          <p className="font-bold mb-2">Variables available in template (using {"{variableName}"}):</p>
          <div className="flex flex-wrap gap-4 opacity-80">
            <code>{"{fullName}"}</code>
            <code>{"{jobTitle}"}</code>
            <code>{"{salary}"}</code>
            <code>{"{startDate}"}</code>
            <code>{"{currentDate}"}</code>
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Review Injected Data</h3>
            <p className="text-sm opacity-70 mb-4">
              Ini data yang bakal direplace ke dalem dokumen Word. Pastiin angkanya udah bener sebelum di-download.
            </p>
            
            {docData && (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <tbody>
                    <tr><td className="font-mono text-xs w-1/3">{"{fullName}"}</td><td className="font-semibold">{docData.fullName}</td></tr>
                    <tr><td className="font-mono text-xs">{"{jobTitle}"}</td><td className="font-semibold">{docData.jobTitle}</td></tr>
                    <tr><td className="font-mono text-xs">{"{salary}"}</td><td className="font-semibold">Rp {docData.salary}</td></tr>
                    <tr><td className="font-mono text-xs">{"{startDate}"}</td><td className="font-semibold">{docData.startDate}</td></tr>
                    <tr><td className="font-mono text-xs">{"{currentDate}"}</td><td className="font-semibold">{docData.currentDate}</td></tr>
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
