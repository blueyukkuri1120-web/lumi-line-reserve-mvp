import { NextResponse } from "next/server";
import { buildGuideMessage, replyLineMessages, verifyLineSignature } from "@/lib/line";
import { saveMessageLog } from "@/lib/reservations";

type LineWebhookEvent = {
  type: string;
  replyToken?: string;
  source?: {
    userId?: string;
  };
  message?: {
    type: string;
    text?: string;
  };
  postback?: {
    data?: string;
  };
};

function createReplyText(event: LineWebhookEvent) {
  if (event.type === "follow") {
    return buildGuideMessage("友だち追加");
  }

  if (event.type === "postback") {
    return buildGuideMessage(event.postback?.data ?? "メニュー");
  }

  const text = event.message?.text?.trim() ?? "";
  if (!text) {
    return buildGuideMessage();
  }

  if (text.includes("予約確認")) {
    return buildGuideMessage("予約確認");
  }

  if (text.includes("変更")) {
    return buildGuideMessage("変更");
  }

  if (text.includes("キャンセル")) {
    return buildGuideMessage("キャンセル");
  }

  if (text.includes("アクセス")) {
    return buildGuideMessage("アクセス");
  }

  if (text.includes("予約")) {
    return buildGuideMessage("予約");
  }

  return buildGuideMessage();
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  try {
    const isValid = verifyLineSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid LINE signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as { events?: LineWebhookEvent[] };
    const events = payload.events ?? [];

    await Promise.all(
      events.map(async (event) => {
        const lineUserId = event.source?.userId ?? null;
        const messageText = event.message?.text ?? event.postback?.data ?? null;

        await saveMessageLog({
          lineUserId,
          eventType: event.type,
          messageText,
          rawPayload: event,
        });

        if (event.replyToken) {
          await replyLineMessages(event.replyToken, [
            {
              type: "text",
              text: createReplyText(event),
            },
          ]);
        }
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handling failed" },
      { status: 500 },
    );
  }
}
