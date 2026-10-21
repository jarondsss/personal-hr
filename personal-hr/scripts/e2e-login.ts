/**
 * End-to-end login test against a running server.
 *   BASE_URL=http://localhost:3113 npx tsx scripts/e2e-login.ts
 *
 * Creates a throwaway user, submits the real login form (same fields the
 * browser sends), and checks that a session cookie comes back and that the
 * dashboard then accepts it.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";

const BASE = process.env.BASE_URL || "http://localhost:3113";
const EMAIL = "e2e-login@hr.local";
const PASSWORD = "e2e-password-123";

let failures = 0;
const check = (label: string, ok: boolean, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? " -> " + extra : ""}`);
};

const unescapeHtml = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function actionFields(html: string) {
  const fields: [string, string][] = [];
  const re = /<input([^>]*)\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const name = m[1].match(/name="([^"]*)"/)?.[1];
    const value = m[1].match(/value="([^"]*)"/)?.[1];
    if (name && name.startsWith("$")) {
      fields.push([name, value === undefined ? "" : unescapeHtml(value)]);
    }
  }
  return fields;
}

async function submit(fields: [string, string][], email: string, password: string) {
  // React submits server action forms as multipart/form-data - urlencoded
  // bodies are not recognised as an action call.
  const body = new FormData();
  for (const [k, v] of fields) body.append(k, v);
  body.append("email", email);
  body.append("password", password);

  return fetch(`${BASE}/login`, {
    method: "POST",
    headers: { origin: BASE },
    body,
    redirect: "manual",
  });
}

(async () => {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.loginAttempt.deleteMany({ where: { email: EMAIL } });
  await prisma.user.create({
    data: {
      email: EMAIL,
      password: await bcrypt.hash(PASSWORD, 10),
      role: "ADMIN_HR",
    },
  });

  const html = await (await fetch(`${BASE}/login`)).text();
  const fields = actionFields(html);
  check("login form exposes action fields", fields.length > 0, fields.map((f) => f[0]).join(","));

  // 1. Wrong password -> no session cookie, attempt recorded
  const bad = await submit(fields, EMAIL, "wrong-password");
  const badCookie = bad.headers.get("set-cookie") ?? "";
  check(
    "wrong password does not issue a session cookie",
    !badCookie.includes("session="),
    badCookie.slice(0, 40)
  );
  check(
    "wrong password is recorded as an attempt",
    (await prisma.loginAttempt.count({ where: { email: EMAIL } })) === 1
  );

  // 2. Correct password -> session cookie issued
  const good = await submit(fields, EMAIL, PASSWORD);
  const goodCookie = good.headers.get("set-cookie") ?? "";
  check(
    "correct password issues a session cookie",
    goodCookie.includes("session="),
    goodCookie.slice(0, 40)
  );
  check(
    "session cookie is httpOnly + sameSite=lax",
    /httponly/i.test(goodCookie) && /samesite=lax/i.test(goodCookie)
  );

  // 3. That cookie opens the dashboard
  const token = goodCookie.match(/session=([^;]+)/)?.[1];
  const dash = await fetch(`${BASE}/dashboard`, {
    headers: { cookie: `session=${token}` },
    redirect: "manual",
  });
  check(
    "session cookie opens the dashboard",
    dash.status === 200,
    `${dash.status}`
  );

  // 4. The dashboard response slides the session forward
  const refreshed = dash.headers.get("set-cookie") ?? "";
  const expires = refreshed.match(/expires=([^;]+)/i)?.[1];
  const days = expires ? (new Date(expires).getTime() - Date.now()) / 86400000 : 0;
  check(
    "session slides forward on activity",
    days > 0.9 && days <= 1.01,
    `${days.toFixed(3)} days`
  );

  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.loginAttempt.deleteMany({ where: { email: EMAIL } });
  console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
})().catch(async (e) => {
  console.error(e);
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
  process.exit(1);
});
