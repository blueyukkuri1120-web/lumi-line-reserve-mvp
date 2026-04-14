"use client";

import { useState } from "react";
import { ReservationSummaryCard } from "@/components/reservation-summary-card";
import { ReservationWithMenu } from "@/lib/types";

export function ReservationChecker() {
  const [reservationCode, setReservationCode] = useState("");
  const [reservation, setReservation] = useState<ReservationWithMenu | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setReservation(null);

    try {
      const response = await fetch(`/api/reservations/lookup?reservationCode=${encodeURIComponent(reservationCode)}`);
      const payload = (await response.json()) as { reservation?: ReservationWithMenu; error?: string };
      if (!response.ok || !payload.reservation) {
        throw new Error(payload.error ?? "予約情報が見つかりません。");
      }

      setReservation(payload.reservation);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "予約情報が見つかりません。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]" onSubmit={handleSearch}>
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Reservation lookup</p>
        <h2 className="mt-2 text-xl font-semibold text-stone-900">予約番号から確認</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          予約完了時に表示された予約番号を入力すると、日時・メニュー・状態を確認できます。
        </p>
        <div className="mt-5 flex gap-3">
          <input className="flex-1 rounded-full border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={reservationCode} onChange={(event) => setReservationCode(event.target.value.toUpperCase())} placeholder="LMR-260413-AB12" required />
          <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400" type="submit" disabled={loading}>
            {loading ? "検索中" : "検索"}
          </button>
        </div>
        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </form>

      {reservation ? <ReservationSummaryCard reservation={reservation} /> : null}
    </div>
  );
}
