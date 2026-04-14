import { NextResponse } from "next/server";
import { getMenus } from "@/lib/reservations";

export async function GET() {
  try {
    const menus = await getMenus(true);
    return NextResponse.json({ menus });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メニュー取得に失敗しました。" },
      { status: 500 },
    );
  }
}
