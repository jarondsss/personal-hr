import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ADMIN_ROLE, getSession } from "@/lib/session";
import SidebarNav from "./SidebarNav";
import SidebarUserFooter from "./SidebarUserFooter";

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

  let user: { email: string | null; employee: { fullName: string } | null } | null = null;
  try {
    user = session.userId
      ? await prisma.user.findUnique({
          where: { id: session.userId },
          select: {
            email: true,
            employee: { select: { fullName: true } },
          },
        })
      : null;
  } catch (err) {
    console.error("Failed to load dashboard user:", err);
  }

  const displayName = user?.employee?.fullName || user?.email?.split("@")[0] || "Admin";
  const displayEmail = user?.email || "";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Mobile header */}
      <header
        className="flex lg:hidden items-center justify-between px-4"
        style={{
          height: 52,
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-3">
          <label
            htmlFor="sidebar-drawer"
            className="flex items-center justify-center cursor-pointer"
            style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-secondary)" }}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </label>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
              Personal HR
            </span>
          </div>
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-primary-soft)",
            border: "1px solid var(--color-primary-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-primary-hover)",
            fontFamily: "var(--font-display)",
          }}
        >
          {userInitial}
        </div>
      </header>

      <div className="flex">
        {/* Sidebar drawer checkbox */}
        <input type="checkbox" id="sidebar-drawer" className="hidden peer" />

        {/* Mobile overlay */}
        <label
          htmlFor="sidebar-drawer"
          className="fixed inset-0 z-30 hidden peer-checked:block lg:hidden"
          style={{ backgroundColor: "rgba(9,9,11,0.7)", backdropFilter: "blur(4px)" }}
        />

        {/* Sidebar */}
        <aside
          className="fixed lg:sticky top-0 z-40 lg:z-0 h-screen w-[228px] -translate-x-full peer-checked:translate-x-0 lg:translate-x-0 transition-transform duration-200 flex flex-col"
          style={{
            backgroundColor: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          {/* Brand */}
          <div
            className="flex items-center gap-3 px-5"
            style={{
              height: 56,
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.02em", color: "var(--color-text-primary)", lineHeight: 1.2 }}>
                Personal HR
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-text-muted)", marginTop: 1 }}>
                v0.1.0
              </div>
            </div>
          </div>

          {/* Navigation */}
          <SidebarNav />

          {/* User footer */}
          <SidebarUserFooter
            displayName={displayName}
            displayEmail={displayEmail}
            userInitial={userInitial}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="halo-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
