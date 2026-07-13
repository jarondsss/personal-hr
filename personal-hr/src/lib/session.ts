import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_ROLE = "ADMIN_HR";

const DEFAULT_DEV_SECRET = "super-secret-key-for-dev-only-change-in-prod";

let _encodedKey: ReturnType<typeof TextEncoder.prototype.encode> | null = null;

function getEncodedKey() {
  if (_encodedKey) return _encodedKey;

  const secret = process.env.SESSION_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!secret || secret === DEFAULT_DEV_SECRET || secret.length < 32) {
      throw new Error("SESSION_SECRET must be set to a strong value in production.");
    }
  }

  _encodedKey = new TextEncoder().encode(secret || DEFAULT_DEV_SECRET);
  return _encodedKey;
}

export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
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
  cookieStore.delete("session");
}
