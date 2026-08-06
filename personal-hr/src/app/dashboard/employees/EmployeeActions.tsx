"use client"

import Link from "next/link"
import { Upload, Link as LinkIcon, Plus, Star } from "lucide-react"

export default function EmployeeActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-end">
      <button
        className="btn btn-outline btn-primary rounded-full"
        onClick={() => (document.getElementById('import_modal') as HTMLDialogElement)?.showModal()}
      >
        <Upload size={16} /> Import CSV
      </button>

      <button
        className="btn btn-outline btn-primary rounded-full"
        onClick={() => (document.getElementById('onboarding_modal') as HTMLDialogElement)?.showModal()}
      >
        <LinkIcon size={16} /> Self-Onboarding
      </button>

      <button
        className="btn btn-outline btn-primary rounded-full"
        onClick={() => (document.getElementById('skill_modal') as HTMLDialogElement)?.showModal()}
      >
        <Star size={16} /> Skills Links
      </button>

      <Link href="/dashboard/employees/new" className="btn btn-primary rounded-full">
        <Plus size={16} /> Add Manual
      </Link>
    </div>
  )
}
