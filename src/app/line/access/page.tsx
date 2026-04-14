import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getBusinessSettings } from "@/lib/reservations";
import { getHolidaySummary } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LineAccessPage() {
  const settings = await getBusinessSettings();

  return (
    <PublicShell salonName={settings.salon_name} basePath="/line">
      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Access</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">{settings.salon_name}</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">{settings.address}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">営業時間</dt>
              <dd className="text-right font-medium text-stone-900">
                {settings.business_hours.open} - {settings.business_hours.close}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">定休日</dt>
              <dd className="text-right font-medium text-stone-900">{getHolidaySummary(settings.regular_holiday)}</dd>
            </div>
          </dl>
          {settings.notes ? (
            <div className="mt-5 rounded-[1.5rem] bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
              {settings.notes}
            </div>
          ) : null}
        </section>

        {settings.map_url ? (
          <Link
            className="block rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-stone-800"
            href={settings.map_url}
            target="_blank"
          >
            Googleマップで見る
          </Link>
        ) : null}
      </div>
    </PublicShell>
  );
}
