"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth/authenticate";
import { createSession } from "@/lib/session";

async function getClientIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function login(prevState: any, formData: FormData) {
  const email = ((formData.get("email") as string) || "").trim();
  const password = (formData.get("password") as string) || "";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const result = await authenticate(email, password, await getClientIp());

  if (result.status === "locked") {
    return {
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${result.retryAfterMinutes} menit.`,
    };
  }

  if (result.status === "invalid") {
    return { error: "Invalid credentials" };
  }

  await createSession(result.user.id, result.user.role);
  redirect("/dashboard");
}
