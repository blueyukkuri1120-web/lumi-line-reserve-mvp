import { AdminMenuManager } from "@/components/admin-menu-manager";
import { getMenus } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const menus = await getMenus();

  return (
    <section className="space-y-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Menus</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">メニュー管理</h2>
      </div>
      <AdminMenuManager initialMenus={menus} />
    </section>
  );
}
