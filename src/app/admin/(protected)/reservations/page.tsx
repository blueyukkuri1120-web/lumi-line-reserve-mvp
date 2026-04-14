import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { listReservations } from "@/lib/reservations";
import { formatReservationDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const filters = ["all", "pending", "confirmed", "cancelled", "reschedule_requested"] as const;

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status = "all" } = await searchParams;
  const reservations = await listReservations(status as (typeof filters)[number]);

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Reservations</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">予約一覧</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link className={`rounded-full px-4 py-2 text-sm transition ${status === filter ? "bg-white text-stone-950" : "border border-white/10 text-stone-200 hover:border-amber-300/40 hover:text-amber-100"}`} href={`/admin/reservations?status=${filter}`} key={filter}>
              {filter}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-4 py-3">予約番号</th>
              <th className="px-4 py-3">顧客</th>
              <th className="px-4 py-3">日時</th>
              <th className="px-4 py-3">メニュー</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">LINE名</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr className="border-t border-white/10 text-stone-200" key={reservation.id}>
                <td className="px-4 py-4">
                  <Link className="font-medium text-amber-200 hover:text-amber-100" href={`/admin/reservations/${reservation.id}`}>
                    {reservation.reservation_code}
                  </Link>
                </td>
                <td className="px-4 py-4">{reservation.customer_name}</td>
                <td className="px-4 py-4">{formatReservationDateTime(reservation.reservation_date, reservation.reservation_time)}</td>
                <td className="px-4 py-4">{reservation.menu?.name ?? "未設定"}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={reservation.status} />
                </td>
                <td className="px-4 py-4">{reservation.line_display_name ?? "未取得"}</td>
              </tr>
            ))}
            {reservations.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-stone-400" colSpan={6}>
                  該当する予約はありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
