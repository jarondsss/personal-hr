"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getMasterData, addMasterData, deleteMasterData, getCompanyProfile, updateCompanyProfile, uploadCompanyLogo, removeCompanyLogo } from "./actions"

const CATEGORIES = [
  { value: "JOB_TITLE", label: "Job Title" },
  { value: "EMP_STATUS", label: "Employee Status" },
  { value: "LEAVE_TYPE", label: "Leave Type" },
  { value: "PUBLIC_HOLIDAY", label: "Public Holiday" },
]

const COMPANY_TAB = "COMPANY_SETTINGS"

export default function MasterDataPage() {
  const [data, setData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("JOB_TITLE")
  const [selectedCategory, setSelectedCategory] = useState("JOB_TITLE")
  const [error, setError] = useState<string | null>(null)

  // Company profile state
  const [companyProfile, setCompanyProfile] = useState<any>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyError, setCompanyError] = useState<string | null>(null)
  const [companySuccess, setCompanySuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  // Logo state
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refreshData = () => {
    getMasterData().then(setData)
  }

  const refreshCompany = () => {
    getCompanyProfile().then((profile) => {
      setCompanyProfile(profile)
      if (profile) {
        setCompanyName(profile.companyName || "")
        setCompanyEmail(profile.email || "")
        setCompanyPhone(profile.phone || "")
        setCompanyAddress(profile.address || "")
        setLogoUrl(profile.logoUrl || null)
      }
    })
  }

  useEffect(() => {
    refreshData()
    refreshCompany()
  }, [])

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setCompanyError(null)
    setCompanySuccess(null)

    const formData = new FormData()
    formData.set("companyName", companyName)
    formData.set("email", companyEmail)
    formData.set("phone", companyPhone)
    formData.set("address", companyAddress)

    const res = await updateCompanyProfile(formData)

    if (res?.error) {
      setCompanyError(res.error)
    } else {
      setCompanySuccess("Company profile saved successfully!")
      refreshCompany()
      setTimeout(() => setCompanySuccess(null), 3000)
    }

    setIsSaving(false)
  }

  const groupedData = data.reduce((acc: Record<string, any[]>, curr) => {
    if (!acc[curr.category]) acc[curr.category] = []
    acc[curr.category].push(curr)
    return acc
  }, {} as Record<string, any[]>)

  const activeItems = groupedData[activeTab] || []
  const jobTitleColumns = activeTab === "JOB_TITLE"
    ? [activeItems.slice(0, 10), activeItems.slice(10, 20)]
    : []
  const isCompanyTab = activeTab === COMPANY_TAB

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Data</h1>
        {!isCompanyTab && (
          <label
            htmlFor="add_modal"
            className="btn btn-primary rounded-full"
            onClick={() => {
              setSelectedCategory(activeTab)
              setError(null)
            }}
          >
            Add New Data
          </label>
        )}
      </div>

      <div className="halo-tabs relative my-2" role="tablist">
        {[...CATEGORIES, { value: COMPANY_TAB, label: "Company Settings" }].map((cat) => {
          const isActive = activeTab === cat.value
          return (
            <button
              key={cat.value}
              className={`halo-tab relative z-10 transition-colors duration-150 ${
                isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
              }`}
              style={{ border: "none" }}
              onClick={() => {
                setActiveTab(cat.value)
                if (cat.value === COMPANY_TAB) refreshCompany()
              }}
              role="tab"
              aria-selected={isActive}
            >
              {cat.label}
              {isActive && (
                <motion.div
                  layoutId="active-master-data-tab"
                  className="absolute inset-0 bg-[var(--color-elevated)] border border-[var(--color-primary)] rounded-full -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {isCompanyTab ? (
          <motion.div
            key={COMPANY_TAB}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="card bg-base-100 shadow-xl border border-base-200"
          >
            <div className="card-body p-6 md:p-8">
              <h2 className="card-title text-lg border-b pb-3">Company Settings</h2>
              <p className="text-sm opacity-70 mb-6">
                Company information will appear on payslip printouts and other documents.
              </p>

              {companyError && (
                <div className="alert alert-error text-sm py-2 mb-4">
                  <span>{companyError}</span>
                </div>
              )}

              {companySuccess && (
                <div className="alert alert-success text-sm py-2 mb-4">
                  <span>{companySuccess}</span>
                </div>
              )}

              <form onSubmit={handleCompanySubmit} className="space-y-5 max-w-2xl">
                {/* Logo Upload */}
                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <label className="label min-h-10 p-0">
                    <span className="label-text">Company Logo</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-base-300 bg-base-200 flex items-center justify-center">
                        <img
                          src={logoUrl}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-base-300 bg-base-200 flex items-center justify-center text-base-content/40">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setIsUploadingLogo(true)
                          const fd = new FormData()
                          fd.set("logo", file)
                          const res = await uploadCompanyLogo(fd)
                          if (res?.success && res.logoUrl) {
                            setLogoUrl(res.logoUrl)
                            setCompanySuccess("Logo uploaded successfully!")
                            setTimeout(() => setCompanySuccess(null), 3000)
                          } else if (res?.error) {
                            setCompanyError(res.error)
                          }
                          setIsUploadingLogo(false)
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm rounded-full"
                        disabled={isUploadingLogo}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingLogo ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        )}
                        {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                      </button>
                      {logoUrl && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          onClick={async () => {
                            await removeCompanyLogo()
                            setLogoUrl(null)
                            setCompanySuccess("Logo removed!")
                            setTimeout(() => setCompanySuccess(null), 3000)
                          }}
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="col-start-2 text-xs opacity-60 -mt-2">Recommended: Square image, max 2MB</p>
                </div>

                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <label className="label min-h-10 p-0">
                    <span className="label-text">Company Name</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    className="input input-bordered"
                    placeholder="e.g. PT. Maju Jaya"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <label className="label min-h-10 p-0">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered"
                    placeholder="e.g. info@majujaya.com"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <label className="label min-h-10 p-0">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input input-bordered"
                    placeholder="e.g. +62 21 1234 5678"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                  <label className="label min-h-10 p-0">
                    <span className="label-text">Address</span>
                  </label>
                  <textarea
                    name="address"
                    className="textarea textarea-bordered"
                    placeholder="e.g. Jl. Sudirman No. 123, Jakarta"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-4 pt-2">
                  <button type="submit" className="btn btn-primary rounded-full col-start-2 justify-self-start" disabled={isSaving}>
                    {isSaving ? <span className="loading loading-spinner"></span> : "Save Company Profile"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="card bg-base-100 shadow-xl border border-base-200"
          >
            <div className="card-body">
              <h2 className="card-title text-lg border-b pb-2">
                {CATEGORIES.find((c) => c.value === activeTab)?.label}
              </h2>
              {activeTab === "JOB_TITLE" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {jobTitleColumns.map((items, index) => (
                    <div key={index} className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Label</th>
                            <th>Value</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item: any) => (
                            <tr key={item.id}>
                              <td>{item.label}</td>
                              <td><code className="bg-base-200 px-1 rounded">{item.value}</code></td>
                              <td>
                                <form action={async () => {
                                  await deleteMasterData(item.id)
                                  refreshData()
                                }}>
                                  <button type="submit" className="btn btn-ghost btn-xs text-error">Delete</button>
                                </form>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>{activeTab === "PUBLIC_HOLIDAY" ? "Holiday Name" : "Label"}</th>
                        <th>{activeTab === "PUBLIC_HOLIDAY" ? "Date" : "Value"}</th>
                        {activeTab === "LEAVE_TYPE" && <th>Quota</th>}
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItems.map((item: any) => {
                        const meta = item.metadata ? JSON.parse(item.metadata) : null
                        return (
                          <tr key={item.id}>
                            <td>{item.label}</td>
                            <td><code className="bg-base-200 px-1 rounded">{item.value}</code></td>
                            {activeTab === "LEAVE_TYPE" && <td>{meta?.quota || 0}</td>}
                            <td>
                              <form action={async () => {
                                await deleteMasterData(item.id)
                                refreshData()
                              }}>
                                <button type="submit" className="btn btn-ghost btn-xs text-error">Delete</button>
                              </form>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {activeItems.length === 0 && (
                <div className="text-center py-10 opacity-50">
                  No master data found. Click &ldquo;Add New Data&rdquo; to get started.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="checkbox" id="add_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Add Master Data</h3>

          {error && (
            <div className="alert alert-error mt-4 p-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          <form
            action={async (formData) => {
              setError(null)
              const res = await addMasterData(formData)

              if (res?.error) {
                setError(res.error)
              } else {
                refreshData()
                const modal = document.getElementById('add_modal') as HTMLInputElement
                if(modal) modal.checked = false

                // reset form
                const form = document.getElementById('add_form') as HTMLFormElement
                if(form) form.reset()
              }
            }}
            id="add_form"
            className="space-y-4 mt-4"
          >
            <div className="form-control">
              <label className="label"><span className="label-text">Category</span></label>
              <select
                name="category"
                className="select select-bordered"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="JOB_TITLE">Job Title</option>
                <option value="EMP_STATUS">Employee Status</option>
                <option value="LEAVE_TYPE">Leave Type</option>
                <option value="PUBLIC_HOLIDAY">Public Holiday</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  {selectedCategory === "PUBLIC_HOLIDAY" ? "Holiday Name" : "Label (Display Name)"}
                </span>
              </label>
              <input type="text" name="label" placeholder={selectedCategory === "PUBLIC_HOLIDAY" ? "e.g. Idul Fitri" : "e.g. Annual Leave"} className="input input-bordered" required />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  {selectedCategory === "PUBLIC_HOLIDAY" ? "Date (YYYY-MM-DD)" : "Value (System Code)"}
                </span>
              </label>
              <input
                type={selectedCategory === "PUBLIC_HOLIDAY" ? "date" : "text"}
                name="value"
                placeholder={selectedCategory === "PUBLIC_HOLIDAY" ? "" : "e.g. ANNUAL"}
                className={`input input-bordered ${selectedCategory !== "PUBLIC_HOLIDAY" ? "uppercase" : ""}`}
                required
              />
            </div>

            {selectedCategory === "LEAVE_TYPE" && (
              <div className="form-control border-l-4 border-primary pl-4 my-2">
                <label className="label"><span className="label-text">Default Quota (Days)</span></label>
                <input type="number" name="quota" placeholder="12" defaultValue="12" className="input input-bordered" required />
              </div>
            )}

            <div className="modal-action">
              <label htmlFor="add_modal" className="btn btn-ghost" onClick={() => setError(null)}>Cancel</label>
              <button type="submit" className="btn btn-primary rounded-full">Save</button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="add_modal" onClick={() => setError(null)}>Close</label>
      </div>
    </div>
  )
}
