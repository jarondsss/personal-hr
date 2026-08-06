"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitOnboarding } from "./actions"

export default function OnboardingForm({ candidate }: { candidate: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await submitOnboarding(candidate.token, formData)
      if (result?.ok) {
        router.refresh()
      } else {
        alert("Failed to submit form")
        setIsSubmitting(false)
      }
    } catch (err) {
      if (err instanceof Error && err.message) {
        alert(err.message)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200">
      <div className="card-body p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <section>
            <h2 className="text-xl font-semibold border-b pb-2 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Full Name *</span></label>
                <input type="text" name="fullName" defaultValue={candidate.name} className="input input-bordered w-full" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Email Address *</span></label>
                <input type="email" name="email" defaultValue={candidate.email} className="input input-bordered w-full" required readOnly />
                <label className="label"><span className="label-text-alt opacity-60">Locked</span></label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Phone Number *</span></label>
                <input type="text" name="phone" className="input input-bordered w-full" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Emergency Phone</span></label>
                <input type="text" name="phone2" className="input input-bordered w-full" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-2 mb-6">Identity & Tax Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">ID Card (KTP) *</span></label>
                <input type="text" name="idCardNumber" className="input input-bordered w-full" placeholder="16 digit KTP" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Gender *</span></label>
                <select name="gender" className="select select-bordered w-full" required defaultValue="">
                  <option value="" disabled>-- Select Gender --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Birth Place *</span></label>
                <input type="text" name="birthPlace" className="input input-bordered w-full" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Birth Date *</span></label>
                <input type="date" name="birthDate" className="input input-bordered w-full" required />
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">NPWP (Optional)</span></label>
                <input type="text" name="npwp" className="input input-bordered w-full" placeholder="15 digit NPWP" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Status PTKP (Pajak) *</span></label>
                <select name="taxStatus" className="select select-bordered w-full" required defaultValue="">
                  <option value="" disabled>-- Pilih Status PTKP --</option>
                  <option value="TK0">TK/0 (Tidak Kawin, 0 Tanggungan)</option>
                  <option value="TK1">TK/1 (Tidak Kawin, 1 Tanggungan)</option>
                  <option value="TK2">TK/2 (Tidak Kawin, 2 Tanggungan)</option>
                  <option value="TK3">TK/3 (Tidak Kawin, 3 Tanggungan)</option>
                  <option value="K0">K/0 (Kawin, 0 Tanggungan)</option>
                  <option value="K1">K/1 (Kawin, 1 Tanggungan)</option>
                  <option value="K2">K/2 (Kawin, 2 Tanggungan)</option>
                  <option value="K3">K/3 (Kawin, 3 Tanggungan)</option>
                  <option value="K10">K/I/0 (Kawin Istri Bekerja, 0 Tanggungan)</option>
                  <option value="K11">K/I/1 (Kawin Istri Bekerja, 1 Tanggungan)</option>
                  <option value="K12">K/I/2 (Kawin Istri Bekerja, 2 Tanggungan)</option>
                  <option value="K13">K/I/3 (Kawin Istri Bekerja, 3 Tanggungan)</option>
                </select>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text font-medium">Full Address *</span></label>
                <textarea name="address" className="textarea textarea-bordered h-24 w-full" required></textarea>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-2 mb-6">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Bank Name *</span></label>
                <select name="bankName" className="select select-bordered w-full" required defaultValue="BCA">
                  <option value="BCA">BCA (Free Transfer Fee)</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BRI">BRI</option>
                  <option value="OTHER">Bank Lainnya</option>
                </select>
                <label className="label"><span className="label-text-alt text-warning">Non-BCA = Potong biaya admin</span></label>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Account Number *</span></label>
                <input type="text" name="bankAccount" className="input input-bordered w-full" placeholder="e.g. 1234567890" required />
              </div>
            </div>
          </section>

          <div className="divider"></div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary px-8" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner"></span> : 'Submit Data'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  )
}
