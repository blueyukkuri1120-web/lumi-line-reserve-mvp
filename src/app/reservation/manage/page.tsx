import { PublicShell } from "@/components/public-shell";
import { ReservationManageForm } from "@/components/reservation-manage-form";
import { getBusinessSettings } from "@/lib/reservations";
import { getNowInTimeZone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReservationManagePage() {
  const settings = await getBusinessSettings();

  return (
    <PublicShell salonName={settings.salon_name}>
      <ReservationManageForm today={getNowInTimeZone().date} />
    </PublicShell>
  );
}
