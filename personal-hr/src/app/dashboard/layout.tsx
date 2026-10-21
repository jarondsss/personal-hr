import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ADMIN_ROLE, getVerifiedSession } from "@/lib/session";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getVerifiedSession();

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
    <DashboardShell
      displayName={displayName}
      displayEmail={displayEmail}
      userInitial={userInitial}
    >
      {children}
    </DashboardShell>
  );
}
