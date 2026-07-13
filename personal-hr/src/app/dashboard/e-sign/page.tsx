import React from "react"
import PageTransition from "@/components/PageTransition"

export default function ESignPage() {
  return (
    <PageTransition>
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
      <div className="max-w-md p-8 bg-base-100 rounded-2xl shadow-sm border border-base-200">
        <h2 className="text-2xl font-bold mb-2">NVP Sign</h2>
        <p className="opacity-70 mb-8 text-sm">
          For security and authentication reasons, the E-Signature portal must be opened in a secure separate window.
        </p>
        <a
          href="https://sign.nvpdev.tech/signin"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full rounded-full"
        >
          Open E-Signature Portal
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
        </a>
      </div>
    </div>
    </PageTransition>
  )
}
