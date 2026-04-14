import { NextResponse } from "next/server";
import { hasLineMessagingConfig } from "@/lib/env";
import { bookingCreatedLineMessage, pushLineMessages } from "@/lib/line";
import { createReservation } from "@/lib/reservations";
import { reservationCreateSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = reservationCreateSchema.parse(json);
    const reservation = await createReservation({
      customerName: parsed.customerName,
      lineDisplayName: parsed.lineDisplayName ?? null,
      lineUserId: parsed.lineUserId ?? null,
      menuId: parsed.menuId,
      reservationDate: parsed.reservationDate,
      reservationTime: parsed.reservationTime,
      note: parsed.note ?? null,
    });

    if (!reservation) {
      throw new Error("予約の取得に失敗しました。");
    }

    if (reservation.line_user_id && hasLineMessagingConfig()) {
      try {
        await pushLineMessages(reservation.line_user_id, [
          {
            type: "text",
            text: bookingCreatedLineMessage({
              reservationCode: reservation.reservation_code,
              customerName: reservation.customer_name,
              menuName: reservation.menu?.name ?? "メニュー未設定",
              reservationDate: reservation.reservation_date,
              reservationTime: reservation.reservation_time,
            }),
          },
        ]);
      } catch (lineError) {
        console.error("LINE push failed", lineError);
      }
    }

    return NextResponse.json({
      reservationCode: reservation.reservation_code,
      reservation,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "予約作成に失敗しました。" },
      { status: 400 },
    );
  }
}
