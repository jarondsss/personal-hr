"use client"

import { useState } from "react"
import Papa from "papaparse"
import { importEmployeesCSV } from "./actions.import"

export default function ImportEmployeeModal() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImport = async () => {
    if (!file) return
    setIsUploading(true)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await importEmployeesCSV(results.data)
          alert(`Import complete! Success: ${res.successCount}, Failed/Skipped: ${res.failCount}`)
          ;(document.getElementById('import_modal') as HTMLDialogElement)?.close()
        } catch (err) {
          alert("Error importing data")
        } finally {
          setIsUploading(false)
        }
      }
    })
  }

  const downloadTemplate = () => {
    const csvContent = "fullName,email,phone,phone2,idCardNumber,gender,birthPlace,birthDate,npwp,taxStatus,bankName,bankAccount,address,jobTitle,status,joinDate,salary,salaryType,startContract,endContract,discordId,githubUsername\nJajang Surajang,jajang@hr.local,081234,081235,3271234567890001,Laki-laki,Jakarta,1990-01-01,01.234.567.8-901.000,TK0,BCA,1234567890,Jl. Contoh No. 1,Frontend Developer,PROBATION,2024-01-01,5000000,GROSS,2024-01-01,2024-06-30,1234567890,jajang-hr"
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "employee_import_template.csv"
    link.click()
  }

  return (
    <dialog id="import_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Import Employees (CSV)</h3>
        
        <div className="alert mb-4 text-sm bg-gray-900 text-white">
          <div>
            <p>Upload a CSV file to bulk create employees.</p>
            <button onClick={downloadTemplate} className="btn btn-sm mt-2 bg-white text-gray-900 hover:bg-gray-100 rounded-full border-0">Download Template</button>
          </div>
        </div>

        <input 
          type="file" 
          accept=".csv"
          className="file-input file-input-bordered w-full mb-4" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="modal-action">
          <form method="dialog">
            <button className="btn" disabled={isUploading}>Cancel</button>
          </form>
          <button
            className="btn btn-primary rounded-full"
            onClick={handleImport}
            disabled={!file || isUploading}
          >
            {isUploading ? <span className="loading loading-spinner"></span> : 'Import Data'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button disabled={isUploading}>close</button>
      </form>
    </dialog>
  )
}
