"use client";

import { useState } from "react";
import { weekdayLabels } from "@/lib/constants";
import { BusinessSettings } from "@/lib/types";

export function AdminBusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  const [salonName, setSalonName] = useState(settings.salon_name);
  const [address, setAddress] = useState(settings.address);
  const [open, setOpen] = useState(settings.business_hours.open);
  const [close, setClose] = useState(settings.business_hours.close);
  const [slotIntervalMinutes, setSlotIntervalMinutes] = useState(settings.business_hours.slotIntervalMinutes);
  const [regularHoliday, setRegularHoliday] = useState<number[]>(settings.regular_holiday);
  const [mapUrl, setMapUrl] = useState(settings.map_url ?? "");
  const [notes, setNotes] = useState(settings.notes ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
          const response = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              salonName,
              address,
              open,
              close,
              slotIntervalMinutes,
              regularHoliday,
              mapUrl,
              notes,
            }),
          });
          const payload = (await response.json()) as { error?: string };
          if (!response.ok) {
            throw new Error(payload.error ?? "店舗設定の保存に失敗しました。");
          }

          setMessage("店舗設定を更新しました。");
        } catch (saveError) {
          setError(saveError instanceof Error ? saveError.message : "店舗設定の保存に失敗しました。");
        }
      }}
    >
      <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Business settings</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" placeholder="店舗名" value={salonName} onChange={(event) => setSalonName(event.target.value)} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" placeholder="住所" value={address} onChange={(event) => setAddress(event.target.value)} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" type="time" value={open} onChange={(event) => setOpen(event.target.value)} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" type="time" value={close} onChange={(event) => setClose(event.target.value)} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" min={15} max={60} step={15} type="number" value={slotIntervalMinutes} onChange={(event) => setSlotIntervalMinutes(Number(event.target.value))} />
        <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" placeholder="Googleマップ URL" value={mapUrl} onChange={(event) => setMapUrl(event.target.value)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {weekdayLabels.map((label, index) => {
          const checked = regularHoliday.includes(index);
          return (
            <label className={`rounded-full border px-4 py-2 text-sm ${checked ? "border-amber-300/50 bg-amber-300/15 text-amber-100" : "border-white/10 text-stone-300"}`} key={label}>
              <input
                checked={checked}
                className="sr-only"
                onChange={(event) => {
                  setRegularHoliday((current) =>
                    event.target.checked ? [...current, index] : current.filter((item) => item !== index),
                  );
                }}
                type="checkbox"
              />
              {label}
            </label>
          );
        })}
      </div>
      <textarea className="mt-4 min-h-32 w-full rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white" placeholder="注意事項" value={notes} onChange={(event) => setNotes(event.target.value)} />
      {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      <button className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100" type="submit">
        保存
      </button>
    </form>
  );
}
