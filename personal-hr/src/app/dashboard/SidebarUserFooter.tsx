"use client"

import { logout } from "./actions"

interface SidebarUserFooterProps {
  displayName: string
  displayEmail: string
  userInitial: string
}

export default function SidebarUserFooter({ displayName, displayEmail, userInitial }: SidebarUserFooterProps) {
  return (
    <div
      style={{
        margin: "0 12px 12px",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        backgroundColor: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 7,
          backgroundColor: "var(--color-primary-soft)",
          border: "1px solid var(--color-primary-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-primary-hover)",
          fontFamily: "var(--font-display)",
          flexShrink: 0,
        }}
      >
        {userInitial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            color: "var(--color-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: 1,
          }}
        >
          {displayEmail}
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          title="Sign out"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            padding: 4,
            display: "flex",
            alignItems: "center",
            borderRadius: 4,
            transition: "color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </form>
    </div>
  )
}
