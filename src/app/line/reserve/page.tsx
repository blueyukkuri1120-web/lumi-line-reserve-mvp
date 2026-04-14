import { PublicShell } from "@/components/public-shell";
import { ReserveForm } from "@/components/reserve-form";
import { getOptionalEnv } from "@/lib/env";
import { getBusinessSettings, getMenus } from "@/lib/reservations";
import { getNowInTimeZone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LineReservePage() {
  const [settings, menus] = await Promise.all([getBusinessSettings(), getMenus(true)]);

  return (
    <PublicShell salonName={settings.salon_name} basePath="/line">
      <ReserveForm
        menus={menus}
        today={getNowInTimeZone().date}
        liffId={getOptionalEnv("NEXT_PUBLIC_LIFF_ID")}
        basePath="/line"
      />
    </PublicShell>
  );
}
