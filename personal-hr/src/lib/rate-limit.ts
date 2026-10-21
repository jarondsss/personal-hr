import prisma from "./prisma";

export const MAX_ATTEMPTS_PER_EMAIL = 5;
export const MAX_ATTEMPTS_PER_IP = 20;
export const WINDOW_MINUTES = 15;
export const RETENTION_DAYS = 7;

type Lockout = {
  retryAt: Date;
  retryAfterMinutes: number;
};

/**
 * Returns null when the caller may attempt a login, otherwise the moment the
 * account/IP becomes usable again.
 */
export async function findLockout(
  email: string,
  ip: string
): Promise<Lockout | null> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const [emailAttempts, ipAttempts] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: { email, success: false, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.loginAttempt.findMany({
      where: { ip, success: false, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  const emailLocked = emailAttempts.length >= MAX_ATTEMPTS_PER_EMAIL;
  const ipLocked = ipAttempts.length >= MAX_ATTEMPTS_PER_IP;
  if (!emailLocked && !ipLocked) return null;

  // The attempt that frees a slot is the oldest one still inside the window.
  const blocking = emailLocked
    ? emailAttempts[emailAttempts.length - MAX_ATTEMPTS_PER_EMAIL]
    : ipAttempts[ipAttempts.length - MAX_ATTEMPTS_PER_IP];

  const retryAt = blocking.createdAt.getTime() + WINDOW_MINUTES * 60 * 1000;
  return {
    retryAt: new Date(retryAt),
    retryAfterMinutes: Math.max(1, Math.ceil((retryAt - Date.now()) / 60000)),
  };
}

export async function recordAttempt(
  email: string,
  ip: string,
  success: boolean
) {
  await prisma.loginAttempt.create({ data: { email, ip, success } });
  if (success) {
    // A successful login clears the failure history for that account.
    await prisma.loginAttempt.deleteMany({
      where: { email, success: false },
    });
  }
}

/** Drops attempts older than the retention window. */
export async function pruneAttempts() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
