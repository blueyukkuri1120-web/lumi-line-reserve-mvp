import { NextResponse } from "next/server";
import { cancelReservationByCode } from "@/lib/reservations";
import { reservationCancelSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const parsed = reservationCancelSchema.parse(await request.json());
    const reservation = await cancelReservationByCode({
      reservationCode: code,
      memo: parsed.memo ?? null,
    });

    return NextResponse.json({
      reservation,
      message: "キャンセルを受け付けました。",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "キャンセル処理に失敗しました。" },
      { status: 400 },
    );
  }
}
