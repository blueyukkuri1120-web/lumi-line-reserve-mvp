import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { saveBlockedSlot } from "@/lib/reservations";
import { blockedSlotSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = blockedSlotSchema.parse(await request.json());
    const blockedSlot = await saveBlockedSlot(parsed);
    return NextResponse.json({ blockedSlot });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "休業枠の作成に失敗しました。" },
      { status: 400 },
    );
  }
}
