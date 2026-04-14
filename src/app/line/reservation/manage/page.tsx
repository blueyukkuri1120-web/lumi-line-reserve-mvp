import { PublicShell } from "@/components/public-shell";
import { ReservationManageForm } from "@/components/reservation-manage-form";
import { getBusinessSettings } from "@/lib/reservations";
import { getNowInTimeZone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LineReservationManagePage() {
  const settings = await getBusinessSettings();

  return (
    <PublicShell salonName={settings.salon_name} basePath="/line">
      <ReservationManageForm today={getNowInTimeZone().date} />
    </PublicShell>
  );
}
