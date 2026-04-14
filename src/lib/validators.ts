import { z } from "zod";

export const reservationLookupSchema = z.object({
  reservationCode: z
    .string()
    .trim()
    .min(6, "予約番号を入力してください")
    .max(32, "予約番号が長すぎます"),
});

export const reservationCreateSchema = z.object({
  customerName: z.string().trim().min(1, "お名前を入力してください").max(80, "お名前が長すぎます"),
  lineUserId: z.string().trim().max(128).optional().nullable(),
  lineDisplayName: z.string().trim().max(80).optional().nullable(),
  menuId: z.string().uuid("メニューを選択してください"),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "希望日を正しく入力してください"),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, "希望時間を正しく入力してください"),
  note: z.string().trim().max(500, "備考は500文字以内で入力してください").optional().nullable(),
});

export const reservationCancelSchema = z.object({
  memo: z.string().trim().max(300, "メモは300文字以内で入力してください").optional().nullable(),
});

export const reservationRescheduleSchema = z.object({
  requestedNewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "変更希望日を正しく入力してください"),
  requestedNewTime: z.string().regex(/^\d{2}:\d{2}$/, "変更希望時間を正しく入力してください"),
  memo: z.string().trim().max(300, "メモは300文字以内で入力してください").optional().nullable(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("メールアドレス形式で入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export const menuSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "メニュー名を入力してください").max(80, "メニュー名が長すぎます"),
  durationMinutes: z.coerce.number().int().min(30, "30分以上で設定してください").max(240, "240分以内で設定してください"),
  price: z.coerce.number().int().min(0, "0円以上で設定してください").max(100000, "金額が大きすぎます"),
  isActive: z.coerce.boolean().default(true),
});

export const blockedSlotSchema = z.object({
  blockedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付を正しく入力してください"),
  blockedTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "時間を正しく入力してください")
    .optional()
    .nullable(),
  isAllDay: z.coerce.boolean().default(false),
  reason: z.string().trim().max(200, "理由は200文字以内で入力してください").optional().nullable(),
});

export const businessSettingsSchema = z.object({
  salonName: z.string().trim().min(1, "店舗名を入力してください").max(120, "店舗名が長すぎます"),
  address: z.string().trim().min(1, "住所を入力してください").max(255, "住所が長すぎます"),
  open: z.string().regex(/^\d{2}:\d{2}$/, "営業開始時間を正しく入力してください"),
  close: z.string().regex(/^\d{2}:\d{2}$/, "営業終了時間を正しく入力してください"),
  slotIntervalMinutes: z.coerce
    .number()
    .int()
    .min(15, "15分以上で設定してください")
    .max(60, "60分以内で設定してください"),
  regularHoliday: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  mapUrl: z
    .string()
    .trim()
    .url("Googleマップ URL を正しく入力してください")
    .or(z.literal(""))
    .optional(),
  notes: z.string().trim().max(1000, "注意事項は1000文字以内で入力してください").optional().nullable(),
});

export const adminReservationUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "reschedule_requested"]),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/),
  menuId: z.string().uuid(),
  adminNote: z.string().trim().max(1000).optional().nullable(),
  clearRequestedSlot: z.coerce.boolean().optional(),
});
