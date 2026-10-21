/**
 * Runtime test for the session cookie + proxy guards.
 * Needs a running server: BASE_URL=http://localhost:3113 npm run test:session
 */
import "dotenv/config";
import { decrypt, encrypt, SESSION_TTL_MS } from "../src/lib/auth/token";

const BASE = process.env.BASE_URL || "http://localhost:3113";

let failures = 0;
const check = (label: string, ok: boolean, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
};

async function hit(path: string, cookie?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
  return {
    status: res.status,
    location: res.headers.get("location"),
    setCookie: res.headers.get("set-cookie"),
  };
}

(async () => {
  const userId = "test-user-id";
  const role = "ADMIN_HR";

  // 1. No cookie -> protected route redirects to /login
  const anon = await hit("/dashboard");
  check(
    "no session -> /dashboard redirects to /login",
    anon.status === 307 && anon.location?.includes("/login") === true,
    `${anon.status} ${anon.location}`
  );

  // 2. Valid session -> allowed, and the cookie is refreshed
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = await encrypt({ userId, role, expiresAt });
  const authed = await hit("/dashboard", `session=${token}`);
  check(
    "valid session -> /dashboard is served",
    authed.status === 200,
    `${authed.status}`
  );

  const refreshed = authed.setCookie ?? "";
  const maxAge = refreshed.match(/expires=([^;]+)/i)?.[1];
  const days = maxAge ? (new Date(maxAge).getTime() - Date.now()) / 86400000 : 0;
  check(
    "session is refreshed to a 1 day window",
    days > 0.9 && days <= 1.01,
    `${days.toFixed(3)} days`
  );
  check(
    "refreshed cookie is httpOnly",
    /httponly/i.test(refreshed),
    refreshed.slice(0, 60)
  );

  // 3. The refreshed token is a valid token again
  const newToken = refreshed.match(/session=([^;]+)/)?.[1];
  const decoded = await decrypt(newToken);
  check(
    "refreshed token decodes back to the same user",
    decoded?.userId === userId && decoded?.role === role,
    JSON.stringify(decoded)
  );

  // 4. Tampered token -> rejected
  const tampered = `${token.slice(0, -3)}abc`;
  const bad = await hit("/dashboard", `session=${tampered}`);
  check(
    "tampered session -> redirected to /login",
    bad.status === 307 && bad.location?.includes("/login") === true,
    `${bad.status} ${bad.location}`
  );

  // 5. Expired token -> rejected
  const expiredToken = await encrypt({
    userId,
    role,
    expiresAt: new Date(Date.now() - 1000),
  });
  const expired = await hit("/dashboard", `session=${expiredToken}`);
  check(
    "expired session -> redirected to /login",
    expired.status === 307 && expired.location?.includes("/login") === true,
    `${expired.status} ${expired.location}`
  );

  // 6. Logged-in user hitting /login gets bounced to the dashboard
  const bounce = await hit("/login", `session=${token}`);
  check(
    "valid session on /login -> redirects to /dashboard",
    bounce.status === 307 && bounce.location?.includes("/dashboard") === true,
    `${bounce.status} ${bounce.location}`
  );

  // 7. API routes are outside the proxy matcher, so they must check the
  //    session and the role themselves.
  const apiAdmin = await hit("/api/projects", `session=${token}`);
  check(
    "api route accepts an admin session",
    apiAdmin.status === 200,
    `${apiAdmin.status}`
  );

  const employeeToken = await encrypt({
    userId,
    role: "EMPLOYEE",
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  const apiEmployee = await hit("/api/projects", `session=${employeeToken}`);
  check(
    "api route rejects a non-admin session",
    apiEmployee.status === 403,
    `${apiEmployee.status}`
  );

  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
