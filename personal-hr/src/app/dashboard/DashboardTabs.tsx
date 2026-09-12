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
    { id: "reports", label: "Reports" },
  ]

  return (
    <div
      className="halo-tabs"
      role="tablist"
      style={{ flexShrink: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id
        return (
          <Link
            key={tab.id}
            href={`/dashboard?tab=${tab.id}`}
            className={`halo-tab no-underline relative`}
            style={{
              color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              backgroundColor: isActive ? "var(--color-surface)" : "transparent",
              boxShadow: isActive ? "var(--shadow-xs)" : "none",
            }}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
