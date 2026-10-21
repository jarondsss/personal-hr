import { SignJWT, jwtVerify } from "jose";

export const ADMIN_ROLE = "ADMIN_HR";

/**
 * Session lifetime. Short on purpose: this app holds payroll data, so a lost
 * laptop should not stay logged in for a week.
 */
export const SESSION_TTL_DAYS = 1;
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

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
  /**
   * Version of the user's session counter. Bumping it on the server
   * invalidates every token that was issued before.
   */
  sv: number;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    expiresAt: payload.expiresAt.toISOString(),
    sv: payload.sv ?? 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    // A number here would be read as an absolute NumericDate (seconds since
    // the epoch), which would make every token expire immediately.
    .setExpirationTime(payload.expiresAt)
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });

    if (!payload.exp || !payload.userId) return null;

    return {
      userId: String(payload.userId),
      role: String(payload.role ?? ""),
      expiresAt: new Date(payload.exp * 1000),
      sv: Number(payload.sv ?? 0),
    };
  } catch (error) {
    return null;
  }
}
