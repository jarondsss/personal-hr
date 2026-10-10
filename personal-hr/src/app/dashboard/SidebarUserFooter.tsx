"use client"

import { AnimatePresence, motion } from "framer-motion"
import { logout } from "./actions"

interface SidebarUserFooterProps {
  displayName: string
  displayEmail: string
  userInitial: string
  rail?: boolean
}

export default function SidebarUserFooter({ displayName, displayEmail, userInitial, rail = false }: SidebarUserFooterProps) {
  const avatar = (
    <div
      title={rail ? `${displayName} (${displayEmail})` : undefined}
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
  )

  const logoutButton = (
    <form action={logout} style={{ display: "flex" }}>
      <motion.button
        type="submit"
        title="Sign out"
        aria-label="Sign out"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          padding: 4,
          display: "flex",
          alignItems: "center",
          borderRadius: 4,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </motion.button>
    </form>
  )

  return (
    <div
      style={{
        margin: rail ? "0 10px 10px" : "0 12px 12px",
        padding: rail ? "10px 0" : "10px 12px",
        display: "flex",
        flexDirection: rail ? "column" : "row",
        alignItems: "center",
        justifyContent: rail ? "center" : "flex-start",
        gap: rail ? 8 : 10,
        backgroundColor: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        flexShrink: 0,
      }}
    >
      {avatar}
      <AnimatePresence initial={false}>
        {!rail && (
          <motion.div
            key="user-text"
            style={{ flex: 1, minWidth: 0 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      {logoutButton}
    </div>
  )
}
