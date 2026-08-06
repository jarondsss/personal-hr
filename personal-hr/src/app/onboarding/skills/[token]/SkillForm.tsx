"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { submitSkills } from "./actions"
import { useRouter } from "next/navigation"

const LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
]

export default function SkillForm({ link, existing }: { link: any; existing?: any[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<
    { key: string; skill: string; level: string }[]
  >(
    existing && existing.length > 0
      ? existing.map((s, i) => ({ key: `${i}-${Date.now()}`, skill: s.skill, level: s.level }))
      : [{ key: "0", skill: "", level: "INTERMEDIATE" }]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { key: `${prev.length}-${Date.now()}`, skill: "", level: "INTERMEDIATE" },
    ])

  const updateRow = (key: string, patch: Partial<{ skill: string; level: string }>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const removeRow = (key: string) =>
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.key !== key)))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSaved(false)
    try {
      const result = await submitSkills(link.token, new FormData(e.currentTarget))
      if (result?.ok) {
        setSaved(true)
        router.refresh() // triggers server re-fetch → page.tsx key changes → SkillForm remounts with fresh data
      } else {
        alert("Failed to save skills")
      }
    } catch (err) {
      console.error("submitSkills error:", err)
      alert("Error submitting skills")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {rows.map((row, i) => (
            <div key={row.key} className="flex gap-3 items-start">
              <input
                type="hidden"
                name={`key_${i}`}
                value={row.key}
              />
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium">
                    Skill {existing && existing.length > 0 ? "Name" : `#${i + 1}`} *
                  </span>
                </label>
                <input
                  type="text"
                  name={`skill_${i}`}
                  value={row.skill}
                  onChange={(e) => updateRow(row.key, { skill: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="e.g. React, TypeScript, Project Management"
                  required
                />
              </div>
              <div className="form-control w-44">
                <label className="label">
                  <span className="label-text font-medium">Level</span>
                </label>
                <select
                  name={`level_${i}`}
                  value={row.level}
                  onChange={(e) => updateRow(row.key, { level: e.target.value })}
                  className="select select-bordered w-full"
                >
                  {LEVELS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="btn btn-ghost btn-square mt-9 text-error"
                disabled={rows.length === 1}
                aria-label="Remove skill"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addRow} className="btn btn-outline btn-primary rounded-xl">
            <Plus size={16} /> Add Skill
          </button>

          <div className="divider"></div>

          <div className="flex justify-end gap-3">
            <p className="text-xs opacity-60 self-center mr-auto">
              You can reopen this link anytime to update your skills.
            </p>
            {saved && (
              <span className="text-success self-center font-medium">Skills saved!</span>
            )}
            <button type="submit" className="btn btn-primary px-8 rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner"></span> : "Save Skills"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}