import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { saveBusinessSettings } from "@/lib/reservations";
import { businessSettingsSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = businessSettingsSchema.parse(await request.json());
    const settings = await saveBusinessSettings(parsed);
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "店舗設定の保存に失敗しました。" },
      { status: 400 },
    );
  }
}
