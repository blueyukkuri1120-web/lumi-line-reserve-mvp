import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { ReservationSummaryCard } from "@/components/reservation-summary-card";
import { withBasePath } from "@/lib/public-paths";
import { getBusinessSettings, getReservationByCode } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function ReserveCompletePage({ params }: { params: Promise<{ code: string }> }) {
  return renderReserveCompletePage({ params });
}

export async function renderReserveCompletePage({
  params,
  basePath,
}: {
  params: Promise<{ code: string }>;
  basePath?: string;
}) {
  const { code } = await params;
  const [settings, reservation] = await Promise.all([getBusinessSettings(), getReservationByCode(code)]);

  if (!reservation) {
    notFound();
  }

  return (
    <PublicShell salonName={settings.salon_name} basePath={basePath}>
      <section className="space-y-5">
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Completed</p>
          <h2 className="mt-2 text-2xl font-semibold text-emerald-950">予約を受け付けました</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900">
            予約番号は確認画面でも使います。LINEで開いたままでも、あとから管理画面で確認できる構成です。
          </p>
        </div>
        <ReservationSummaryCard reservation={reservation} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-stone-800"
            href={withBasePath(basePath, "/reservation/check")}
          >
            予約確認へ
          </Link>
          <Link
            className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            href={withBasePath(basePath, "/")}
          >
            トップへ戻る
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
