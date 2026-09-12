"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* Top-right glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Brand mark */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
              }}
            >
              Personal HR
            </span>
          </div>
        </div>

        {/* Middle content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 4,
              backgroundColor: "var(--color-primary-soft)",
              border: "1px solid var(--color-primary-border)",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 2,
                backgroundColor: "var(--color-primary)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--color-primary-hover)",
              }}
            >
              HR Management
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: "var(--color-text-primary)",
              margin: 0,
              marginBottom: 12,
            }}
          >
            Manage your team
            <br />
            with confidence.
          </h1>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 32,
            }}
          >
            Employees, payroll, leave, overtime, and documents —
            all in one clean workspace.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Employee database & profiles",
              "Leave & overtime management",
              "Automated payroll & payslips",
              "Contract & document generation",
            ].map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: "var(--color-success-soft)",
                    border: "1px solid var(--color-success-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
          }}
        >
          Internal use only · v0.1.0
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile brand */}
        <div
          className="flex lg:hidden items-center gap-2 mb-10"
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Personal HR
          </span>
        </div>

        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.375rem",
                fontWeight: 600,
                letterSpacing: "-0.022em",
                color: "var(--color-text-primary)",
                margin: 0,
                marginBottom: 6,
              }}
            >
              Sign in to your account
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Enter your credentials to access the dashboard.
            </p>
          </div>

          {/* Form */}
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="email"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="admin@company.com"
                autoComplete="email"
                required
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border-strong)",
                  backgroundColor: "var(--color-elevated)",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--color-primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--color-border-strong)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="password"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border-strong)",
                  backgroundColor: "var(--color-elevated)",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--color-primary)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--color-border-strong)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Error */}
            {state?.error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-danger-soft)",
                  border: "1px solid var(--color-danger-border)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    color: "var(--color-danger)",
                  }}
                >
                  {state.error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              style={{
                width: "100%",
                height: 40,
                marginTop: 4,
                borderRadius: "var(--radius-sm)",
                backgroundColor: pending ? "var(--color-primary-pressed)" : "var(--color-primary)",
                border: "1px solid transparent",
                color: "#FFFFFF",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "0.9rem",
                letterSpacing: "-0.005em",
                cursor: pending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background-color 0.15s, opacity 0.15s",
                opacity: pending ? 0.8 : 1,
              }}
            >
              {pending ? (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
