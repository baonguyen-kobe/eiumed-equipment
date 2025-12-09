// Queries for schedules and session requests
import type {
  TeachingScheduleWithRelations,
  SessionRequestWithDetails,
  SessionRequestStatus,
} from "@/types/schedules";
import {
  getSchedulesByDateRange,
  getSchedulesForWeek,
  getScheduleById,
  getSessionRequestsByStatus,
  getSessionRequestsForLecturer,
  getSessionRequestById,
  getRequestForSchedule,
  getAllLecturers,
} from "@/data/mock-schedules";

// Check if running in mock mode
const isMockMode = () => {
  if (typeof window === "undefined") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes("placeholder");
};

// =============================================
// Teaching Schedule Queries
// =============================================

export async function listSchedulesByDateRange(
  from: string,
  to: string
): Promise<TeachingScheduleWithRelations[]> {
  if (isMockMode()) {
    return getSchedulesByDateRange(from, to);
  }
  // TODO: Implement Supabase query
  return getSchedulesByDateRange(from, to);
}

export async function listSchedulesForWeek(
  weekStart: Date
): Promise<TeachingScheduleWithRelations[]> {
  if (isMockMode()) {
    return getSchedulesForWeek(weekStart);
  }
  // TODO: Implement Supabase query
  return getSchedulesForWeek(weekStart);
}

export async function fetchScheduleById(
  id: string
): Promise<TeachingScheduleWithRelations | null> {
  if (isMockMode()) {
    return getScheduleById(id) || null;
  }
  // TODO: Implement Supabase query
  return getScheduleById(id) || null;
}

// =============================================
// Session Request Queries
// =============================================

export async function listSessionRequests(filter?: {
  status?: SessionRequestStatus;
  lecturerId?: string;
}): Promise<SessionRequestWithDetails[]> {
  if (isMockMode()) {
    if (filter?.lecturerId) {
      return getSessionRequestsForLecturer(filter.lecturerId);
    }
    return getSessionRequestsByStatus(filter?.status);
  }
  // TODO: Implement Supabase query
  if (filter?.lecturerId) {
    return getSessionRequestsForLecturer(filter.lecturerId);
  }
  return getSessionRequestsByStatus(filter?.status);
}

export async function fetchSessionRequestById(
  id: string
): Promise<SessionRequestWithDetails | null> {
  if (isMockMode()) {
    return getSessionRequestById(id) || null;
  }
  // TODO: Implement Supabase query
  return getSessionRequestById(id) || null;
}

export async function fetchRequestForSchedule(
  scheduleId: string
): Promise<SessionRequestWithDetails | null> {
  if (isMockMode()) {
    return getRequestForSchedule(scheduleId) || null;
  }
  // TODO: Implement Supabase query
  return getRequestForSchedule(scheduleId) || null;
}

// =============================================
// Lecturer Queries
// =============================================

export async function listLecturers(): Promise<string[]> {
  if (isMockMode()) {
    return getAllLecturers();
  }
  // TODO: Implement Supabase query
  return getAllLecturers();
}
