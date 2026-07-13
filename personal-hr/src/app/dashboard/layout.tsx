import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ADMIN_ROLE, getSession } from "@/lib/session";
import { logout } from "./actions";
import SidebarNav from "./SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== ADMIN_ROLE) {
    redirect("/forbidden");
  }

  // Look up user info for the sidebar
  const user = session.userId
    ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          email: true,
          employee: { select: { fullName: true } },
        },
      })
    : null;

  const displayName = user?.employee?.fullName || user?.email?.split("@")[0] || "Admin";
  const displayEmail = user?.email || "";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Mobile header */}
      <header
        className="flex lg:hidden items-center justify-between px-4"
        style={{
          height: 56,
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-3">
          <label htmlFor="sidebar-drawer" className="flex items-center justify-center cursor-pointer" style={{ width: 36, height: 36 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-secondary)" }}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </label>
          <div className="flex items-center gap-2">
            <span
              className="block"
              style={{
                width: 20, height: 20, borderRadius: 6,
                background: "conic-gradient(from 220deg at 50% 50%, var(--color-primary), #1E2029 35%, #1E2029 65%, var(--color-primary))",
                border: "1px solid var(--color-border-strong)",
              }}
            />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)" }}>Personal HR</span>
          </div>
        </div>
        <div
          className="flex items-center justify-center"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "conic-gradient(from 200deg, var(--color-primary), var(--color-info), var(--color-primary))",
            border: "1px solid var(--color-border-strong)",
            fontSize: 13, fontWeight: 600, color: "#FFF",
          }}
        >
          {userInitial}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — hidden on mobile via drawer */}
        <input type="checkbox" id="sidebar-drawer" className="hidden peer" />

        {/* Overlay for mobile */}
        <label
          htmlFor="sidebar-drawer"
          className="fixed inset-0 z-30 bg-black/50 hidden peer-checked:block lg:hidden"
        />

        <aside
          className="fixed lg:sticky top-0 z-40 lg:z-0 h-screen w-[240px] -translate-x-full peer-checked:translate-x-0 lg:translate-x-0 transition-transform duration-200 flex flex-col"
          style={{
            backgroundColor: "var(--color-background)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          {/* Brand */}
          <div
            className="flex items-center gap-3 px-5"
            style={{
              height: 64,
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span
              className="block flex-shrink-0"
              style={{
                width: 24, height: 24, borderRadius: 7,
                background: "conic-gradient(from 220deg at 50% 50%, var(--color-primary), #1E2029 35%, #1E2029 65%, var(--color-primary))",
                border: "1px solid var(--color-border-strong)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", color: "var(--color-text-primary)" }}>
                Personal HR
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>
                v0.1.0
              </div>
            </div>
          </div>

          {/* Navigation */}
          <SidebarNav />

          {/* User footer */}
          <div
            className="mx-3 mb-4 p-3 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor: "var(--color-elevated)",
              border: "1px solid var(--color-border-strong)",
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "conic-gradient(from 200deg, var(--color-primary), var(--color-info), var(--color-primary))",
                border: "1px solid var(--color-border-strong)",
                fontSize: 14, fontWeight: 600, color: "#FFF",
              }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>{displayName}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-muted)" }}>{displayEmail}</div>
            </div>
            <form action={logout}>
              <button type="submit" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4, display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
          <div style={{ padding: "var(--space-8) var(--container-pad)", maxWidth: "var(--container-max)", marginInline: "auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

