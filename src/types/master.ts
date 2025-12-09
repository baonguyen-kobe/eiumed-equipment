// Master Data Types

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFormData {
  code: string;
  name: string;
  description?: string;
}

export type RoomType = "CLASSROOM" | "LAB" | "SIMULATION" | "SKILL_LAB" | "OFFICE";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  CLASSROOM: "Phòng học lý thuyết",
  LAB: "Phòng thí nghiệm",
  SIMULATION: "Phòng mô phỏng",
  SKILL_LAB: "Phòng kỹ năng",
  OFFICE: "Văn phòng",
};

export interface Room {
  id: string;
  code: string;
  name: string;
  department_id: string | null;
  department?: Department | null;
  capacity: number | null;
  location: string | null;
  room_type: RoomType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomFormData {
  code: string;
  name: string;
  department_id?: string;
  capacity?: number;
  location?: string;
  room_type: RoomType;
  is_active: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department_id: string | null;
  department?: Department | null;
  description: string | null;
  credits: number | null;
  created_at: string;
  updated_at: string;
}

export interface CourseFormData {
  code: string;
  name: string;
  department_id?: string;
  description?: string;
  credits?: number;
}

export interface TimeSlot {
  id: string;
  code: string;
  label: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlotFormData {
  code: string;
  label: string;
  start_time: string;
  end_time: string;
}
