import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#0f0f0f_0%,_#161616_30%,_#f7f4ee_30%,_#f7f4ee_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-black/90 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Lumi Line Reserve MVP</p>
          <h2 className="mt-3 font-serif text-3xl">Salon Admin</h2>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            予約一覧、変更申請、休業枠、店舗設定を管理するための管理画面です。
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
