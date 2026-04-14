import { PublicShell } from "@/components/public-shell";
import { ReservationChecker } from "@/components/reservation-checker";
import { getBusinessSettings } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function LineReservationCheckPage() {
  const settings = await getBusinessSettings();

  return (
    <PublicShell salonName={settings.salon_name} basePath="/line">
      <ReservationChecker />
    </PublicShell>
  );
}
