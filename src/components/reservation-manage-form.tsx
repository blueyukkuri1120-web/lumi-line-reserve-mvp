"use client";

import { useState } from "react";
import { ReservationSummaryCard } from "@/components/reservation-summary-card";
import { ReservationWithMenu } from "@/lib/types";

export function ReservationManageForm({ today }: { today: string }) {
  const [reservationCode, setReservationCode] = useState("");
  const [reservation, setReservation] = useState<ReservationWithMenu | null>(null);
  const [requestedNewDate, setRequestedNewDate] = useState(today);
  const [requestedNewTime, setRequestedNewTime] = useState("10:00");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReservation = async () => {
    const response = await fetch(`/api/reservations/lookup?reservationCode=${encodeURIComponent(reservationCode)}`);
    const payload = (await response.json()) as { reservation?: ReservationWithMenu; error?: string };
    if (!response.ok || !payload.reservation) {
      throw new Error(payload.error ?? "予約情報が見つかりません。");
    }
    setReservation(payload.reservation);
    return payload.reservation;
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const nextReservation = await loadReservation();
      setRequestedNewDate(nextReservation.requested_new_date ?? nextReservation.reservation_date);
      setRequestedNewTime(nextReservation.requested_new_time ?? nextReservation.reservation_time);
    } catch (searchError) {
      setReservation(null);
      setError(searchError instanceof Error ? searchError.message : "予約情報が見つかりません。");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/reservations/${encodeURIComponent(reservationCode)}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memo }),
      });

      const payload = (await response.json()) as { reservation?: ReservationWithMenu; error?: string; message?: string };
      if (!response.ok || !payload.reservation) {
        throw new Error(payload.error ?? "キャンセル処理に失敗しました。");
      }

      setReservation(payload.reservation);
      setMessage(payload.message ?? "キャンセルを受け付けました。");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "キャンセル処理に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/reservations/${encodeURIComponent(reservationCode)}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestedNewDate,
          requestedNewTime,
          memo,
        }),
      });

      const payload = (await response.json()) as { reservation?: ReservationWithMenu; error?: string; message?: string };
      if (!response.ok || !payload.reservation) {
        throw new Error(payload.error ?? "変更申請に失敗しました。");
      }

      setReservation(payload.reservation);
      setMessage(payload.message ?? "変更申請を受け付けました。");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "変更申請に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]" onSubmit={handleSearch}>
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Manage reservation</p>
        <h2 className="mt-2 text-xl font-semibold text-stone-900">変更・キャンセル</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          予約番号を入力すると、変更申請とキャンセル申請を送れます。変更は管理画面から確認できる形で履歴も残ります。
        </p>
        <div className="mt-5 flex gap-3">
          <input className="flex-1 rounded-full border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={reservationCode} onChange={(event) => setReservationCode(event.target.value.toUpperCase())} placeholder="LMR-260413-AB12" required />
          <button className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400" type="submit" disabled={loading}>
            {loading ? "確認中" : "検索"}
          </button>
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      </form>

      {reservation ? (
        <>
          <ReservationSummaryCard reservation={reservation} />
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-stone-900">変更申請</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-stone-700">新しい希望日</span>
                <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" type="date" min={today} value={requestedNewDate} onChange={(event) => setRequestedNewDate(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-stone-700">新しい希望時間</span>
                <input className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" type="time" value={requestedNewTime} onChange={(event) => setRequestedNewTime(event.target.value)} />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm">
              <span className="font-medium text-stone-700">メモ</span>
              <textarea className="min-h-24 rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-amber-500" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="時間帯変更の理由や連絡事項" />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button className="flex-1 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:bg-stone-400" type="button" onClick={handleReschedule} disabled={loading}>
                変更申請を送る
              </button>
              <button className="flex-1 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60" type="button" onClick={handleCancel} disabled={loading}>
                キャンセルする
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
