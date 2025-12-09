// Supply Types

export type MovementType = "IN" | "OUT" | "ADJUST";

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  IN: "Nhập kho",
  OUT: "Xuất kho",
  ADJUST: "Điều chỉnh",
};

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  IN: "success",
  OUT: "warning",
  ADJUST: "secondary",
};

export type RelatedModule = "TEACHING_SESSION" | "INVENTORY" | "MANUAL" | "EXPIRED";

export const RELATED_MODULE_LABELS: Record<RelatedModule, string> = {
  TEACHING_SESSION: "Buổi học",
  INVENTORY: "Kiểm kê",
  MANUAL: "Thủ công",
  EXPIRED: "Hết hạn",
};

export const SUPPLY_CATEGORIES = [
  "Găng tay",
  "Khẩu trang",
  "Kim tiêm",
  "Băng gạc",
  "Gel/Dung dịch",
  "Điện cực",
  "Bao bọc",
  "Hồi sức",
  "Dung dịch",
  "Khác",
] as const;

export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number];

export interface Supply {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string | null;
  main_supplier: string | null;
  min_stock: number | null;
  max_stock: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  current_stock?: number;
  batches?: SupplyBatch[];
}

export interface SupplyFormData {
  code: string;
  name: string;
  unit: string;
  category?: string;
  main_supplier?: string;
  min_stock?: number;
  max_stock?: number;
  notes?: string;
}

export interface SupplyBatch {
  id: string;
  supply_id: string;
  batch_code: string | null;
  expiry_date: string | null;
  initial_quantity: number;
  remaining_quantity: number;
  received_date: string;
  supplier: string | null;
  unit_price: number | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  is_expired?: boolean;
  is_near_expiry?: boolean;
  days_until_expiry?: number | null;
}

export interface SupplyBatchFormData {
  batch_code?: string;
  expiry_date?: string;
  initial_quantity: number;
  received_date?: string;
  supplier?: string;
  unit_price?: number;
}

export interface StockMovement {
  id: string;
  supply_id: string;
  supply?: Supply;
  batch_id: string | null;
  batch?: SupplyBatch | null;
  movement_type: MovementType;
  quantity: number;
  reason: string | null;
  related_module: RelatedModule | null;
  related_id: string | null;
  performed_by: string | null;
  performed_at: string;
  created_at: string;
}

export interface StockMovementFormData {
  supply_id: string;
  batch_id?: string;
  movement_type: MovementType;
  quantity: number;
  reason?: string;
  related_module?: RelatedModule;
  performed_by?: string;
}

// View model for supply with stock info
export interface SupplyWithStock extends Supply {
  current_stock: number;
  batches: SupplyBatch[];
  stock_status: "ok" | "low" | "critical" | "over";
  near_expiry_count: number;
  expired_count: number;
}
