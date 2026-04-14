import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSessionCookieName } from "@/lib/constants";
import { getRequiredEnv } from "@/lib/env";

interface AdminSessionPayload {
  email: string;
  exp: number;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getRequiredEnv("ADMIN_SESSION_SECRET")).update(value).digest("base64url");
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  if (signature.length !== expected.length) {
    return null;
  }

  const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!isValid) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as AdminSessionPayload;
    if (!parsed.email || parsed.exp < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(adminSessionCookieName)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
