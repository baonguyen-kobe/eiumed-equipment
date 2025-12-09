// Schedule & Request Types

import type { Course, Room, TimeSlot } from "./master";
import type { Device } from "./devices";
import type { Supply } from "./supplies";

// ===========================================
// Teaching Schedule
// ===========================================

export interface TeachingSchedule {
  id: string;
  course_id: string;
  room_id: string;
  time_slot_id: string;
  session_date: string; // ISO date YYYY-MM-DD
  lecturer_id: string | null;
  assistant_ids: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeachingScheduleFormData {
  course_id: string;
  room_id: string;
  time_slot_id: string;
  session_date: string;
  lecturer_id?: string;
  assistant_ids?: string[];
  notes?: string;
}

// Schedule with joined relations for display
export interface TeachingScheduleWithRelations extends TeachingSchedule {
  course?: Course;
  room?: Room;
  time_slot?: TimeSlot;
}

// ===========================================
// Session Request
// ===========================================

export type SessionRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export const SESSION_REQUEST_STATUS_LABELS: Record<SessionRequestStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã huỷ",
};

export const SESSION_REQUEST_STATUS_COLORS: Record<SessionRequestStatus, string> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

export interface SessionRequest {
  id: string;
  schedule_id: string;
  skill_name: string | null;
  requester_id: string | null;
  status: SessionRequestStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
}

export interface SessionRequestFormData {
  schedule_id: string;
  skill_name?: string;
  requester_id?: string;
  note?: string;
}

// ===========================================
// Session Request Lines
// ===========================================

export type SessionRequestLineType = "DEVICE" | "SUPPLY";

export const LINE_TYPE_LABELS: Record<SessionRequestLineType, string> = {
  DEVICE: "Thiết bị",
  SUPPLY: "Vật tư",
};

export interface SessionRequestLine {
  id: string;
  session_request_id: string;
  line_type: SessionRequestLineType;
  device_id: string | null;
  supply_id: string | null;
  quantity: number | null;
  notes: string | null;
}

export interface SessionRequestLineFormData {
  line_type: SessionRequestLineType;
  device_id?: string;
  supply_id?: string;
  quantity?: number;
  notes?: string;
}

// Line with joined relations for display
export interface SessionRequestLineWithRelations extends SessionRequestLine {
  device?: Device;
  supply?: Supply;
}

// ===========================================
// Session Request with full details
// ===========================================

export interface SessionRequestWithDetails extends SessionRequest {
  schedule?: TeachingScheduleWithRelations;
  lines?: SessionRequestLineWithRelations[];
}

// ===========================================
// Device Conflict
// ===========================================

export interface DeviceConflict {
  device_id: string;
  device?: Device;
  conflicting_request_id: string;
  conflicting_schedule?: TeachingScheduleWithRelations;
}
