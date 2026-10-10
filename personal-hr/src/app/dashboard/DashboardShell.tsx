"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarNav from "./SidebarNav";
import SidebarUserFooter from "./SidebarUserFooter";

const STORAGE_KEY = "ph-sidebar-collapsed";
const FULL_W = 228;
const RAIL_W = 68;

interface DashboardShellProps {
  children: React.ReactNode;
  displayName: string;
  displayEmail: string;
  userInitial: string;
}

function getInitialCollapsed() {
  try {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function getIsDesktop() {
  try {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    );
  } catch {
    return false;
  }
}

function CollapseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="14 9 13 12 14 15" />
    </svg>
  );
}

export default function DashboardShell({
  children,
  displayName,
  displayEmail,
  userInitial,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore — private mode / blocked storage
    }
  }, [collapsed]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Close mobile drawer with Escape for a11y
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const cb = document.getElementById(
          "sidebar-drawer"
        ) as HTMLInputElement | null;
        if (cb) cb.checked = false;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => setCollapsed((v) => !v);
  // Rail (icon-only) hanya di desktop — drawer mobile selalu full
  const rail = collapsed && isDesktop;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
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
            style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)" }}
            aria-label="Open navigation"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-text-secondary)" }}
            >
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
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
              }}
            >
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
        {/* Sidebar drawer checkbox (mobile) */}
        <input type="checkbox" id="sidebar-drawer" className="hidden peer" />

        {/* Mobile overlay */}
        <label
          htmlFor="sidebar-drawer"
          className="fixed inset-0 z-30 hidden peer-checked:block lg:hidden"
          style={{
            backgroundColor: "rgba(9,9,11,0.7)",
            backdropFilter: "blur(4px)",
          }}
          aria-hidden="true"
        />

        {/* Sidebar — drawer di mobile, collapsible icon-rail di desktop */}
        <motion.aside
          data-collapsed={collapsed ? "true" : "false"}
          initial={false}
          animate={{ width: rail ? RAIL_W : FULL_W }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed lg:sticky top-0 z-40 lg:z-0 h-screen flex flex-col overflow-hidden -translate-x-full peer-checked:translate-x-0 lg:translate-x-0"
          style={{
            backgroundColor: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Brand + collapse toggle */}
            <div
              className={
                rail
                  ? "flex flex-col items-center gap-2.5 py-3"
                  : "flex items-center gap-3 pl-5 pr-3"
              }
              style={{
                minHeight: rail ? undefined : 56,
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
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <AnimatePresence initial={false}>
                {!rail && (
                  <motion.div
                    key="brand-text"
                    className="flex-1 min-w-0"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 14,
                        letterSpacing: "-0.02em",
                        color: "var(--color-text-primary)",
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Personal HR
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        marginTop: 1,
                      }}
                    >
                      v0.1.0
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Desktop-only hide/show toggle — selalu terlihat, termasuk saat rail */}
              <motion.button
                type="button"
                onClick={toggle}
                title={rail ? "Show navbar" : "Hide navbar"}
                aria-label={rail ? "Show navbar" : "Hide navbar"}
                aria-pressed={rail}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className="hidden lg:flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-elevated)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <motion.span
                  animate={{ rotate: rail ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  style={{ display: "flex" }}
                >
                  <CollapseIcon />
                </motion.span>
              </motion.button>
            </div>

            {/* Navigation (icon tetap terlihat saat rail) */}
            <SidebarNav rail={rail} />

            {/* User footer */}
            <SidebarUserFooter
              displayName={displayName}
              displayEmail={displayEmail}
              userInitial={userInitial}
              rail={rail}
            />
          </div>
        </motion.aside>

        {/* Main content */}
        <main
          className="flex-1 min-h-screen min-w-0"
          style={{ backgroundColor: "var(--color-background)" }}
        >
          <div className="halo-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
