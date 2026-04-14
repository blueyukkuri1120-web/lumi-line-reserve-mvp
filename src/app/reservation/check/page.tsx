import { PublicShell } from "@/components/public-shell";
import { ReservationChecker } from "@/components/reservation-checker";
import { getBusinessSettings } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function ReservationCheckPage() {
  const settings = await getBusinessSettings();

  return (
    <PublicShell salonName={settings.salon_name}>
      <ReservationChecker />
    </PublicShell>
  );
}
