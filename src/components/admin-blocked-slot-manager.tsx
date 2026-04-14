"use client";

import { useState } from "react";
import { BlockedSlotRow } from "@/lib/types";

export function AdminBlockedSlotManager({ initialSlots }: { initialSlots: BlockedSlotRow[] }) {
  const [slots, setSlots] = useState(initialSlots);
  const [blockedDate, setBlockedDate] = useState("");
  const [blockedTime, setBlockedTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="space-y-5">
      <form
        className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setMessage("");
          setError("");

          try {
            const response = await fetch("/api/admin/blocked-slots", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                blockedDate,
                blockedTime: isAllDay ? null : blockedTime,
                isAllDay,
                reason,
              }),
            });

            const payload = (await response.json()) as { blockedSlot?: BlockedSlotRow; error?: string };
            if (!response.ok || !payload.blockedSlot) {
              throw new Error(payload.error ?? "休業枠の作成に失敗しました。");
            }

            setSlots((current) => [payload.blockedSlot!, ...current]);
            setMessage("休業枠を追加しました。");
          } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "休業枠の作成に失敗しました。");
          }
        }}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Block slot</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" type="date" value={blockedDate} onChange={(event) => setBlockedDate(event.target.value)} required />
          <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white disabled:opacity-50" disabled={isAllDay} type="time" value={blockedTime} onChange={(event) => setBlockedTime(event.target.value)} />
          <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" placeholder="理由" value={reason} onChange={(event) => setReason(event.target.value)} />
          <label className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-300">
            <input checked={isAllDay} onChange={(event) => setIsAllDay(event.target.checked)} type="checkbox" />
            終日ブロック
          </label>
        </div>
        <button className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100" type="submit">
          追加
        </button>
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </form>

      <div className="space-y-3">
        {slots.map((slot) => (
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-stone-200" key={slot.id}>
            <div>
              <p className="font-medium">{slot.blocked_date} {slot.is_all_day ? "終日" : slot.blocked_time}</p>
              <p className="mt-1 text-stone-400">{slot.reason ?? "理由なし"}</p>
            </div>
            <button
              className="rounded-full border border-rose-300/30 px-4 py-2 text-rose-200 transition hover:bg-rose-500/10"
              onClick={async () => {
                await fetch(`/api/admin/blocked-slots/${slot.id}`, { method: "DELETE" });
                setSlots((current) => current.filter((item) => item.id !== slot.id));
              }}
              type="button"
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
