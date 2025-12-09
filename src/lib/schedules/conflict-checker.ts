// Device conflict checking for session requests
import type { DeviceConflict } from "@/types/schedules";
import { checkDeviceConflicts as mockCheckConflicts } from "@/data/mock-schedules";

export interface ConflictCheckParams {
  deviceIds: string[];
  sessionDate: string;
  timeSlotId: string;
  excludeRequestId?: string;
}

/**
 * Check for device conflicts with approved session requests
 *
 * Returns a list of conflicts where the requested devices are already
 * allocated to another approved session request for the same date and time slot.
 */
export function checkDeviceConflicts(
  params: ConflictCheckParams
): DeviceConflict[] {
  const { deviceIds, sessionDate, timeSlotId, excludeRequestId } = params;

  // Skip check if no devices
  if (deviceIds.length === 0) {
    return [];
  }

  // Use mock data for now
  // TODO: Implement Supabase query when ready
  return mockCheckConflicts({
    deviceIds,
    sessionDate,
    timeSlotId,
    excludeRequestId,
  });
}

/**
 * Format conflict message for display
 */
export function formatConflictMessage(conflicts: DeviceConflict[]): string {
  if (conflicts.length === 0) return "";

  const messages = conflicts.map((c) => {
    const deviceName = c.device?.name || c.device_id;
    const courseName = c.conflicting_schedule?.course?.name || "Buổi học";
    const roomCode = c.conflicting_schedule?.room?.code || "";
    const slotLabel = c.conflicting_schedule?.time_slot?.label || "";

    return `${deviceName} đã được đăng ký cho "${courseName}" tại ${roomCode} (${slotLabel})`;
  });

  return messages.join("\n");
}

/**
 * Check if request has conflicts
 */
export function hasConflicts(conflicts: DeviceConflict[]): boolean {
  return conflicts.length > 0;
}

/**
 * Get unique device IDs from conflicts
 */
export function getConflictingDeviceIds(conflicts: DeviceConflict[]): string[] {
  return [...new Set(conflicts.map((c) => c.device_id))];
}
