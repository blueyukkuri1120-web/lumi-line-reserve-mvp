import { StatusBadge } from "@/components/status-badge";
import { ReservationWithMenu } from "@/lib/types";
import { formatReservationDateTime, yen } from "@/lib/utils";

export function ReservationSummaryCard({
  reservation,
  showRequested = true,
}: {
  reservation: ReservationWithMenu;
  showRequested?: boolean;
}) {
  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Reservation</p>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">{reservation.customer_name}</h3>
          <p className="mt-1 text-sm text-stone-500">{reservation.reservation_code}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <dl className="mt-5 space-y-3 text-sm text-stone-700">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">日時</dt>
          <dd className="text-right font-medium">{formatReservationDateTime(reservation.reservation_date, reservation.reservation_time)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">メニュー</dt>
          <dd className="text-right font-medium">
            {reservation.menu?.name ?? "未設定"}
            {reservation.menu ? ` / ${yen(reservation.menu.price)}` : ""}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">LINE表示名</dt>
          <dd className="text-right font-medium">{reservation.line_display_name ?? "未取得"}</dd>
        </div>
        {reservation.note ? (
          <div className="flex flex-col gap-1">
            <dt className="text-stone-500">備考</dt>
            <dd className="rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700">{reservation.note}</dd>
          </div>
        ) : null}
        {showRequested && reservation.requested_new_date && reservation.requested_new_time ? (
          <div className="flex justify-between gap-4 rounded-2xl bg-amber-50 px-4 py-3">
            <dt className="text-stone-500">変更希望</dt>
            <dd className="text-right font-medium text-stone-900">
              {formatReservationDateTime(reservation.requested_new_date, reservation.requested_new_time)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
