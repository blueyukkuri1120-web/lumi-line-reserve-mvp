import { ReservationStatus } from "@/lib/types";
import { getStatusLabel, getStatusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
