import { NextResponse } from "next/server";
import { verifyLineSignature } from "@/lib/line";
import { saveMessageLog } from "@/lib/reservations";

type LineWebhookEvent = {
  type: string;
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
