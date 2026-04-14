import { NextResponse } from "next/server";
import { requestReservationReschedule } from "@/lib/reservations";
import { reservationRescheduleSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const parsed = reservationRescheduleSchema.parse(await request.json());
    const reservation = await requestReservationReschedule({
      reservationCode: code,
      requestedNewDate: parsed.requestedNewDate,
      requestedNewTime: parsed.requestedNewTime,
      memo: parsed.memo ?? null,
    });

    return NextResponse.json({
      reservation,
      message: "変更申請を受け付けました。",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "変更申請に失敗しました。" },
      { status: 400 },
    );
  }
}
