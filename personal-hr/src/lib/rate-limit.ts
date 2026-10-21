import prisma from "./prisma";

/**
 * Escalating lock ladder. The more consecutive failures an account (or an IP)
 * collects, the longer the lockout. A lock is anchored on the most recent
 * failure, so every new failure pushes the expiry further out.
 */
export const EMAIL_LADDER = [
  { threshold: 5, minutes: 15 },
  { threshold: 10, minutes: 60 },
  { threshold: 20, minutes: 60 * 24 },
];

export const IP_LADDER = [
  { threshold: 20, minutes: 15 },
  { threshold: 50, minutes: 60 },
  { threshold: 100, minutes: 60 * 24 },
];

/** Failures older than this stop counting towards the account lock. */
const EMAIL_DECAY_DAYS = 30;
/** Failures from one IP are only counted inside this window. */
const IP_WINDOW_HOURS = 24;

export const RETENTION_DAYS = 7;

type Ladder = { threshold: number; minutes: number }[];

type Lockout = {
  retryAt: Date;
  retryAfterMinutes: number;
};

function resolveLock(
  ladder: Ladder,
  failures: { createdAt: Date }[],
  now: number
): Lockout | null {
  if (failures.length === 0) return null;

  const step = [...ladder].reverse().find((s) => failures.length >= s.threshold);
  if (!step) return null;

  // failures are ordered newest first - the lock starts at the latest failure
  const lockedUntil = failures[0].createdAt.getTime() + step.minutes * 60_000;
  if (lockedUntil <= now) return null;

  return {
    retryAt: new Date(lockedUntil),
    retryAfterMinutes: Math.max(1, Math.ceil((lockedUntil - now) / 60_000)),
  };
}

/**
 * Returns null when the caller may attempt a login, otherwise when the
 * account/IP becomes usable again.
 */
export async function findLockout(
  email: string,
  ip: string
): Promise<Lockout | null> {
  const now = Date.now();

  const lastSuccess = await prisma.loginAttempt.findFirst({
    where: { email, success: true },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const decayStart = new Date(
    Math.max(
      now - EMAIL_DECAY_DAYS * 24 * 60 * 60 * 1000,
      lastSuccess?.createdAt.getTime() ?? 0
    )
  );
  const ipWindowStart = new Date(now - IP_WINDOW_HOURS * 60 * 60 * 1000);

  const [emailFailures, ipFailures] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: { email, success: false, createdAt: { gte: decayStart } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.loginAttempt.findMany({
      where: { ip, success: false, createdAt: { gte: ipWindowStart } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const emailLock = resolveLock(EMAIL_LADDER, emailFailures, now);
  const ipLock = resolveLock(IP_LADDER, ipFailures, now);

  if (!emailLock && !ipLock) return null;
  if (emailLock && ipLock) {
    return emailLock.retryAt > ipLock.retryAt ? emailLock : ipLock;
  }
  return emailLock ?? ipLock;
}

export async function recordAttempt(
  email: string,
  ip: string,
  success: boolean
) {
  // Failures are kept as an audit trail. The lock counter resets on its own,
  // because it only counts failures that happened after the last success.
  await prisma.loginAttempt.create({ data: { email, ip, success } });
}

/** Drops attempts older than the retention window. */
export async function pruneAttempts() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
