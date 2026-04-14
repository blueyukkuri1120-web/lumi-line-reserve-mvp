import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getBusinessSettings } from "@/lib/reservations";
import { getHolidaySummary } from "@/lib/utils";

export const dynamic = "force-dynamic";

const actions = [
  {
    href: "/reserve",
    title: "予約する",
    description: "空き枠だけを見ながら、そのまま予約完了まで進めます。",
  },
  {
    href: "/reservation/check",
    title: "予約確認",
    description: "予約番号から、日時・メニュー・状態をすぐに確認できます。",
  },
  {
    href: "/reservation/manage",
    title: "変更・キャンセル",
    description: "変更希望やキャンセルをLINE導線のまま申請できます。",
  },
  {
    href: "/access",
    title: "アクセス",
    description: "住所・営業時間・Googleマップを見やすく確認できます。",
  },
];

export default async function HomePage() {
  const settings = await getBusinessSettings();

  return (
    <PublicShell salonName={settings.salon_name}>
      <section className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">For private salon</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-950">LINEから迷わず予約できる導線</h2>
          </div>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
            営業時間 {settings.business_hours.open} - {settings.business_hours.close}
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          電話に出づらい施術中でも、予約受付・確認・変更申請・アクセス案内までを一つの導線で完結できます。
          MVPとして必要な機能だけに絞り、実運用しやすい設計にまとめています。
        </p>
        <div className="mt-6 grid gap-3">
          {actions.map((action) => (
            <Link
              className="group rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4 transition hover:border-amber-300 hover:bg-white"
              href={action.href}
              key={action.href}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-stone-900">{action.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">{action.description}</p>
                </div>
                <span className="text-2xl text-amber-700 transition group-hover:translate-x-1">›</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.75rem] border border-black/5 bg-black p-5 text-white shadow-[0_14px_50px_rgba(15,23,42,0.18)]">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Salon info</p>
          <h3 className="mt-3 text-xl font-semibold">{settings.salon_name}</h3>
          <p className="mt-3 text-sm leading-7 text-stone-300">{settings.address}</p>
        </div>
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Business rules</p>
          <dl className="mt-4 space-y-3 text-sm text-stone-700">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">営業時間</dt>
              <dd>{settings.business_hours.open} - {settings.business_hours.close}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">定休日</dt>
              <dd>{getHolidaySummary(settings.regular_holiday)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </PublicShell>
  );
}
