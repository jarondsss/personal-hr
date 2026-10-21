import { cookies } from "next/headers";
import prisma from "./prisma";
import {
  ADMIN_ROLE,
  SESSION_TTL_MS,
  decrypt,
  encrypt,
  type SessionPayload,
} from "./auth/token";

export { ADMIN_ROLE };
export type { SessionPayload };

const COOKIE_NAME = "session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSession(
  userId: string,
  role: string,
  sessionVersion = 0
) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await encrypt({ userId, role, expiresAt, sv: sessionVersion });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    ...COOKIE_OPTIONS,
    expires: expiresAt,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return null;
  return await decrypt(session);
}

/**
 * Session check that also honours revocations: if the user's session version
 * was bumped (logout everywhere, or the account was disabled), the cookie is
 * no longer accepted.
 */
export async function getVerifiedSession() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { sessionVersion: true },
  });

  if (!user) return null;
  if ((session.sv ?? 0) !== user.sessionVersion) return null;

  return session;
}

export async function getRequiredSession() {
  const session = await getVerifiedSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getRequiredAdminSession() {
  const session = await getRequiredSession();
  if (session.role !== ADMIN_ROLE) {
    throw new Error("Forbidden");
  }
  return session;
}

export function isAdminSession(session: SessionPayload | null) {
  return session?.role === ADMIN_ROLE;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
