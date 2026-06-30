"use client"

import { useState } from "react"
import { FileText, Download, Loader2 } from "lucide-react"
import { generateEmployeeContract } from "./actions"

export default function DocumentGeneratorPage({ employees }: { employees: any[] }) {
  const [selectedEmp, setSelectedEmp] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!selectedEmp) return
    setIsGenerating(true)
    setError(null)

    try {
      const res = await generateEmployeeContract(selectedEmp)

      if (res.error) {
        setError(res.error)
      } else if (res.base64 && res.filename) {
        // Convert base64 back to a Blob for downloading
        const byteCharacters = atob(res.base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })

        // Trigger download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = res.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate document")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Document Generator</h1>
          <p className="text-base-content/70 text-sm mt-1">Generate official employee documents and contracts in .docx format</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Generator Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Employment Contract
            </h2>
            <p className="text-sm text-base-content/70 mb-4">
              Generates a standard employment contract with employee details pre-filled.
            </p>

            {error && (
              <div className="alert alert-error text-sm py-2 mb-4">{error}</div>
            )}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Select Employee</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
                disabled={isGenerating}
              >
                <option value="" disabled>Choose an employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} - {emp.jobTitle}</option>
                ))}
              </select>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={!selectedEmp || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download .docx
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for future documents */}
        <div className="card bg-base-100 shadow-xl border border-base-200 opacity-60">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2 text-base-content/50">
              <FileText className="w-5 h-5" />
              Salary Slip (Coming Soon)
            </h2>
            <p className="text-sm text-base-content/50 mb-4">
              Generate monthly salary slips for employees based on payroll data.
            </p>
            <div className="card-actions justify-end mt-auto">
              <button className="btn btn-disabled">Not Available</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}