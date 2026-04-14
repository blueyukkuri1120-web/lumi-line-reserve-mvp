import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl, getOptionalEnv, getRequiredEnv } from "@/lib/env";

type LineTextMessage = {
  type: "text";
  text: string;
};

async function callLineApi(path: string, payload: unknown) {
  const accessToken = getRequiredEnv("LINE_CHANNEL_ACCESS_TOKEN");
  const response = await fetch(`https://api.line.me${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LINE API error (${response.status}): ${text}`);
  }
}

export function verifyLineSignature(rawBody: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const expected = createHmac("sha256", getRequiredEnv("LINE_CHANNEL_SECRET"))
    .update(rawBody)
    .digest("base64");

  if (expected.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function replyLineMessages(replyToken: string, messages: LineTextMessage[]) {
  await callLineApi("/v2/bot/message/reply", {
    replyToken,
    messages,
  });
}

export async function pushLineMessages(to: string, messages: LineTextMessage[]) {
  await callLineApi("/v2/bot/message/push", {
    to,
    messages,
  });
}

export function buildGuideMessage(keyword?: string) {
  const appUrl = getAppUrl();
  const pieces = [
    "Lumi Line Reserve です。",
    "ご希望の操作はこちらからお進みください。",
    "",
    `予約する: ${appUrl}/reserve`,
    `予約確認: ${appUrl}/reservation/check`,
    `変更・キャンセル: ${appUrl}/reservation/manage`,
    `アクセス: ${appUrl}/access`,
  ];

  if (keyword) {
    pieces.unshift(`「${keyword}」のご案内です。`);
  }

  if (getOptionalEnv("NEXT_PUBLIC_LIFF_ID")) {
    pieces.push("", "LINE公式アカウントのリッチメニューから開く場合は、同じ URL を LIFF のエンドポイント URL に設定してください。");
  }

  return pieces.join("\n");
}

export function bookingCreatedLineMessage(params: {
  reservationCode: string;
  customerName: string;
  menuName: string;
  reservationDate: string;
  reservationTime: string;
}) {
  return `ご予約を受け付けました。\n予約番号: ${params.reservationCode}\nお名前: ${params.customerName}\nメニュー: ${params.menuName}\n日時: ${params.reservationDate} ${params.reservationTime}\n\n変更・キャンセルの際は、この予約番号をご利用ください。`;
}
