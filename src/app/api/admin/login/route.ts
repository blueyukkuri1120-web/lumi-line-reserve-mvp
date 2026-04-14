import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/constants";
import { createAdminSessionToken } from "@/lib/admin-auth";
import { getRequiredEnv } from "@/lib/env";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const parsed = adminLoginSchema.parse(await request.json());

    if (
      parsed.email !== getRequiredEnv("ADMIN_EMAIL") ||
      parsed.password !== getRequiredEnv("ADMIN_PASSWORD")
    ) {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが違います。" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: adminSessionCookieName,
      value: createAdminSessionToken(parsed.email),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ログインに失敗しました。" },
      { status: 400 },
    );
  }
}
