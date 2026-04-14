import { PostgrestError } from "@supabase/supabase-js";
import { defaultBusinessHours } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import {
  BusinessSettings,
  ReservationStatus,
  ReservationRow,
  ReservationDetail,
  ReservationWithMenu,
} from "@/lib/types";
import { reservationCodeCandidate, toBusinessSettings } from "@/lib/utils";

function ensureData<T>(data: T | null, error: PostgrestError | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }

  if (data === null) {
    throw new Error(`${context}: no data returned`);
  }

  return data;
}

async function attachMenusToReservations(reservations: ReservationRow[]) {
  if (reservations.length === 0) {
    return [] as ReservationWithMenu[];
  }

  const menuIds = Array.from(new Set(reservations.map((reservation) => reservation.menu_id)));
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("menus").select("*").in("id", menuIds);
  const menus = ensureData(data, error, "Failed to fetch menu details");
  const menuMap = new Map(menus.map((menu) => [menu.id, menu]));

  return reservations.map((reservation) => ({
    ...reservation,
    menu: menuMap.get(reservation.menu_id) ?? null,
  }));
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch business settings: ${error.message}`);
  }

  if (!data) {
    return {
      id: "local-fallback",
      salon_name: "Lumi Line Reserve",
      address: "東京都渋谷区〇〇 1-2-3",
      business_hours: defaultBusinessHours,
      regular_holiday: [],
      map_url: null,
      notes: "初回の方は5分前までにご来店ください。",
      updated_at: new Date().toISOString(),
    };
  }

  return toBusinessSettings(data);
}

export async function getMenus(activeOnly = false) {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("menus").select("*").order("created_at", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  return ensureData(data, error, "Failed to fetch menus");
}

export async function getMenuById(menuId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("menus").select("*").eq("id", menuId).single();
  const menu = ensureData(data, error, "Failed to fetch menu");

  if (!menu.is_active) {
    throw new Error("選択されたメニューは現在受付停止中です。");
  }

  return menu;
}

export async function listReservations(status?: ReservationStatus | "all") {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("reservations")
    .select("*")
    .order("reservation_date", { ascending: false })
    .order("reservation_time", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  const reservations = ensureData(data, error, "Failed to fetch reservations");
  return attachMenusToReservations(reservations);
}

export async function listReservationsByDate(date: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("reservation_date", date)
    .order("reservation_time", { ascending: true });

  const reservations = ensureData(data, error, "Failed to fetch reservations by date");
  return attachMenusToReservations(reservations);
}

export async function getReservationByCode(code: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("reservation_code", code)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to find reservation: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [reservationWithMenu] = await attachMenusToReservations([data]);
  return reservationWithMenu;
}

export async function getReservationDetailById(id: string): Promise<ReservationDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("reservations").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch reservation detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [reservation] = await attachMenusToReservations([data]);
  const history = await getReservationHistory(id);
  return {
    ...reservation,
    history,
  };
}

export async function getReservationHistory(reservationId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reservation_histories")
    .select("*")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false });

  return ensureData(data, error, "Failed to fetch reservation history");
}

export async function listBlockedSlots() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .order("blocked_date", { ascending: false })
    .order("blocked_time", { ascending: true });

  return ensureData(data, error, "Failed to fetch blocked slots");
}

export async function listBlockedSlotsByDate(date: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .eq("blocked_date", date)
    .order("blocked_time", { ascending: true });

  return ensureData(data, error, "Failed to fetch blocked slots");
}

export async function saveMessageLog(input: {
  lineUserId?: string | null;
  eventType: string;
  messageText?: string | null;
  rawPayload: unknown;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("message_logs").insert({
    line_user_id: input.lineUserId ?? null,
    event_type: input.eventType,
    message_text: input.messageText ?? null,
    raw_payload: input.rawPayload as never,
  });

  if (error) {
    throw new Error(`Failed to save message log: ${error.message}`);
  }
}

export async function appendReservationHistory(input: {
  reservationId: string;
  eventType: string;
  previousStatus?: ReservationStatus | null;
  newStatus?: ReservationStatus | null;
  memo?: string | null;
  payload?: Record<string, unknown>;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("reservation_histories").insert({
    reservation_id: input.reservationId,
    event_type: input.eventType,
    previous_status: input.previousStatus ?? null,
    new_status: input.newStatus ?? null,
    memo: input.memo ?? null,
    payload: (input.payload ?? {}) as never,
  });

  if (error) {
    throw new Error(`Failed to save reservation history: ${error.message}`);
  }
}

export async function createReservation(input: {
  lineUserId?: string | null;
  lineDisplayName?: string | null;
  customerName: string;
  menuId: string;
  reservationDate: string;
  reservationTime: string;
  note?: string | null;
}) {
  const { assertSlotAvailable } = await import("@/lib/availability");
  const isAvailable = await assertSlotAvailable({
    date: input.reservationDate,
    time: input.reservationTime,
    menuId: input.menuId,
  });

  if (!isAvailable) {
    throw new Error("選択された時間帯はすでに埋まっています。別の時間をご選択ください。");
  }

  const supabase = getSupabaseAdminClient();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reservationCode = reservationCodeCandidate();
    const { data, error } = await supabase
      .rpc("create_reservation_with_lock", {
        p_reservation_code: reservationCode,
        p_line_user_id: input.lineUserId ?? null,
        p_line_display_name: input.lineDisplayName ?? null,
        p_customer_name: input.customerName,
        p_menu_id: input.menuId,
        p_reservation_date: input.reservationDate,
        p_reservation_time: input.reservationTime,
        p_note: input.note ?? null,
      })
      .single();

    if (error?.message.includes("reservations_reservation_code_key")) {
      continue;
    }

    ensureData(data, error, "Failed to create reservation");
    return getReservationByCode(reservationCode);
  }

  throw new Error("予約番号の発行に失敗しました。再度お試しください。");
}

export async function cancelReservationByCode(input: { reservationCode: string; memo?: string | null }) {
  const reservation = await getReservationByCode(input.reservationCode);
  if (!reservation) {
    throw new Error("予約が見つかりません。");
  }

  if (reservation.status === "cancelled") {
    return reservation;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      requested_new_date: null,
      requested_new_time: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservation.id);

  if (error) {
    throw new Error(`Failed to cancel reservation: ${error.message}`);
  }

  await appendReservationHistory({
    reservationId: reservation.id,
    eventType: "cancelled_by_customer",
    previousStatus: reservation.status,
    newStatus: "cancelled",
    memo: input.memo,
  });

  return getReservationByCode(input.reservationCode);
}

export async function requestReservationReschedule(input: {
  reservationCode: string;
  requestedNewDate: string;
  requestedNewTime: string;
  memo?: string | null;
}) {
  const reservation = await getReservationByCode(input.reservationCode);
  if (!reservation) {
    throw new Error("予約が見つかりません。");
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("reservations")
    .update({
      status: "reschedule_requested",
      requested_new_date: input.requestedNewDate,
      requested_new_time: input.requestedNewTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservation.id);

  if (error) {
    throw new Error(`Failed to request reschedule: ${error.message}`);
  }

  await appendReservationHistory({
    reservationId: reservation.id,
    eventType: "reschedule_requested",
    previousStatus: reservation.status,
    newStatus: "reschedule_requested",
    memo: input.memo,
    payload: {
      requestedNewDate: input.requestedNewDate,
      requestedNewTime: input.requestedNewTime,
    },
  });

  return getReservationByCode(input.reservationCode);
}

export async function updateReservationByAdmin(input: {
  reservationId: string;
  status: ReservationStatus;
  reservationDate: string;
  reservationTime: string;
  menuId: string;
  adminNote?: string | null;
  clearRequestedSlot?: boolean;
}) {
  const current = await getReservationDetailById(input.reservationId);
  if (!current) {
    throw new Error("予約が見つかりません。");
  }

  if (input.status !== "cancelled") {
    const { assertSlotAvailable } = await import("@/lib/availability");
    const available = await assertSlotAvailable({
      date: input.reservationDate,
      time: input.reservationTime,
      menuId: input.menuId,
      excludeReservationId: input.reservationId,
    });

    if (!available) {
      throw new Error("指定された枠には既に予約または休業枠があります。");
    }
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("reservations")
    .update({
      status: input.status,
      reservation_date: input.reservationDate,
      reservation_time: input.reservationTime,
      menu_id: input.menuId,
      admin_note: input.adminNote ?? null,
      requested_new_date: input.clearRequestedSlot ? null : current.requested_new_date,
      requested_new_time: input.clearRequestedSlot ? null : current.requested_new_time,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.reservationId);

  if (error) {
    throw new Error(`Failed to update reservation: ${error.message}`);
  }

  await appendReservationHistory({
    reservationId: input.reservationId,
    eventType: "admin_updated",
    previousStatus: current.status,
    newStatus: input.status,
    memo: input.adminNote,
    payload: {
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      menuId: input.menuId,
      clearRequestedSlot: input.clearRequestedSlot ?? false,
    },
  });

  return getReservationDetailById(input.reservationId);
}

export async function saveMenu(input: {
  id?: string;
  name: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    name: input.name,
    duration_minutes: input.durationMinutes,
    price: input.price,
    is_active: input.isActive,
  };

  if (input.id) {
    const { error } = await supabase.from("menus").update(payload).eq("id", input.id);
    if (error) {
      throw new Error(`Failed to update menu: ${error.message}`);
    }
    return getMenuById(input.id);
  }

  const { data, error } = await supabase.from("menus").insert(payload).select("*").single();
  return ensureData(data, error, "Failed to create menu");
}

export async function saveBlockedSlot(input: {
  blockedDate: string;
  blockedTime?: string | null;
  isAllDay: boolean;
  reason?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .insert({
      blocked_date: input.blockedDate,
      blocked_time: input.isAllDay ? null : input.blockedTime ?? null,
      is_all_day: input.isAllDay,
      reason: input.reason ?? null,
    })
    .select("*")
    .single();

  return ensureData(data, error, "Failed to create blocked slot");
}

export async function deleteBlockedSlot(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete blocked slot: ${error.message}`);
  }
}

export async function saveBusinessSettings(input: {
  salonName: string;
  address: string;
  open: string;
  close: string;
  slotIntervalMinutes: number;
  regularHoliday: number[];
  mapUrl?: string;
  notes?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: current, error: fetchError } = await supabase
    .from("business_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch business settings for update: ${fetchError.message}`);
  }

  const payload = {
    salon_name: input.salonName,
    address: input.address,
    business_hours: {
      open: input.open,
      close: input.close,
      slotIntervalMinutes: input.slotIntervalMinutes,
    },
    regular_holiday: input.regularHoliday,
    map_url: input.mapUrl ? input.mapUrl : null,
    notes: input.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  if (current) {
    const { error } = await supabase.from("business_settings").update(payload).eq("id", current.id);
    if (error) {
      throw new Error(`Failed to update business settings: ${error.message}`);
    }
  } else {
    const { error } = await supabase.from("business_settings").insert(payload);
    if (error) {
      throw new Error(`Failed to create business settings: ${error.message}`);
    }
  }

  return getBusinessSettings();
}
