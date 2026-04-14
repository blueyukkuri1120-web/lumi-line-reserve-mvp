import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateReservationByAdmin } from "@/lib/reservations";
import { adminReservationUpdateSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsed = adminReservationUpdateSchema.parse(await request.json());
    const reservation = await updateReservationByAdmin({
      reservationId: id,
      status: parsed.status,
      reservationDate: parsed.reservationDate,
      reservationTime: parsed.reservationTime,
      menuId: parsed.menuId,
      adminNote: parsed.adminNote ?? null,
      clearRequestedSlot: parsed.clearRequestedSlot ?? false,
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "予約更新に失敗しました。" },
      { status: 400 },
    );
  }
}
