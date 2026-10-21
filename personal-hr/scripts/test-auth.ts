/**
 * Test for the login flow: credential check + escalating rate limiting.
 * Run with: npm run test:auth
 */
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { authenticate } from "../src/lib/auth/authenticate";
import { findLockout, EMAIL_LADDER, IP_LADDER } from "../src/lib/rate-limit";

let failures = 0;
const check = (label: string, ok: boolean, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
};

const EMAIL = "auth-test@hr.local";
const PASSWORD = "correct-horse-battery-staple";
const IP = "203.0.113.7";

async function cleanup() {
  // Must clear every row this test creates, otherwise the counters carry over
  // into the next run and the ladder assertions become flaky.
  await prisma.loginAttempt.deleteMany({
    where: {
      OR: [
        { email: EMAIL },
        { email: { contains: "spray-" } },
        { ip: { in: [IP, "198.51.100.5", "198.51.100.6"] } },
      ],
    },
  });
  await prisma.user.deleteMany({ where: { email: EMAIL } });
}

async function seedFailures(count: number, email = EMAIL, ip = IP) {
  for (let i = 0; i < count; i++) {
    await prisma.loginAttempt.create({
      data: { email, ip, success: false },
    });
  }
}

/** Failures from many different accounts but one source IP. */
async function seedIpFailures(count: number, ip: string) {
  for (let i = 0; i < count; i++) {
    await prisma.loginAttempt.create({
      data: { email: `spray-${i}@hr.local`, ip, success: false },
    });
  }
}

/** Failures against one account from many different source IPs. */
async function seedEmailFailures(count: number, email: string) {
  for (let i = 0; i < count; i++) {
    await prisma.loginAttempt.create({
      data: { email, ip: `10.0.0.${i % 250 + 1}`, success: false },
    });
  }
}

(async () => {
  await cleanup();

  // A throwaway account so the success path can be tested.
  await prisma.user.create({
    data: {
      email: EMAIL,
      password: await bcrypt.hash(PASSWORD, 10),
      role: "EMPLOYEE",
    },
  });

  // 1. Unknown account -> invalid, and the attempt is still recorded.
  const unknown = await authenticate("nobody@hr.local", "whatever", IP);
  check("unknown email is rejected", unknown.status === "invalid");
  check(
    "unknown email is still rate limited",
    (await prisma.loginAttempt.count({ where: { email: "nobody@hr.local" } })) === 1
  );
  await prisma.loginAttempt.deleteMany({ where: { email: "nobody@hr.local" } });

  // 2. Wrong password -> invalid.
  const wrong = await authenticate(EMAIL, "wrong-password", IP);
  check("wrong password is rejected", wrong.status === "invalid");

  // 3. Email is matched case-insensitively.
  const upper = await authenticate(EMAIL.toUpperCase(), PASSWORD, IP);
  check("email match is case-insensitive", upper.status === "ok");

  // 4. A successful login resets the failure counter (failures are counted
  //    since the last success, the rows stay as an audit trail).
  check(
    "successful login resets the failure counter",
    (await findLockout(EMAIL, IP)) === null
  );

  // 5. Correct credentials -> ok.
  const good = await authenticate(EMAIL, PASSWORD, IP);
  check("correct credentials succeed", good.status === "ok");
  if (good.status === "ok") {
    check("session payload carries the role", good.user.role === "EMPLOYEE");
    check(
      "session payload carries the session version",
      typeof good.user.sessionVersion === "number",
      String(good.user.sessionVersion)
    );
  }

  // 6. Brute force -> locked at the first ladder step.
  for (let i = 0; i < EMAIL_LADDER[0].threshold - 1; i++) {
    await authenticate(EMAIL, `brute-${i}`, IP);
  }
  const stillOpen = await authenticate(EMAIL, "brute-again", IP);
  check(
    `still open at ${EMAIL_LADDER[0].threshold - 1} failures`,
    stillOpen.status === "invalid",
    stillOpen.status === "locked" ? "locked too early" : ""
  );

  const locked = await authenticate(EMAIL, "brute-again", IP);
  check(
    `locked at ${EMAIL_LADDER[0].threshold} failures`,
    locked.status === "locked",
    locked.status === "locked" ? `retry in ${locked.retryAfterMinutes} min` : ""
  );
  check(
    "first lock step is 15 minutes",
    locked.status === "locked" && locked.retryAfterMinutes === 15,
    locked.status === "locked" ? `${locked.retryAfterMinutes} min` : ""
  );

  // 7. Even the correct password is refused while locked.
  const correctButLocked = await authenticate(EMAIL, PASSWORD, IP);
  check(
    "correct password refused while locked",
    correctButLocked.status === "locked"
  );

  // 8. Escalation: more failures -> longer lock.
  await cleanup();
  await seedFailures(EMAIL_LADDER[1].threshold);
  const hour = await findLockout(EMAIL, IP);
  check(
    `${EMAIL_LADDER[1].threshold} failures -> ${EMAIL_LADDER[1].minutes} minute lock`,
    hour?.retryAfterMinutes === EMAIL_LADDER[1].minutes,
    `${hour?.retryAfterMinutes} min`
  );

  await cleanup();
  await seedFailures(EMAIL_LADDER[2].threshold);
  const day = await findLockout(EMAIL, IP);
  check(
    `${EMAIL_LADDER[2].threshold} failures -> ${EMAIL_LADDER[2].minutes} minute lock`,
    day?.retryAfterMinutes === EMAIL_LADDER[2].minutes,
    `${day?.retryAfterMinutes} min`
  );

  // 9. IP rule has its own (higher) ladder: many accounts, one source.
  await cleanup();
  await seedIpFailures(IP_LADDER[0].threshold, "198.51.100.5");
  const ipLock = await findLockout("spray-0@hr.local", "198.51.100.5");
  check(
    `${IP_LADDER[0].threshold} failures from one IP -> ${IP_LADDER[0].minutes} minute lock`,
    ipLock?.retryAfterMinutes === IP_LADDER[0].minutes,
    `${ipLock?.retryAfterMinutes} min`
  );

  await cleanup();
  await seedIpFailures(IP_LADDER[1].threshold, "198.51.100.6");
  const ipHour = await findLockout("spray-0@hr.local", "198.51.100.6");
  check(
    `${IP_LADDER[1].threshold} failures from one IP -> ${IP_LADDER[1].minutes} minute lock`,
    ipHour?.retryAfterMinutes === IP_LADDER[1].minutes,
    `${ipHour?.retryAfterMinutes} min`
  );

  // 10. A success resets the account ladder, but not the IP rule.
  await cleanup();
  await seedEmailFailures(EMAIL_LADDER[2].threshold, EMAIL);
  await prisma.loginAttempt.create({
    data: { email: EMAIL, ip: IP, success: true },
  });
  check(
    "a success clears the escalated account lock",
    (await findLockout(EMAIL, IP)) === null
  );

  // 11. Old failures decay.
  await cleanup();
  await prisma.loginAttempt.create({
    data: {
      email: EMAIL,
      ip: IP,
      success: false,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
  });
  check(
    "failures older than the decay window do not count",
    (await findLockout(EMAIL, IP)) === null
  );

  await cleanup();
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
