import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { saveMenu } from "@/lib/reservations";
import { menuSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = menuSchema.parse(await request.json());
    const menu = await saveMenu(parsed);
    return NextResponse.json({ menu });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "メニュー保存に失敗しました。" },
      { status: 400 },
    );
  }
}
