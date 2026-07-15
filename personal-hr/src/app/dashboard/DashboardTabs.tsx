"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface DashboardTabsProps {
  currentTab: string
}

export default function DashboardTabs({ currentTab }: DashboardTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "reports", label: "Reports" }
  ]

  return (
    <div className="halo-tabs relative my-2" role="tablist" style={{ flexShrink: 0 }}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id
        return (
          <Link
            key={tab.id}
            href={`/dashboard?tab=${tab.id}`}
            className={`halo-tab no-underline relative z-10 transition-colors duration-150 ${
              isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
            }`}
            style={{ border: "none" }}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="active-dashboard-tab"
                className="absolute inset-0 bg-[var(--color-elevated)] border border-[var(--color-primary)] rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
