import { NextResponse } from "next/server";
import { getBusinessSettings } from "@/lib/reservations";

export async function GET() {
  try {
    const settings = await getBusinessSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "店舗設定の取得に失敗しました。" },
      { status: 500 },
    );
  }
}
