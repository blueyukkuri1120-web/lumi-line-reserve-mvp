import { AdminBlockedSlotManager } from "@/components/admin-blocked-slot-manager";
import { listBlockedSlots } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function AdminBlockedSlotsPage() {
  const slots = await listBlockedSlots();

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Blocked slots</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">空き枠・休業枠管理</h2>
      </div>
      <AdminBlockedSlotManager initialSlots={slots} />
    </section>
  );
}
