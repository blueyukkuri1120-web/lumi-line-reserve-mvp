"use client";

import { useState } from "react";
import { ReservationDetail, MenuRow } from "@/lib/types";
import { formatReservationDateTime } from "@/lib/utils";

export function AdminReservationEditor({
  reservation,
  menus,
}: {
  reservation: ReservationDetail;
  menus: MenuRow[];
}) {
  const [status, setStatus] = useState(reservation.status);
  const [reservationDate, setReservationDate] = useState(reservation.reservation_date);
  const [reservationTime, setReservationTime] = useState(reservation.reservation_time);
  const [menuId, setMenuId] = useState(reservation.menu_id);
  const [adminNote, setAdminNote] = useState(reservation.admin_note ?? "");
  const [clearRequestedSlot, setClearRequestedSlot] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reservationDate,
          reservationTime,
          menuId,
          adminNote,
          clearRequestedSlot,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "予約更新に失敗しました。");
      }

      setMessage("更新しました。画面を再読み込みすると最新履歴も反映されます。");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "予約更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Reservation detail</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{reservation.customer_name}</h2>
        <dl className="mt-5 space-y-3 text-sm text-stone-300">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">予約番号</dt>
            <dd>{reservation.reservation_code}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">現在日時</dt>
            <dd>{formatReservationDateTime(reservation.reservation_date, reservation.reservation_time)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">LINE表示名</dt>
            <dd>{reservation.line_display_name ?? "未取得"}</dd>
          </div>
          {reservation.requested_new_date && reservation.requested_new_time ? (
            <div className="rounded-2xl bg-amber-500/10 px-4 py-3 text-amber-100">
              変更希望: {formatReservationDateTime(reservation.requested_new_date, reservation.requested_new_time)}
            </div>
          ) : null}
          {reservation.note ? (
            <div className="rounded-2xl bg-white/5 px-4 py-3 leading-6 text-stone-300">
              顧客備考: {reservation.note}
            </div>
          ) : null}
        </dl>
      </div>

      <form className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5" onSubmit={handleSave}>
        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">Edit</p>
        <div className="mt-4 grid gap-4 text-sm">
          <label className="grid gap-2">
            <span className="text-stone-300">ステータス</span>
            <select className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-white" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
              <option value="reschedule_requested">reschedule_requested</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-stone-300">メニュー</span>
            <select className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-white" value={menuId} onChange={(event) => setMenuId(event.target.value)}>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} / {menu.duration_minutes}分
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-2">
              <span className="text-stone-300">予約日</span>
              <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-white" type="date" value={reservationDate} onChange={(event) => setReservationDate(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="text-stone-300">予約時間</span>
              <input className="rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-white" type="time" value={reservationTime} onChange={(event) => setReservationTime(event.target.value)} />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-stone-300">管理メモ</span>
            <textarea className="min-h-28 rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-white" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
          </label>
          {reservation.requested_new_date && reservation.requested_new_time ? (
            <label className="flex items-center gap-3 text-sm text-stone-300">
              <input checked={clearRequestedSlot} onChange={(event) => setClearRequestedSlot(event.target.checked)} type="checkbox" />
              変更希望枠を処理済みにしてクリアする
            </label>
          ) : null}
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
        <button className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100 disabled:bg-stone-400" disabled={loading} type="submit">
          {loading ? "保存中..." : "内容を保存"}
        </button>
      </form>
    </div>
  );
}
