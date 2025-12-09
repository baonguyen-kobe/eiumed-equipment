// Mutations for schedules and session requests
import type {
  TeachingSchedule,
  TeachingScheduleFormData,
  SessionRequest,
  SessionRequestFormData,
  SessionRequestLineFormData,
  SessionRequestStatus,
} from "@/types/schedules";

// Check if running in mock mode
const isMockMode = () => {
  if (typeof window === "undefined") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes("placeholder");
};

// =============================================
// Teaching Schedule Mutations
// =============================================

export async function createTeachingSchedule(
  payload: TeachingScheduleFormData
): Promise<TeachingSchedule> {
  if (isMockMode()) {
    // Return mock created schedule
    const newSchedule: TeachingSchedule = {
      id: `sched-${Date.now()}`,
      course_id: payload.course_id,
      room_id: payload.room_id,
      time_slot_id: payload.time_slot_id,
      session_date: payload.session_date,
      lecturer_id: payload.lecturer_id || null,
      assistant_ids: payload.assistant_ids || null,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newSchedule;
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}

export async function updateTeachingSchedule(
  id: string,
  payload: Partial<TeachingScheduleFormData>
): Promise<TeachingSchedule> {
  if (isMockMode()) {
    // Return mock updated schedule
    return {
      id,
      course_id: payload.course_id || "",
      room_id: payload.room_id || "",
      time_slot_id: payload.time_slot_id || "",
      session_date: payload.session_date || "",
      lecturer_id: payload.lecturer_id || null,
      assistant_ids: payload.assistant_ids || null,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}

export async function deleteTeachingSchedule(id: string): Promise<void> {
  if (isMockMode()) {
    // Mock delete - in real app would remove from database
    console.log("Mock delete schedule:", id);
    return;
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}

// =============================================
// Session Request Mutations
// =============================================

export async function createSessionRequest(
  payload: SessionRequestFormData,
  lines: SessionRequestLineFormData[]
): Promise<SessionRequest> {
  if (isMockMode()) {
    // Validate at least one line
    if (lines.length === 0) {
      throw new Error("Phải chọn ít nhất một thiết bị hoặc vật tư");
    }

    // Return mock created request
    const newRequest: SessionRequest = {
      id: `req-${Date.now()}`,
      schedule_id: payload.schedule_id,
      skill_name: payload.skill_name || null,
      requester_id: payload.requester_id || null,
      status: "PENDING",
      note: payload.note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
      rejected_reason: null,
    };
    return newRequest;
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}

export async function updateSessionRequestStatus(
  id: string,
  status: SessionRequestStatus,
  extra?: {
    approved_by?: string;
    rejected_reason?: string;
  }
): Promise<SessionRequest> {
  if (isMockMode()) {
    // Return mock updated request
    const now = new Date().toISOString();
    return {
      id,
      schedule_id: "",
      skill_name: null,
      requester_id: null,
      status,
      note: null,
      created_at: now,
      updated_at: now,
      approved_by: status === "APPROVED" ? extra?.approved_by || null : null,
      approved_at: status === "APPROVED" ? now : null,
      rejected_reason: status === "REJECTED" ? extra?.rejected_reason || null : null,
    };
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}

export async function updateSessionRequestLines(
  requestId: string,
  lines: SessionRequestLineFormData[]
): Promise<void> {
  if (isMockMode()) {
    // Validate at least one line
    if (lines.length === 0) {
      throw new Error("Phải chọn ít nhất một thiết bị hoặc vật tư");
    }
    console.log("Mock update lines for request:", requestId, lines);
    return;
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}

export async function cancelSessionRequest(id: string): Promise<void> {
  if (isMockMode()) {
    console.log("Mock cancel request:", id);
    return;
  }
  // TODO: Implement Supabase mutation
  throw new Error("Supabase not configured");
}
