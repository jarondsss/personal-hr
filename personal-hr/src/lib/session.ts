import { cookies } from "next/headers";
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

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await encrypt({ userId, role, expiresAt });

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

export async function getRequiredSession() {
  const session = await getSession();
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
