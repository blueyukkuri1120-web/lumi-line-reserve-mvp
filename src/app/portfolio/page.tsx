import Link from "next/link";

const highlights = [
  "LINEから予約、予約確認、変更・キャンセル、アクセス確認までを一本の導線で提供",
  "Webhook、LIFF、Supabase、管理画面まで含めた実動MVPとして構築",
  "一人サロン運用を前提に、過剰機能を入れず実務で使いやすいUIに最適化",
];

const userFeatures = [
  "予約フォームでメニュー・日付・時間を選択し、空き枠だけを表示",
  "予約番号の自動発行と予約確認画面での検索",
  "変更申請・キャンセル申請と履歴保存",
  "アクセス、営業時間、注意事項、Googleマップ導線を表示",
];

const adminFeatures = [
  "管理画面ログインと予約一覧・予約詳細の閲覧",
  "予約ステータス変更、管理メモ更新、変更申請内容の確認",
  "メニュー管理、休業枠管理、店舗設定の編集",
  "Supabase保存データを前提にした一覧・詳細運用",
];

const techPoints = [
  "Next.js App Router + TypeScript + Tailwind CSS",
  "Supabase(PostgreSQL)で予約、メニュー、休業枠、店舗設定、履歴を管理",
  "LINE Messaging API の Webhook 受信と署名検証を実装",
  "LIFF を使った予約画面導線と、運用安定性を優先したリッチメニュー構成",
];

const implementationPoints = [
  {
    title: "二重予約対策",
    body: "フロント側の空き枠表示だけでなく、DB関数でも重複予約を防ぐ構成にしました。見た目上選べても保存時に競合しないようにしています。",
  },
  {
    title: "実運用前提の管理導線",
    body: "一人営業のサロンでは完全自動最適化より、一覧で見てすぐ判断できることが重要です。管理画面は実務重視の情報密度に寄せています。",
  },
  {
    title: "LINE導線の現実解",
    body: "LINE内導線は挙動差が出やすいため、まずは安定稼働する構成を優先しました。ポートフォリオでは、4 LIFF 構成による確実な遷移と、1 LIFF 統合への拡張余地を説明できます。",
  },
];

const nextSteps = [
  "1 LIFF 構成への統合と導線最適化",
  "予約完了・変更反映時の通知メッセージ改善",
  "Googleカレンダー連携や外部通知の追加",
  "決済、スタッフ別管理、多店舗対応などの段階的拡張",
];

export const metadata = {
  title: "Portfolio | Lumi Line Reserve MVP",
  description: "LINE予約導線MVPの制作背景、実装内容、技術構成をまとめたポートフォリオページ",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(215,183,108,0.15),_transparent_30%),linear-gradient(180deg,_#070707_0%,_#121212_24%,_#f5f0e6_24%,_#f7f4ee_100%)] text-stone-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-black/90 px-6 py-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-[0.7rem] uppercase tracking-[0.4em] text-amber-200/80">Case Study</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl tracking-wide text-white sm:text-5xl">Lumi Line Reserve MVP</h1>
              <p className="mt-4 text-sm leading-7 text-stone-300 sm:text-base">
                一人営業のまつげ・眉毛・ネイル系サロン向けに、LINEから予約、確認、変更・キャンセルまで行える予約導線を、
                実動する MVP として構築したプロジェクトです。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-stone-900 transition hover:bg-stone-100"
                href="https://lumi-line-reserve-mvp.vercel.app/"
                target="_blank"
              >
                公開アプリを見る
              </Link>
              <Link
                className="rounded-full border border-white/15 px-5 py-3 text-center text-sm font-medium text-white transition hover:border-amber-300/50 hover:text-amber-100"
                href="https://github.com/blueyukkuri1120-web/lumi-line-reserve-mvp"
                target="_blank"
              >
                GitHubを見る
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {highlights.map((item) => (
            <article
              className="rounded-[1.75rem] border border-stone-200 bg-white/90 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
              key={item}
            >
              <p className="text-sm leading-7 text-stone-700">{item}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Why this project</p>
            <h2 className="mt-3 font-serif text-3xl text-stone-950">解決したかった課題</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-stone-700">
              <p>
                一人営業のサロンでは、施術中に電話に出られず予約機会を逃しやすい一方で、外部予約サイトは手数料や運用負荷が重くなりがちです。
              </p>
              <p>
                そこで、ユーザーが普段使っている LINE の中で、予約から確認、変更・キャンセル、アクセス確認まで完結できる導線を MVP として設計しました。
              </p>
              <p>
                営業用の見せるだけのモックではなく、Webhook、LIFF、DB、管理画面まで含めて実際に動くことを重視しています。
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-black/5 bg-black p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Architecture</p>
            <h2 className="mt-3 font-serif text-3xl text-white">構成</h2>
            <pre className="mt-5 overflow-x-auto rounded-[1.5rem] bg-white/5 p-4 text-xs leading-6 text-stone-200">
{`LINE公式アカウント
  ↓
LIFF / リッチメニュー導線
  ↓
Next.js App Router
  ↓
API Routes
  ↓
Supabase PostgreSQL
  ↓
管理画面 / 予約運用`}
            </pre>
          </article>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">User flow</p>
            <h2 className="mt-3 font-serif text-3xl text-stone-950">ユーザー向け機能</h2>
            <div className="mt-5 space-y-3">
              {userFeatures.map((item) => (
                <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Admin flow</p>
            <h2 className="mt-3 font-serif text-3xl text-stone-950">管理画面機能</h2>
            <div className="mt-5 space-y-3">
              {adminFeatures.map((item) => (
                <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Stack</p>
            <h2 className="mt-3 font-serif text-3xl text-stone-950">技術スタック</h2>
            <div className="mt-5 grid gap-3">
              {techPoints.map((item) => (
                <div className="rounded-[1.25rem] border border-stone-200 px-4 py-4 text-sm leading-7 text-stone-700" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Implementation</p>
            <h2 className="mt-3 font-serif text-3xl text-stone-950">工夫したポイント</h2>
            <div className="mt-5 space-y-4">
              {implementationPoints.map((item) => (
                <article className="rounded-[1.5rem] bg-stone-50 px-5 py-5" key={item.title}>
                  <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-700">{item.body}</p>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Next step</p>
          <h2 className="mt-3 font-serif text-3xl text-stone-950">今後の改善案</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {nextSteps.map((item) => (
              <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
