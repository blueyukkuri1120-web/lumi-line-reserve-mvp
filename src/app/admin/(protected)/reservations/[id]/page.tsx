import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminReservationEditor } from "@/components/admin-reservation-editor";
import { getMenus, getReservationDetailById } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function AdminReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [reservation, menus] = await Promise.all([getReservationDetailById(id), getMenus()]);

  if (!reservation) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <Link className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-300/40 hover:text-amber-100" href="/admin/reservations">
        予約一覧へ戻る
      </Link>
      <AdminReservationEditor menus={menus} reservation={reservation} />
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">History</p>
        <div className="mt-4 space-y-3">
          {reservation.history.map((entry) => (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-stone-300" key={entry.id}>
              <p className="font-medium text-white">{entry.event_type}</p>
              <p className="mt-1 text-stone-400">{new Date(entry.created_at).toLocaleString("ja-JP")}</p>
              {entry.memo ? <p className="mt-2 leading-6">{entry.memo}</p> : null}
            </div>
          ))}
          {reservation.history.length === 0 ? <p className="text-sm text-stone-400">履歴はまだありません。</p> : null}
        </div>
      </div>
    </section>
  );
}
