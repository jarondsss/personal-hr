"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Employees", href: "/dashboard/employees", icon: "Users" },
  { label: "Projects", href: "/dashboard/projects", icon: "FolderKanban" },
  { label: "Master Data", href: "/dashboard/master-data", icon: "Database" },
  { label: "Leave", href: "/dashboard/leave", icon: "CalendarDays" },
  { label: "Overtime", href: "/dashboard/overtime", icon: "Clock" },
  { label: "OT Periods", href: "/dashboard/overtime-periods", icon: "CalendarClock" },
  { label: "Payroll", href: "/dashboard/payroll", icon: "Wallet" },
  { label: "Documents", href: "/dashboard/documents", icon: "FileText" },
  { label: "E-Signature", href: "/dashboard/e-sign", icon: "PenSignature" },
]

export default function SidebarNav() {
  const pathname = usePathname()

  const closeDrawer = () => {
    const cb = document.getElementById("sidebar-drawer") as HTMLInputElement
    if (cb) cb.checked = false
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          padding: "8px 8px 6px",
        }}
      >
        Menu
      </div>
      <div className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`side-nav-link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={closeDrawer}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function NavIcon({ name }: { name: string }) {
  const props: React.SVGProps<SVGSVGElement> = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { flexShrink: 0, color: "var(--color-text-muted)" },
  }

  switch (name) {
    case "LayoutDashboard":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      )
    case "Users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case "FolderKanban":
      return (
        <svg {...props}>
          <path d="M8 7h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.5a1 1 0 0 1 .83.44L9 5" />
          <rect x="12" y="12" width="2" height="5" />
          <rect x="16" y="12" width="2" height="5" />
          <line x1="11" y1="12" x2="19" y2="12" />
        </svg>
      )
    case "Database":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      )
    case "CalendarDays":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
          <path d="M8 18h.01" />
          <path d="M12 18h.01" />
          <path d="M16 18h.01" />
        </svg>
      )
    case "Clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    case "CalendarClock":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="12" cy="16" r="3" />
          <polyline points="12 14.5 12 16 13 16.5" />
        </svg>
      )
    case "Wallet":
      return (
        <svg {...props}>
          <rect x="1" y="5" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="11" x2="23" y2="11" />
          <circle cx="16" cy="15" r="1" />
        </svg>
      )
    case "FileText":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    case "PenSignature":
      return (
        <svg {...props}>
          <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2" />
          <path d="M20 3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" />
          <path d="M12 21h.01" />
          <path d="M6 21h6" />
          <path d="M3 21h.01" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
  }
}
