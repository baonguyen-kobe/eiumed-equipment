// Mock data for demo mode
import type { Department, Room, Course, TimeSlot, RoomType } from "@/types/master";

// Generate a simple UUID-like string for mock data
const generateId = () => Math.random().toString(36).substring(2, 15);

export const mockDepartments: Department[] = [
  {
    id: "dept-1",
    code: "NOI",
    name: "Bộ môn Nội",
    description: "Bộ môn Nội khoa tổng hợp",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-2",
    code: "NGOAI",
    name: "Bộ môn Ngoại",
    description: "Bộ môn Ngoại khoa",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-3",
    code: "SAN",
    name: "Bộ môn Sản",
    description: "Bộ môn Sản phụ khoa",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-4",
    code: "NHI",
    name: "Bộ môn Nhi",
    description: "Bộ môn Nhi khoa",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-5",
    code: "GMHS",
    name: "Bộ môn Gây mê Hồi sức",
    description: "Bộ môn Gây mê - Hồi sức cấp cứu",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-6",
    code: "CDHA",
    name: "Bộ môn Chẩn đoán hình ảnh",
    description: "Bộ môn Chẩn đoán hình ảnh y học",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dept-7",
    code: "GPB",
    name: "Bộ môn Giải phẫu bệnh",
    description: "Bộ môn Giải phẫu bệnh - Pháp y",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const mockRooms: Room[] = [
  {
    id: "room-1",
    code: "P101",
    name: "Phòng học lý thuyết 101",
    department_id: null,
    capacity: 60,
    location: "Tầng 1, Tòa A",
    room_type: "CLASSROOM",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-2",
    code: "P102",
    name: "Phòng học lý thuyết 102",
    department_id: null,
    capacity: 60,
    location: "Tầng 1, Tòa A",
    room_type: "CLASSROOM",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-3",
    code: "LAB-A1",
    name: "Phòng thực hành Giải phẫu 1",
    department_id: "dept-7",
    capacity: 30,
    location: "Tầng 1, Tòa B",
    room_type: "LAB",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-4",
    code: "SIM-01",
    name: "Phòng mô phỏng Hồi sức 1",
    department_id: "dept-5",
    capacity: 20,
    location: "Tầng 2, Tòa B",
    room_type: "SIMULATION",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-5",
    code: "SIM-02",
    name: "Phòng mô phỏng Sản khoa",
    department_id: "dept-3",
    capacity: 15,
    location: "Tầng 2, Tòa B",
    room_type: "SIMULATION",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-6",
    code: "SKILL-01",
    name: "Phòng kỹ năng lâm sàng 1",
    department_id: null,
    capacity: 25,
    location: "Tầng 3, Tòa B",
    room_type: "SKILL_LAB",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-7",
    code: "US-301",
    name: "Phòng siêu âm 301",
    department_id: "dept-6",
    capacity: 10,
    location: "Tầng 3, Tòa C",
    room_type: "LAB",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "room-8",
    code: "XRAY-101",
    name: "Phòng X-quang thực hành",
    department_id: "dept-6",
    capacity: 8,
    location: "Tầng 1, Tòa C",
    room_type: "LAB",
    is_active: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const mockCourses: Course[] = [
  {
    id: "course-1",
    code: "NOI101",
    name: "Nội khoa cơ sở",
    department_id: "dept-1",
    description: "Môn học cơ bản về nội khoa",
    credits: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-2",
    code: "NOI201",
    name: "Nội khoa nâng cao",
    department_id: "dept-1",
    description: "Chuyên sâu các bệnh lý nội khoa",
    credits: 4,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-3",
    code: "NGOAI101",
    name: "Ngoại khoa cơ sở",
    department_id: "dept-2",
    description: "Cơ bản về ngoại khoa tổng quát",
    credits: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-4",
    code: "SAN101",
    name: "Sản phụ khoa",
    department_id: "dept-3",
    description: "Sản khoa và phụ khoa cơ bản",
    credits: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-5",
    code: "NHI101",
    name: "Nhi khoa",
    department_id: "dept-4",
    description: "Bệnh lý trẻ em",
    credits: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-6",
    code: "GMHS101",
    name: "Hồi sức cấp cứu",
    department_id: "dept-5",
    description: "Kỹ năng hồi sức cấp cứu cơ bản",
    credits: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-7",
    code: "CDHA101",
    name: "Chẩn đoán hình ảnh",
    department_id: "dept-6",
    description: "Siêu âm, X-quang, CT, MRI",
    credits: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-8",
    code: "GPB101",
    name: "Giải phẫu học",
    department_id: "dept-7",
    description: "Giải phẫu người cơ bản",
    credits: 4,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "course-9",
    code: "KNLS101",
    name: "Kỹ năng lâm sàng 1",
    department_id: null,
    description: "Kỹ năng khám bệnh cơ bản",
    credits: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const mockTimeSlots: TimeSlot[] = [
  {
    id: "slot-1",
    code: "S1",
    label: "Sáng 1 (7h00 - 9h00)",
    start_time: "07:00",
    end_time: "09:00",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "slot-2",
    code: "S2",
    label: "Sáng 2 (9h15 - 11h15)",
    start_time: "09:15",
    end_time: "11:15",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "slot-3",
    code: "C1",
    label: "Chiều 1 (13h00 - 15h00)",
    start_time: "13:00",
    end_time: "15:00",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "slot-4",
    code: "C2",
    label: "Chiều 2 (15h15 - 17h15)",
    start_time: "15:15",
    end_time: "17:15",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "slot-5",
    code: "T1",
    label: "Tối 1 (18h00 - 20h00)",
    start_time: "18:00",
    end_time: "20:00",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Helper to get department by ID
export const getDepartmentById = (id: string): Department | undefined => {
  return mockDepartments.find((d) => d.id === id);
};

// Enrich rooms with department data
export const getEnrichedRooms = (): Room[] => {
  return mockRooms.map((room) => ({
    ...room,
    department: room.department_id
      ? getDepartmentById(room.department_id)
      : null,
  }));
};

// Enrich courses with department data
export const getEnrichedCourses = (): Course[] => {
  return mockCourses.map((course) => ({
    ...course,
    department: course.department_id
      ? getDepartmentById(course.department_id)
      : null,
  }));
};
