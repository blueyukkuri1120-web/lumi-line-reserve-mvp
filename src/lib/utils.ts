import { defaultBusinessHours, reservationStatusLabelMap, reservationStatusToneMap, weekdayLabels } from "@/lib/constants";
import { BusinessHoursConfig, BusinessSettings, Json, ReservationStatus } from "@/lib/types";
import { getAppTimeZone } from "@/lib/env";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function yen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function normalizeBusinessHours(value: Json): BusinessHoursConfig {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.open === "string" &&
    typeof value.close === "string" &&
    typeof value.slotIntervalMinutes === "number"
  ) {
    return {
      open: value.open,
      close: value.close,
      slotIntervalMinutes: value.slotIntervalMinutes,
    };
  }

  return defaultBusinessHours;
}

export function normalizeRegularHoliday(value: Json): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is number => typeof entry === "number" && entry >= 0 && entry <= 6);
}

export function toBusinessSettings(input: {
  id: string;
  salon_name: string;
  address: string;
  business_hours: Json;
  regular_holiday: Json;
  map_url: string | null;
  notes: string | null;
  updated_at: string;
}): BusinessSettings {
  return {
    id: input.id,
    salon_name: input.salon_name,
    address: input.address,
    business_hours: normalizeBusinessHours(input.business_hours),
    regular_holiday: normalizeRegularHoliday(input.regular_holiday),
    map_url: input.map_url,
    notes: input.notes,
    updated_at: input.updated_at,
  };
}

export function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(value: number) {
  const hour = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minute = (value % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

export function toDateLabel(date: string) {
  const target = new Date(`${date}T00:00:00Z`);
  const weekday = weekdayLabels[target.getUTCDay()];
  return `${date.replaceAll("-", "/")} (${weekday})`;
}

export function formatReservationDateTime(date: string, time: string) {
  return `${toDateLabel(date)} ${time}`;
}

export function getStatusLabel(status: ReservationStatus) {
  return reservationStatusLabelMap[status];
}

export function getStatusTone(status: ReservationStatus) {
  return reservationStatusToneMap[status];
}

export function getNowInTimeZone(timeZone = getAppTimeZone()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";

  return {
    date: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
    time: `${getPart("hour")}:${getPart("minute")}`,
  };
}

export function isPastSlot(date: string, time: string, timeZone = getAppTimeZone()) {
  const now = getNowInTimeZone(timeZone);

  if (date < now.date) {
    return true;
  }

  if (date > now.date) {
    return false;
  }

  return timeToMinutes(time) <= timeToMinutes(now.time);
}

export function getWeekdayFromDate(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function reservationCodeCandidate() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  const now = getNowInTimeZone();
  return `LMR-${now.date.replaceAll("-", "").slice(2)}-${random}`;
}

export function getHolidaySummary(dayIndexes: number[]) {
  if (dayIndexes.length === 0) {
    return "不定休";
  }

  return dayIndexes
    .slice()
    .sort((a, b) => a - b)
    .map((dayIndex) => weekdayLabels[dayIndex])
    .join("・");
}
