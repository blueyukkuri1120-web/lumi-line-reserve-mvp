"use client";

import { useState } from "react";
import { MenuRow } from "@/lib/types";

interface MenuDraft {
  id?: string;
  name: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

const emptyDraft: MenuDraft = {
  name: "",
  durationMinutes: 60,
  price: 6600,
  isActive: true,
};

export function AdminMenuManager({ initialMenus }: { initialMenus: MenuRow[] }) {
  const [menus, setMenus] = useState(initialMenus);
  const [draft, setDraft] = useState<MenuDraft>(emptyDraft);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const save = async (nextDraft: MenuDraft) => {
    setMessage("");
    setError("");

    const response = await fetch("/api/admin/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextDraft),
    });

    const payload = (await response.json()) as { menu?: MenuRow; error?: string };
    if (!response.ok || !payload.menu) {
      throw new Error(payload.error ?? "メニュー保存に失敗しました。");
    }

    const savedMenu = payload.menu;

    setMenus((current) => {
      const exists = current.some((menu) => menu.id === savedMenu.id);
      if (exists) {
        return current.map((menu) => (menu.id === savedMenu.id ? savedMenu : menu));
      }

      return [...current, savedMenu];
    });
  };

  return (
    <div className="space-y-5">
      <form
        className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            await save(draft);
            setDraft(emptyDraft);
            setMessage("メニューを保存しました。");
          } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "メニュー保存に失敗しました。");
          }
        }}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Create menu</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" placeholder="メニュー名" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" min={30} step={15} type="number" value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} />
          <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" min={0} step={100} type="number" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} />
          <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100" type="submit">
            新規追加
          </button>
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      </form>

      <div className="space-y-4">
        {menus.map((menu) => (
          <MenuEditorCard key={menu.id} menu={menu} onSaved={(nextMenu) => setMenus((current) => current.map((item) => (item.id === nextMenu.id ? nextMenu : item)))} />
        ))}
      </div>
    </div>
  );
}

function MenuEditorCard({
  menu,
  onSaved,
}: {
  menu: MenuRow;
  onSaved: (menu: MenuRow) => void;
}) {
  const [draft, setDraft] = useState<MenuDraft>({
    id: menu.id,
    name: menu.name,
    durationMinutes: menu.duration_minutes,
    price: menu.price,
    isActive: menu.is_active,
  });
  const [message, setMessage] = useState("");

  return (
    <form
      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("");

        const response = await fetch("/api/admin/menus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draft),
        });
        const payload = (await response.json()) as { menu?: MenuRow };
        if (payload.menu) {
          onSaved(payload.menu);
          setMessage("更新しました。");
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" min={30} step={15} type="number" value={draft.durationMinutes} onChange={(event) => setDraft((current) => ({ ...current, durationMinutes: Number(event.target.value) }))} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" min={0} step={100} type="number" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} />
        <label className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-300">
          <input checked={draft.isActive} onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))} type="checkbox" />
          公開する
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-stone-400">保存すると即時反映されます。</p>
        <button className="rounded-full bg-white px-5 py-2 text-sm font-medium text-stone-950 transition hover:bg-amber-100" type="submit">
          更新
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
    </form>
  );
}
