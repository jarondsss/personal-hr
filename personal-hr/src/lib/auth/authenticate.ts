import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { findLockout, recordAttempt, pruneAttempts } from "../rate-limit";

// Hash of a throwaway value. Compared against when the email does not exist so
// that the response time does not reveal which accounts are registered.
const DUMMY_HASH = "$2b$10$kW8RgyQsnRF4oMkHb3OhkuBa9iLwWHQNkOGpM/YW9R/16DUJk2JCu";

export type AuthResult =
  | { status: "ok"; user: { id: string; role: string; sessionVersion: number } }
  | { status: "invalid" }
  | { status: "locked"; retryAfterMinutes: number };

/**
 * Verifies credentials and applies the login rate limit.
 * Keep this free of Next.js request APIs so it stays unit-testable.
 */
export async function authenticate(
  rawEmail: string,
  password: string,
  ip: string
): Promise<AuthResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !password) return { status: "invalid" };

  const lockout = await findLockout(email, ip);
  if (lockout) {
    return { status: "locked", retryAfterMinutes: lockout.retryAfterMinutes };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always spend the same amount of time hashing, whether or not the account
  // exists, so response timing cannot be used to enumerate users.
  const isPasswordValid = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH
  );

  if (!user || !isPasswordValid) {
    await recordAttempt(email, ip, false);
    await pruneAttempts();
    return { status: "invalid" };
  }

  await recordAttempt(email, ip, true);
  return {
    status: "ok",
    user: {
      id: user.id,
      role: user.role,
      sessionVersion: user.sessionVersion,
    },
  };
}
