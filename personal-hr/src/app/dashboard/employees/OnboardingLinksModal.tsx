"use client"

import { useState } from "react"
import { createOnboardingLink, deleteOnboardingLink } from "./actions.import"
import { Trash2, Copy, Check } from "lucide-react"

export default function OnboardingLinksModal({ links }: { links: any[] }) {
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)
    const form = e.currentTarget
    try {
      await createOnboardingLink(new FormData(form))
      form.reset()
    } catch (err) {
      if (err instanceof Error && err.message) {
        alert(err.message)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/onboarding/${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <dialog id="onboarding_modal" className="modal">
      <div className="modal-box w-11/12 max-w-4xl">
        <h3 className="font-bold text-lg mb-4">Self-Onboarding Links</h3>
        <p className="text-sm opacity-70 mb-6">Create unique links to send to new hires. They can fill their own details.</p>
        
        <form onSubmit={handleCreate} className="flex gap-4 mb-8 p-4 bg-base-200 rounded-lg border border-border">
          <input type="text" name="name" placeholder="Candidate Name" className="input input-bordered w-full" required />
          <input type="email" name="email" placeholder="Candidate Email" className="input input-bordered w-full" required />
          <button type="submit" className="btn btn-primary rounded-full" disabled={isCreating}>
            {isCreating ? <span className="loading loading-spinner"></span> : 'Generate Link'}
          </button>
        </form>

        <div className="overflow-x-auto h-64 border border-border rounded-lg">
          <table className="table table-sm">
            <thead>
              <tr className="border-b border-border">
                <th>Candidate</th>
                <th>Status</th>
                <th>Link</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 && (
                <tr><td colSpan={4} className="text-center opacity-50 py-8">No active links generated.</td></tr>
              )}
              {links.map(l => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td>
                    <div className="font-semibold text-primary">{l.name}</div>
                    <div className="text-xs text-secondary mt-0.5">{l.email}</div>
                  </td>
                  <td>
                    <span className="chip" data-tone={l.isUsed ? 'success' : 'warning'}>
                      {l.isUsed ? 'Used' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => copyLink(l.token)}
                      className="btn btn-xs btn-outline"
                    >
                      {copied === l.token ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      {copied === l.token ? 'Copied' : 'Copy URL'}
                    </button>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => deleteOnboardingLink(l.id)}
                      className="btn btn-xs btn-ghost text-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
  )
}
