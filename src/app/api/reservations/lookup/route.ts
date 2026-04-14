import { NextRequest, NextResponse } from "next/server";
import { getReservationByCode } from "@/lib/reservations";
import { reservationLookupSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const parsed = reservationLookupSchema.parse({
      reservationCode: request.nextUrl.searchParams.get("reservationCode"),
    });
    const reservation = await getReservationByCode(parsed.reservationCode);

    if (!reservation) {
      return NextResponse.json({ error: "予約情報が見つかりません。" }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "予約情報の取得に失敗しました。" },
      { status: 400 },
    );
  }
}
