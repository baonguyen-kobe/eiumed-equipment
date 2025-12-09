// Mock data for schedules and session requests
import type {
  TeachingSchedule,
  TeachingScheduleWithRelations,
  SessionRequest,
  SessionRequestStatus,
  SessionRequestLine,
  SessionRequestLineWithRelations,
  SessionRequestWithDetails,
  DeviceConflict,
} from "@/types/schedules";
import {
  mockCourses,
  mockRooms,
  mockTimeSlots,
} from "./mock-master";
import { mockDevices } from "./mock-devices";
import { mockSupplies } from "./mock-supplies";

// Helper to get today's Monday
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Generate dates for current week
const today = new Date();
const monday = getMonday(today);
const tuesday = new Date(monday);
tuesday.setDate(monday.getDate() + 1);
const wednesday = new Date(monday);
wednesday.setDate(monday.getDate() + 2);
const thursday = new Date(monday);
thursday.setDate(monday.getDate() + 3);
const friday = new Date(monday);
friday.setDate(monday.getDate() + 4);

// =============================================
// Mock Teaching Schedules
// =============================================

export const mockTeachingSchedules: TeachingSchedule[] = [
  // Monday
  {
    id: "sched-1",
    course_id: "course-9", // KNLS101 - Kỹ năng lâm sàng 1
    room_id: "room-6", // SKILL-01
    time_slot_id: "slot-1", // S1
    session_date: formatDate(monday),
    lecturer_id: "gv001@truongy.edu.vn",
    assistant_ids: ["trg001@truongy.edu.vn"],
    notes: "Kỹ năng khám tim phổi",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-2",
    course_id: "course-6", // GMHS101 - Hồi sức cấp cứu
    room_id: "room-4", // SIM-01
    time_slot_id: "slot-2", // S2
    session_date: formatDate(monday),
    lecturer_id: "gv002@truongy.edu.vn",
    assistant_ids: null,
    notes: "Thực hành CPR cơ bản",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-3",
    course_id: "course-1", // NOI101 - Nội khoa cơ sở
    room_id: "room-6", // SKILL-01
    time_slot_id: "slot-3", // C1
    session_date: formatDate(monday),
    lecturer_id: "gv003@truongy.edu.vn",
    assistant_ids: null,
    notes: "Khám bụng",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  // Tuesday
  {
    id: "sched-4",
    course_id: "course-7", // CDHA101 - Chẩn đoán hình ảnh
    room_id: "room-7", // US-301
    time_slot_id: "slot-1", // S1
    session_date: formatDate(tuesday),
    lecturer_id: "gv004@truongy.edu.vn",
    assistant_ids: ["trg002@truongy.edu.vn"],
    notes: "Siêu âm bụng tổng quát",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-5",
    course_id: "course-4", // SAN101 - Sản phụ khoa
    room_id: "room-5", // SIM-02
    time_slot_id: "slot-2", // S2
    session_date: formatDate(tuesday),
    lecturer_id: "gv005@truongy.edu.vn",
    assistant_ids: null,
    notes: "Thực hành đỡ đẻ",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-6",
    course_id: "course-6", // GMHS101 - Hồi sức cấp cứu
    room_id: "room-4", // SIM-01
    time_slot_id: "slot-3", // C1
    session_date: formatDate(tuesday),
    lecturer_id: "gv002@truongy.edu.vn",
    assistant_ids: ["trg001@truongy.edu.vn"],
    notes: "Đặt nội khí quản",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  // Wednesday
  {
    id: "sched-7",
    course_id: "course-9", // KNLS101
    room_id: "room-6", // SKILL-01
    time_slot_id: "slot-1", // S1
    session_date: formatDate(wednesday),
    lecturer_id: "gv001@truongy.edu.vn",
    assistant_ids: null,
    notes: "Tiêm tĩnh mạch",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-8",
    course_id: "course-3", // NGOAI101 - Ngoại khoa cơ sở
    room_id: "room-3", // LAB-A1
    time_slot_id: "slot-2", // S2
    session_date: formatDate(wednesday),
    lecturer_id: "gv006@truongy.edu.vn",
    assistant_ids: null,
    notes: "Cầm máu, khâu vết thương",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  // Thursday
  {
    id: "sched-9",
    course_id: "course-6", // GMHS101
    room_id: "room-4", // SIM-01
    time_slot_id: "slot-1", // S1
    session_date: formatDate(thursday),
    lecturer_id: "gv002@truongy.edu.vn",
    assistant_ids: ["trg001@truongy.edu.vn", "trg002@truongy.edu.vn"],
    notes: "Hồi sức nâng cao - ACLS",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-10",
    course_id: "course-7", // CDHA101
    room_id: "room-7", // US-301
    time_slot_id: "slot-3", // C1
    session_date: formatDate(thursday),
    lecturer_id: "gv004@truongy.edu.vn",
    assistant_ids: null,
    notes: "Siêu âm tim",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  // Friday
  {
    id: "sched-11",
    course_id: "course-9", // KNLS101
    room_id: "room-6", // SKILL-01
    time_slot_id: "slot-1", // S1
    session_date: formatDate(friday),
    lecturer_id: "gv001@truongy.edu.vn",
    assistant_ids: null,
    notes: "Đo huyết áp, đường huyết",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sched-12",
    course_id: "course-4", // SAN101
    room_id: "room-5", // SIM-02
    time_slot_id: "slot-2", // S2
    session_date: formatDate(friday),
    lecturer_id: "gv005@truongy.edu.vn",
    assistant_ids: null,
    notes: "Khám thai",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// =============================================
// Mock Session Requests
// =============================================

export const mockSessionRequests: SessionRequest[] = [
  {
    id: "req-1",
    schedule_id: "sched-2", // Monday S2 - CPR
    skill_name: "CPR cơ bản",
    requester_id: "gv002@truongy.edu.vn",
    status: "APPROVED",
    note: "Cần 5 manikin CPR, mỗi nhóm 4 sinh viên",
    created_at: "2024-07-01T08:00:00Z",
    updated_at: "2024-07-02T10:00:00Z",
    approved_by: "qtvt@truongy.edu.vn",
    approved_at: "2024-07-02T10:00:00Z",
    rejected_reason: null,
  },
  {
    id: "req-2",
    schedule_id: "sched-6", // Tuesday C1 - Đặt NKQ
    skill_name: "Đặt nội khí quản",
    requester_id: "gv002@truongy.edu.vn",
    status: "PENDING",
    note: "Nhóm 20 sinh viên, chia 5 trạm",
    created_at: "2024-07-05T09:00:00Z",
    updated_at: "2024-07-05T09:00:00Z",
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
  },
  {
    id: "req-3",
    schedule_id: "sched-7", // Wednesday S1 - Tiêm TM
    skill_name: "Tiêm tĩnh mạch",
    requester_id: "gv001@truongy.edu.vn",
    status: "PENDING",
    note: "Cần arm manikin và bộ tiêm truyền",
    created_at: "2024-07-06T08:30:00Z",
    updated_at: "2024-07-06T08:30:00Z",
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
  },
  {
    id: "req-4",
    schedule_id: "sched-9", // Thursday S1 - ACLS
    skill_name: "ACLS - Hồi sức tim phổi nâng cao",
    requester_id: "gv002@truongy.edu.vn",
    status: "APPROVED",
    note: "Buổi training cho bác sĩ nội trú",
    created_at: "2024-07-03T10:00:00Z",
    updated_at: "2024-07-04T09:00:00Z",
    approved_by: "qtvt@truongy.edu.vn",
    approved_at: "2024-07-04T09:00:00Z",
    rejected_reason: null,
  },
  {
    id: "req-5",
    schedule_id: "sched-4", // Tuesday S1 - Siêu âm
    skill_name: "Siêu âm bụng",
    requester_id: "gv004@truongy.edu.vn",
    status: "REJECTED",
    note: "Cần máy siêu âm di động",
    created_at: "2024-07-02T14:00:00Z",
    updated_at: "2024-07-03T11:00:00Z",
    approved_by: null,
    approved_at: null,
    rejected_reason: "Máy siêu âm di động đang bảo trì, dùng máy cố định tại phòng",
  },
];

// =============================================
// Mock Session Request Lines
// =============================================

export const mockSessionRequestLines: SessionRequestLine[] = [
  // Request 1 - CPR (APPROVED)
  {
    id: "line-1",
    session_request_id: "req-1",
    line_type: "DEVICE",
    device_id: "dev-11", // Manikin hồi sức cấp cứu
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-2",
    session_request_id: "req-1",
    line_type: "DEVICE",
    device_id: "dev-5", // Máy sốc điện
    supply_id: null,
    quantity: null,
    notes: "Dùng để demo",
  },
  {
    id: "line-3",
    session_request_id: "req-1",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-1", // Găng tay Nitrile
    quantity: 2,
    notes: "2 hộp cho 20 sinh viên",
  },
  // Request 2 - Đặt NKQ (PENDING)
  {
    id: "line-4",
    session_request_id: "req-2",
    line_type: "DEVICE",
    device_id: "dev-11", // Manikin hồi sức
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-5",
    session_request_id: "req-2",
    line_type: "DEVICE",
    device_id: "dev-3", // Monitor theo dõi
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-6",
    session_request_id: "req-2",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-1", // Găng tay Nitrile
    quantity: 3,
    notes: null,
  },
  {
    id: "line-7",
    session_request_id: "req-2",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-7", // Gel siêu âm (cho bôi trơn ống)
    quantity: 2,
    notes: null,
  },
  // Request 3 - Tiêm TM (PENDING)
  {
    id: "line-8",
    session_request_id: "req-3",
    line_type: "DEVICE",
    device_id: "dev-13", // Manikin tiêm truyền
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-9",
    session_request_id: "req-3",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-5", // Bơm kim tiêm 10ml
    quantity: 1,
    notes: null,
  },
  {
    id: "line-10",
    session_request_id: "req-3",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-1", // Găng tay
    quantity: 2,
    notes: null,
  },
  // Request 4 - ACLS (APPROVED)
  {
    id: "line-11",
    session_request_id: "req-4",
    line_type: "DEVICE",
    device_id: "dev-11", // Manikin hồi sức
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-12",
    session_request_id: "req-4",
    line_type: "DEVICE",
    device_id: "dev-5", // Máy sốc điện
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-13",
    session_request_id: "req-4",
    line_type: "DEVICE",
    device_id: "dev-3", // Monitor
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-14",
    session_request_id: "req-4",
    line_type: "DEVICE",
    device_id: "dev-1", // Máy ECG
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-15",
    session_request_id: "req-4",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-8", // Điện cực ECG
    quantity: 2,
    notes: null,
  },
  // Request 5 - Siêu âm (REJECTED)
  {
    id: "line-16",
    session_request_id: "req-5",
    line_type: "DEVICE",
    device_id: "dev-7", // Máy siêu âm di động
    supply_id: null,
    quantity: null,
    notes: null,
  },
  {
    id: "line-17",
    session_request_id: "req-5",
    line_type: "SUPPLY",
    device_id: null,
    supply_id: "sup-7", // Gel siêu âm
    quantity: 3,
    notes: null,
  },
];

// =============================================
// Helper Functions
// =============================================

// Get course/room/slot by ID
const getCourseById = (id: string) => mockCourses.find((c) => c.id === id);
const getRoomById = (id: string) => mockRooms.find((r) => r.id === id);
const getTimeSlotById = (id: string) => mockTimeSlots.find((t) => t.id === id);
const getDeviceById = (id: string) => mockDevices.find((d) => d.id === id);
const getSupplyById = (id: string) => mockSupplies.find((s) => s.id === id);

// Enrich schedule with relations
export function enrichSchedule(
  schedule: TeachingSchedule
): TeachingScheduleWithRelations {
  return {
    ...schedule,
    course: getCourseById(schedule.course_id),
    room: getRoomById(schedule.room_id),
    time_slot: getTimeSlotById(schedule.time_slot_id),
  };
}

// Get all schedules for a date range
export function getSchedulesByDateRange(
  from: string,
  to: string
): TeachingScheduleWithRelations[] {
  return mockTeachingSchedules
    .filter((s) => s.session_date >= from && s.session_date <= to)
    .map(enrichSchedule)
    .sort((a, b) => {
      if (a.session_date !== b.session_date) {
        return a.session_date.localeCompare(b.session_date);
      }
      const slotA = a.time_slot?.start_time || "";
      const slotB = b.time_slot?.start_time || "";
      return slotA.localeCompare(slotB);
    });
}

// Get schedules for a specific week (Monday to Sunday)
export function getSchedulesForWeek(weekStart: Date): TeachingScheduleWithRelations[] {
  const monday = getMonday(weekStart);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return getSchedulesByDateRange(formatDate(monday), formatDate(sunday));
}

// Get schedule by ID
export function getScheduleById(
  id: string
): TeachingScheduleWithRelations | undefined {
  const schedule = mockTeachingSchedules.find((s) => s.id === id);
  return schedule ? enrichSchedule(schedule) : undefined;
}

// Enrich request line with device/supply
function enrichLine(line: SessionRequestLine): SessionRequestLineWithRelations {
  return {
    ...line,
    device: line.device_id ? getDeviceById(line.device_id) : undefined,
    supply: line.supply_id ? getSupplyById(line.supply_id) : undefined,
  };
}

// Get session requests by status
export function getSessionRequestsByStatus(
  status?: SessionRequestStatus
): SessionRequestWithDetails[] {
  let requests = mockSessionRequests;
  if (status) {
    requests = requests.filter((r) => r.status === status);
  }
  return requests.map((r) => ({
    ...r,
    schedule: getScheduleById(r.schedule_id),
    lines: mockSessionRequestLines
      .filter((l) => l.session_request_id === r.id)
      .map(enrichLine),
  }));
}

// Get session requests for a lecturer
export function getSessionRequestsForLecturer(
  lecturerId: string
): SessionRequestWithDetails[] {
  return mockSessionRequests
    .filter((r) => r.requester_id === lecturerId)
    .map((r) => ({
      ...r,
      schedule: getScheduleById(r.schedule_id),
      lines: mockSessionRequestLines
        .filter((l) => l.session_request_id === r.id)
        .map(enrichLine),
    }));
}

// Get session request by ID with full details
export function getSessionRequestById(
  id: string
): SessionRequestWithDetails | undefined {
  const request = mockSessionRequests.find((r) => r.id === id);
  if (!request) return undefined;
  return {
    ...request,
    schedule: getScheduleById(request.schedule_id),
    lines: mockSessionRequestLines
      .filter((l) => l.session_request_id === id)
      .map(enrichLine),
  };
}

// Get request for a specific schedule
export function getRequestForSchedule(
  scheduleId: string
): SessionRequestWithDetails | undefined {
  const request = mockSessionRequests.find((r) => r.schedule_id === scheduleId);
  if (!request) return undefined;
  return getSessionRequestById(request.id);
}

// Check device conflicts
export function checkDeviceConflicts(params: {
  deviceIds: string[];
  sessionDate: string;
  timeSlotId: string;
  excludeRequestId?: string;
}): DeviceConflict[] {
  const { deviceIds, sessionDate, timeSlotId, excludeRequestId } = params;
  const conflicts: DeviceConflict[] = [];

  // Find approved requests on same date and time slot
  const approvedRequests = mockSessionRequests.filter(
    (r) =>
      r.status === "APPROVED" &&
      r.id !== excludeRequestId
  );

  for (const request of approvedRequests) {
    const schedule = mockTeachingSchedules.find(
      (s) => s.id === request.schedule_id
    );
    if (!schedule) continue;

    // Check if same date and time slot
    if (
      schedule.session_date === sessionDate &&
      schedule.time_slot_id === timeSlotId
    ) {
      // Check for device conflicts
      const requestLines = mockSessionRequestLines.filter(
        (l) =>
          l.session_request_id === request.id &&
          l.line_type === "DEVICE" &&
          l.device_id
      );

      for (const line of requestLines) {
        if (deviceIds.includes(line.device_id!)) {
          conflicts.push({
            device_id: line.device_id!,
            device: getDeviceById(line.device_id!),
            conflicting_request_id: request.id,
            conflicting_schedule: enrichSchedule(schedule),
          });
        }
      }
    }
  }

  return conflicts;
}

// Get all lecturers (unique from schedules)
export function getAllLecturers(): string[] {
  const lecturers = new Set<string>();
  mockTeachingSchedules.forEach((s) => {
    if (s.lecturer_id) lecturers.add(s.lecturer_id);
  });
  mockSessionRequests.forEach((r) => {
    if (r.requester_id) lecturers.add(r.requester_id);
  });
  return Array.from(lecturers).sort();
}
