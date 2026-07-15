"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="surface">
      <div className="stack-sm">
        <div className="row-between">
          <span className="t-title-md">Gagal memuat data</span>
          <span className="chip" data-tone="danger">
            Error
          </span>
        </div>
        <p className="t-body-sm t-muted">
          Tidak bisa terhubung ke database. Periksa koneksi atau variabel
          lingkungan <code>DATABASE_URL</code> di Vercel, lalu coba lagi.
        </p>
        <div>
          <button
            type="button"
            onClick={reset}
            className="btn btn-sm btn-primary rounded-full"
          >
            Coba lagi
          </button>
        </div>
      </div>
    </div>
  );
}
