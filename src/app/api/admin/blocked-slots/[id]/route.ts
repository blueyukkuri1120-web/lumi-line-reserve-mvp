import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteBlockedSlot } from "@/lib/reservations";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteBlockedSlot(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "休業枠の削除に失敗しました。" },
      { status: 400 },
    );
  }
}
