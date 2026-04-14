"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiffProfile } from "@/lib/use-liff-profile";
import { withBasePath } from "@/lib/public-paths";
import { MenuRow } from "@/lib/types";

interface ReserveFormProps {
  menus: MenuRow[];
  today: string;
  liffId?: string;
  basePath?: string;
}

export function ReserveForm({ menus, today, liffId, basePath }: ReserveFormProps) {
  const router = useRouter();
  const { profile, error: liffError, isReady } = useLiffProfile(liffId);
  const [customerName, setCustomerName] = useState("");
  const [lineDisplayName, setLineDisplayName] = useState("");
  const [lineUserId, setLineUserId] = useState("");
  const [menuId, setMenuId] = useState(menus[0]?.id ?? "");
  const [reservationDate, setReservationDate] = useState(today);
  const [reservationTime, setReservationTime] = useState("");
  const [note, setNote] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availabilityMessage, setAvailabilityMessage] = useState("メニューと日付を選択すると予約可能枠を表示します。");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setLineDisplayName((current) => current || profile.displayName);
    setLineUserId(profile.userId);
  }, [profile]);

  useEffect(() => {
    if (!menuId || !reservationDate) {
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        setAvailabilityMessage("空き枠を確認しています...");
        const response = await fetch(`/api/availability?date=${reservationDate}&menuId=${menuId}`, {
          signal: controller.signal,
        });
        const payload = (await response.json()) as { availability?: string[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "空き枠の取得に失敗しました。");
        }

        const nextTimes = payload.availability ?? [];
        setAvailableTimes(nextTimes);
        setReservationTime((current) => (nextTimes.includes(current) ? current : nextTimes[0] ?? ""));
        setAvailabilityMessage(
          nextTimes.length > 0 ? `${nextTimes.length}件の空き枠があります。` : "この日の予約可能枠はありません。",
        );
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setAvailableTimes([]);
        setReservationTime("");
        setAvailabilityMessage(fetchError instanceof Error ? fetchError.message : "空き枠の取得に失敗しました。");
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [menuId, reservationDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          lineDisplayName: lineDisplayName || null,
          lineUserId: lineUserId || null,
          menuId,
          reservationDate,
          reservationTime,
          note: note || null,
        }),
      });

      const payload = (await response.json()) as { reservationCode?: string; error?: string };
      if (!response.ok || !payload.reservationCode) {
        throw new Error(payload.error ?? "予約の保存に失敗しました。");
      }

      router.push(withBasePath(basePath, `/reserve/complete/${payload.reservationCode}`));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "予約の保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Booking form</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">予約情報を入力</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            一人営業サロン向けのシンプル導線です。空いている枠だけを表示し、重複予約は保存できません。
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">お名前</span>
            <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="山田 花子" required />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">LINE表示名</span>
            <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={lineDisplayName} onChange={(event) => setLineDisplayName(event.target.value)} placeholder="LIFF 取得時に自動入力" />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">メニュー</span>
            <select className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={menuId} onChange={(event) => setMenuId(event.target.value)} required>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} / {menu.duration_minutes}分 / ¥{menu.price.toLocaleString("ja-JP")}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-stone-700">希望日</span>
              <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" type="date" min={today} value={reservationDate} onChange={(event) => setReservationDate(event.target.value)} required />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-stone-700">希望時間</span>
              <select className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500 disabled:bg-stone-100" value={reservationTime} onChange={(event) => setReservationTime(event.target.value)} required disabled={availableTimes.length === 0}>
                {availableTimes.length === 0 ? <option value="">空き枠なし</option> : null}
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            {availabilityMessage}
          </div>
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-stone-700">備考</span>
            <textarea className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={note} onChange={(event) => setNote(event.target.value)} placeholder="オフあり、デザイン相談希望など" />
          </label>
        </div>

        {isReady && profile ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            LINE連携中: {profile.displayName} さんとして取得できています。
          </p>
        ) : null}
        {liffError ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{liffError}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <button className="mt-6 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400" type="submit" disabled={loading || availableTimes.length === 0}>
          {loading ? "予約を保存しています..." : "この内容で予約する"}
        </button>
      </div>
    </form>
  );
}
