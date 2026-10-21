/**
 * Test for the login flow: credential check + rate limiting.
 * Run with: npm run test:auth
 */
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { authenticate } from "../src/lib/auth/authenticate";
import { findLockout, MAX_ATTEMPTS_PER_EMAIL } from "../src/lib/rate-limit";

let failures = 0;
const check = (label: string, ok: boolean, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
};

const EMAIL = "auth-test@hr.local";
const PASSWORD = "correct-horse-battery-staple";
const IP = "203.0.113.7";

async function cleanup() {
  await prisma.loginAttempt.deleteMany({ where: { email: EMAIL } });
  await prisma.loginAttempt.deleteMany({ where: { ip: IP } });
  await prisma.user.deleteMany({ where: { email: EMAIL } });
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

  // 4. A successful login clears the failure history.
  check(
    "successful login clears failures",
    (await findLockout(EMAIL, IP)) === null
  );

  // 5. Correct credentials -> ok.
  const good = await authenticate(EMAIL, PASSWORD, IP);
  check("correct credentials succeed", good.status === "ok");
  if (good.status === "ok") {
    check("session payload carries the role", good.user.role === "EMPLOYEE");
  }

  // 6. Brute force -> locked after the threshold.
  for (let i = 0; i < MAX_ATTEMPTS_PER_EMAIL - 1; i++) {
    await authenticate(EMAIL, `brute-${i}`, IP);
  }
  const stillOpen = await authenticate(EMAIL, "brute-again", IP);
  check(
    `still open at ${MAX_ATTEMPTS_PER_EMAIL - 1} failures`,
    stillOpen.status === "invalid",
    stillOpen.status === "locked" ? "locked too early" : ""
  );

  const locked = await authenticate(EMAIL, "brute-again", IP);
  check(
    `locked at ${MAX_ATTEMPTS_PER_EMAIL} failures`,
    locked.status === "locked",
    locked.status === "locked" ? `retry in ${locked.retryAfterMinutes} min` : ""
  );

  // 7. Even the correct password is refused while locked.
  const correctButLocked = await authenticate(EMAIL, PASSWORD, IP);
  check(
    "correct password refused while locked",
    correctButLocked.status === "locked"
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
