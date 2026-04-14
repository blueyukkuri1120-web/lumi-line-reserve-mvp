import { activeReservationStatuses } from "@/lib/constants";
import { getAppTimeZone } from "@/lib/env";
import { getBusinessSettings, getMenuById, listBlockedSlotsByDate, listReservationsByDate } from "@/lib/reservations";
import { getWeekdayFromDate, isPastSlot, minutesToTime, timeToMinutes } from "@/lib/utils";

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

export async function getAvailableTimesForMenu(params: {
  date: string;
  menuId: string;
  excludeReservationId?: string;
}) {
  const { date, menuId, excludeReservationId } = params;
  const [settings, targetMenu, blockedSlots, reservations] = await Promise.all([
    getBusinessSettings(),
    getMenuById(menuId),
    listBlockedSlotsByDate(date),
    listReservationsByDate(date),
  ]);

  const weekday = getWeekdayFromDate(date);
  if (settings.regular_holiday.includes(weekday)) {
    return [];
  }

  if (blockedSlots.some((slot) => slot.is_all_day)) {
    return [];
  }

  const openMinutes = timeToMinutes(settings.business_hours.open);
  const closeMinutes = timeToMinutes(settings.business_hours.close);
  const interval = settings.business_hours.slotIntervalMinutes;
  const targetDuration = targetMenu.duration_minutes;

  const blockedMinutes = blockedSlots
    .filter((slot) => slot.blocked_time)
    .map((slot) => timeToMinutes(slot.blocked_time as string));

  const reservationsWithMenu = reservations
    .filter((reservation) => reservation.id !== excludeReservationId)
    .filter((reservation) => activeReservationStatuses.includes(reservation.status))
    .filter((reservation) => reservation.menu)
    .map((reservation) => ({
      start: timeToMinutes(reservation.reservation_time),
      end: timeToMinutes(reservation.reservation_time) + (reservation.menu?.duration_minutes ?? interval),
    }));

  const results: string[] = [];
  const timeZone = getAppTimeZone();

  for (let cursor = openMinutes; cursor + targetDuration <= closeMinutes; cursor += interval) {
    const end = cursor + targetDuration;
    const slotLabel = minutesToTime(cursor);

    if (isPastSlot(date, slotLabel, timeZone)) {
      continue;
    }

    const blocked = blockedMinutes.some((blockedMinute) => blockedMinute >= cursor && blockedMinute < end);
    if (blocked) {
      continue;
    }

    const hasReservationOverlap = reservationsWithMenu.some((reservation) =>
      overlaps(cursor, end, reservation.start, reservation.end),
    );

    if (hasReservationOverlap) {
      continue;
    }

    results.push(slotLabel);
  }

  return results;
}

export async function assertSlotAvailable(params: {
  date: string;
  time: string;
  menuId: string;
  excludeReservationId?: string;
}) {
  const availability = await getAvailableTimesForMenu({
    date: params.date,
    menuId: params.menuId,
    excludeReservationId: params.excludeReservationId,
  });

  return availability.includes(params.time);
}
