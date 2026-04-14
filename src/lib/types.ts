export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "reschedule_requested";

export interface BusinessHoursConfig {
  open: string;
  close: string;
  slotIntervalMinutes: number;
}

export interface MenuRow {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservationRow {
  id: string;
  reservation_code: string;
  line_user_id: string | null;
  line_display_name: string | null;
  customer_name: string;
  menu_id: string;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  note: string | null;
  admin_note: string | null;
  requested_new_date: string | null;
  requested_new_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlockedSlotRow {
  id: string;
  blocked_date: string;
  blocked_time: string | null;
  is_all_day: boolean;
  reason: string | null;
  created_at: string;
}

export interface BusinessSettingsRow {
  id: string;
  salon_name: string;
  address: string;
  business_hours: Json;
  regular_holiday: Json;
  map_url: string | null;
  notes: string | null;
  updated_at: string;
}

export interface MessageLogRow {
  id: string;
  line_user_id: string | null;
  event_type: string;
  message_text: string | null;
  raw_payload: Json;
  created_at: string;
}

export interface ReservationHistoryRow {
  id: string;
  reservation_id: string;
  event_type: string;
  previous_status: ReservationStatus | null;
  new_status: ReservationStatus | null;
  memo: string | null;
  payload: Json;
  created_at: string;
}

export interface ReservationWithMenu extends ReservationRow {
  menu: MenuRow | null;
}

export interface ReservationDetail extends ReservationWithMenu {
  history: ReservationHistoryRow[];
}

export interface BusinessSettings {
  id: string;
  salon_name: string;
  address: string;
  business_hours: BusinessHoursConfig;
  regular_holiday: number[];
  map_url: string | null;
  notes: string | null;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: ReservationRow;
        Insert: Omit<ReservationRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ReservationRow, "id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
      };
      menus: {
        Row: MenuRow;
        Insert: Omit<MenuRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MenuRow, "id" | "created_at" | "updated_at">> & {
          updated_at?: string;
        };
      };
      blocked_slots: {
        Row: BlockedSlotRow;
        Insert: Omit<BlockedSlotRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BlockedSlotRow, "id" | "created_at">>;
      };
      business_settings: {
        Row: BusinessSettingsRow;
        Insert: Omit<BusinessSettingsRow, "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<BusinessSettingsRow, "id" | "updated_at">> & {
          updated_at?: string;
        };
      };
      message_logs: {
        Row: MessageLogRow;
        Insert: Omit<MessageLogRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MessageLogRow, "id" | "created_at">>;
      };
      reservation_histories: {
        Row: ReservationHistoryRow;
        Insert: Omit<ReservationHistoryRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ReservationHistoryRow, "id" | "created_at">>;
      };
    };
    Functions: {
      create_reservation_with_lock: {
        Args: {
          p_reservation_code: string;
          p_line_user_id: string | null;
          p_line_display_name: string | null;
          p_customer_name: string;
          p_menu_id: string;
          p_reservation_date: string;
          p_reservation_time: string;
          p_note: string | null;
        };
        Returns: ReservationRow[];
      };
    };
  };
}
