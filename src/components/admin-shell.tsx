import Link from "next/link";
import { ReactNode } from "react";

const links = [
  { href: "/admin/reservations", label: "予約一覧" },
  { href: "/admin/menus", label: "メニュー管理" },
  { href: "/admin/blocked-slots", label: "休業枠管理" },
  { href: "/admin/settings", label: "店舗設定" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Admin Console</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Lumi Line Reserve MVP</h1>
              <p className="mt-2 text-sm text-stone-400">ログイン中: {email}</p>
            </div>
            <form action="/api/admin/logout" method="post">
              <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-amber-300/50 hover:text-amber-200" type="submit">
                ログアウト
              </button>
            </form>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {links.map((link) => (
              <Link className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-300/40 hover:text-amber-100" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
