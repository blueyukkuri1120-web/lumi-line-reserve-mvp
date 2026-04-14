"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "ログインに失敗しました。");
      }

      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)]" onSubmit={handleSubmit}>
      <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Admin login</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">管理画面ログイン</h1>
      <p className="mt-2 text-sm leading-6 text-stone-500">
        MVP のためメールアドレスとパスワードを環境変数で管理します。一般ユーザーはここに入れません。
      </p>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">メールアドレス</span>
          <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-stone-700">パスワード</span>
          <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      <button className="mt-6 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400" disabled={loading} type="submit">
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
