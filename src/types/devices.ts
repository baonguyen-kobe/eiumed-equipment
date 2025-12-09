// Device Types
import type { Department, Room } from "./master";

export type DeviceStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "RETIRED";

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  AVAILABLE: "Sẵn sàng",
  IN_USE: "Đang sử dụng",
  MAINTENANCE: "Đang bảo trì",
  RETIRED: "Ngừng sử dụng",
};

export const DEVICE_STATUS_COLORS: Record<DeviceStatus, string> = {
  AVAILABLE: "success",
  IN_USE: "warning",
  MAINTENANCE: "destructive",
  RETIRED: "secondary",
};

export type DeviceLogType =
  | "MAINTENANCE"
  | "REPAIR"
  | "TRANSFER"
  | "INVENTORY"
  | "STATE_CHANGE";

export const DEVICE_LOG_TYPE_LABELS: Record<DeviceLogType, string> = {
  MAINTENANCE: "Bảo trì",
  REPAIR: "Sửa chữa",
  TRANSFER: "Điều chuyển",
  INVENTORY: "Kiểm kê",
  STATE_CHANGE: "Đổi trạng thái",
};

export const DEVICE_CATEGORIES = [
  "ECG",
  "Monitor",
  "Defibrillator",
  "Ventilator",
  "Ultrasound",
  "Infusion Pump",
  "Manikin",
  "X-Ray",
  "CT Scanner",
  "MRI",
  "Endoscopy",
  "Other",
] as const;

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];

export interface Device {
  id: string;
  code: string;
  name: string;
  category: string | null;
  serial_number: string | null;
  model: string | null;
  manufacturer: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  department_id: string | null;
  department?: Department | null;
  room_id: string | null;
  room?: Room | null;
  status: DeviceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceFormData {
  code: string;
  name: string;
  category?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: string;
  purchase_price?: number;
  department_id?: string;
  room_id?: string;
  status: DeviceStatus;
  notes?: string;
}

export interface DeviceLog {
  id: string;
  device_id: string;
  log_type: DeviceLogType;
  description: string | null;
  from_room_id: string | null;
  from_room?: Room | null;
  to_room_id: string | null;
  to_room?: Room | null;
  from_status: DeviceStatus | null;
  to_status: DeviceStatus | null;
  performed_at: string;
  performed_by: string | null;
  attachment_urls: string[] | null;
  created_at: string;
}

export interface DeviceLogFormData {
  log_type: DeviceLogType;
  description?: string;
  from_room_id?: string;
  to_room_id?: string;
  from_status?: DeviceStatus;
  to_status?: DeviceStatus;
  performed_at?: string;
  performed_by?: string;
}
