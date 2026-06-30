import { getEmployeesForDocument, getDocumentTemplates } from "./actions"
import DocumentGenerator from "./DocumentGenerator"
import TemplateManager from "./TemplateManager"

export const metadata = {
  title: "Documents | Personal HR",
}

export default async function DocumentsPage() {
  const employees = await getEmployeesForDocument()
  const templates = await getDocumentTemplates()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-base-content/70 mt-1">Generate dynamic .docx files for employees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocumentGenerator employees={employees} templates={templates} />
        <TemplateManager templates={templates} />
      </div>
    </div>
  )
}
