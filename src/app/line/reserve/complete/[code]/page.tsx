import { renderReserveCompletePage } from "@/app/reserve/complete/[code]/page";

export const dynamic = "force-dynamic";

export default async function LineReserveCompletePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return renderReserveCompletePage({
    params,
    basePath: "/line",
  });
}
