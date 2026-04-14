import { AdminBusinessSettingsForm } from "@/components/admin-business-settings-form";
import { getBusinessSettings } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettings();

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Salon settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">店舗設定</h2>
      </div>
      <AdminBusinessSettingsForm settings={settings} />
    </section>
  );
}
