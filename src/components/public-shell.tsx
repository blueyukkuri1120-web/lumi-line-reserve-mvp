import { ReactNode } from "react";
import { MiniAppLink } from "@/components/mini-app-link";
import { withBasePath } from "@/lib/public-paths";

interface PublicShellProps {
  salonName: string;
  children: ReactNode;
  basePath?: string;
}

export function PublicShell({ salonName, children, basePath }: PublicShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(215,183,108,0.15),_transparent_35%),linear-gradient(180deg,_#070707_0%,_#121212_18%,_#f5f0e6_18%,_#f7f4ee_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-16 pt-6 sm:max-w-5xl sm:px-6">
        <header className="mb-8 rounded-[2rem] border border-white/10 bg-black/90 px-5 py-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.4em] text-amber-200/80">Lumi Line Reserve MVP</p>
              <h1 className="mt-3 font-serif text-2xl tracking-wide text-white">{salonName}</h1>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                LINEから予約、確認、変更、キャンセルまでを一本化した一人サロン向け予約導線です。
              </p>
            </div>
            <div className="rounded-full border border-amber-300/25 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-amber-200">
              LIFF
            </div>
          </div>
          <nav className="mt-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <MiniAppLink className="rounded-full border border-white/10 px-3 py-2 text-center text-stone-100 transition hover:border-amber-300/40 hover:text-amber-100" href={withBasePath(basePath, "/")}>
              トップ
            </MiniAppLink>
            <MiniAppLink className="rounded-full border border-white/10 px-3 py-2 text-center text-stone-100 transition hover:border-amber-300/40 hover:text-amber-100" href={withBasePath(basePath, "/reserve")}>
              予約する
            </MiniAppLink>
            <MiniAppLink className="rounded-full border border-white/10 px-3 py-2 text-center text-stone-100 transition hover:border-amber-300/40 hover:text-amber-100" href={withBasePath(basePath, "/reservation/check")}>
              予約確認
            </MiniAppLink>
            <MiniAppLink className="rounded-full border border-white/10 px-3 py-2 text-center text-stone-100 transition hover:border-amber-300/40 hover:text-amber-100" href={withBasePath(basePath, "/reservation/manage")}>
              変更・キャンセル
            </MiniAppLink>
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
