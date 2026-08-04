"use client"

import { useState } from "react"
import { uploadTemplate, deleteTemplate } from "./actions"
import { Trash2 } from "lucide-react"

export default function TemplateManager({ templates }: { templates: any[] }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    const form = e.currentTarget

    try {
      const formData = new FormData(form)
      await uploadTemplate(formData)
      form.reset()
    } catch (err) {
      console.error(err)
      alert("Failed to upload template")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm("Delete this template?")) return
    try {
      await deleteTemplate(id, fileName)
    } catch (err: any) {
      alert(err.message || "Failed to delete")
    }
  }

  return (
    <div className="surface">
      <div className="p-6">
        <h2 className="t-title-md text-xl mb-4">Manage Templates</h2>
        
        <form onSubmit={handleUpload} className="mb-6 bg-base-200 p-4 rounded-lg flex flex-col gap-4">
          <h3 className="font-medium text-sm">Upload New Template</h3>
          <input 
            type="text" 
            name="name" 
            placeholder="Template Name (e.g. Surat Teguran)" 
            className="input input-bordered w-full"
            required
          />
          <div className="flex gap-2">
            <input 
              type="file" 
              name="file" 
              accept=".docx" 
              className="file-input file-input-bordered w-full" 
              required
            />
            <button type="submit" className="btn btn-primary rounded-full" disabled={isUploading}>
              {isUploading ? <span className="loading loading-spinner"></span> : 'Upload'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>File</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tpl => (
                <tr key={tpl.id}>
                  <td className="font-medium">{tpl.name}</td>
                  <td className="text-xs font-mono">{tpl.fileName}</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(tpl.id, tpl.fileName)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
