import { ReservationStatus } from "@/lib/types";

export const reservationStatusLabelMap: Record<ReservationStatus, string> = {
  pending: "受付待ち",
  confirmed: "確定",
  cancelled: "キャンセル",
  reschedule_requested: "変更申請中",
};

export const reservationStatusToneMap: Record<ReservationStatus, string> = {
  pending: "border border-amber-400/40 bg-amber-500/15 text-amber-200",
  confirmed: "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  cancelled: "border border-rose-400/40 bg-rose-500/15 text-rose-200",
  reschedule_requested: "border border-sky-400/40 bg-sky-500/15 text-sky-200",
};

export const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"] as const;

export const activeReservationStatuses: ReservationStatus[] = [
  "pending",
  "confirmed",
  "reschedule_requested",
];

export const defaultBusinessHours = {
  open: "10:00",
  close: "19:00",
  slotIntervalMinutes: 30,
};

export const adminSessionCookieName = "lumi_admin_session";
