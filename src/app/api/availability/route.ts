import { NextRequest, NextResponse } from "next/server";
import { getAvailableTimesForMenu } from "@/lib/availability";

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    const menuId = request.nextUrl.searchParams.get("menuId");

    if (!date || !menuId) {
      return NextResponse.json({ error: "date と menuId が必要です。" }, { status: 400 });
    }

    const availability = await getAvailableTimesForMenu({ date, menuId });
    return NextResponse.json({ availability });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "空き枠の取得に失敗しました。" },
      { status: 500 },
    );
  }
}
