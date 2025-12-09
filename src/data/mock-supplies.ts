// Mock data for supplies module
import type {
  Supply,
  SupplyBatch,
  StockMovement,
  SupplyWithStock,
  MovementType,
  RelatedModule,
} from "@/types/supplies";

export const mockSupplies: Supply[] = [
  {
    id: "sup-1",
    code: "VT-GT-NITRILE",
    name: "Găng tay Nitrile không bột",
    unit: "hộp",
    category: "Găng tay",
    main_supplier: "Công ty ABC",
    min_stock: 50,
    max_stock: 200,
    notes: "Hộp 100 cái, size M",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-2",
    code: "VT-GT-LATEX",
    name: "Găng tay Latex có bột",
    unit: "hộp",
    category: "Găng tay",
    main_supplier: "Công ty ABC",
    min_stock: 30,
    max_stock: 150,
    notes: "Hộp 100 cái",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-3",
    code: "VT-KT-N95",
    name: "Khẩu trang N95",
    unit: "hộp",
    category: "Khẩu trang",
    main_supplier: "Công ty DEF",
    min_stock: 20,
    max_stock: 100,
    notes: "Hộp 20 cái",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-4",
    code: "VT-KT-YTXK",
    name: "Khẩu trang y tế 3 lớp",
    unit: "hộp",
    category: "Khẩu trang",
    main_supplier: "Công ty DEF",
    min_stock: 100,
    max_stock: 500,
    notes: "Hộp 50 cái",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-5",
    code: "VT-BKT-10ML",
    name: "Bơm kim tiêm 10ml",
    unit: "hộp",
    category: "Kim tiêm",
    main_supplier: "Công ty GHI",
    min_stock: 50,
    max_stock: 200,
    notes: "Hộp 100 cái",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-6",
    code: "VT-BKT-5ML",
    name: "Bơm kim tiêm 5ml",
    unit: "hộp",
    category: "Kim tiêm",
    main_supplier: "Công ty GHI",
    min_stock: 50,
    max_stock: 200,
    notes: "Hộp 100 cái",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-7",
    code: "VT-GEL-SA",
    name: "Gel siêu âm",
    unit: "chai",
    category: "Gel/Dung dịch",
    main_supplier: "Công ty JKL",
    min_stock: 20,
    max_stock: 80,
    notes: "Chai 250ml",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-8",
    code: "VT-CON-ECG",
    name: "Điện cực ECG dùng 1 lần",
    unit: "gói",
    category: "Điện cực",
    main_supplier: "Công ty PQR",
    min_stock: 30,
    max_stock: 100,
    notes: "Gói 50 miếng",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-9",
    code: "VT-NL-NS",
    name: "Nước muối sinh lý NaCl 0.9%",
    unit: "chai",
    category: "Dung dịch",
    main_supplier: "Công ty STU",
    min_stock: 100,
    max_stock: 400,
    notes: "Chai 500ml",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "sup-10",
    code: "VT-CON-AMBU",
    name: "Mặt nạ Ambu dùng 1 lần",
    unit: "cái",
    category: "Hồi sức",
    main_supplier: "Công ty VWX",
    min_stock: 20,
    max_stock: 80,
    notes: "Size người lớn",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const mockSupplyBatches: SupplyBatch[] = [
  // Găng tay Nitrile - 2 lô
  {
    id: "batch-1",
    supply_id: "sup-1",
    batch_code: "LOT-2024-001",
    expiry_date: "2025-06-30",
    initial_quantity: 100,
    remaining_quantity: 85,
    received_date: "2024-01-15",
    supplier: "Công ty ABC",
    unit_price: 150000,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-06-15T00:00:00Z",
  },
  {
    id: "batch-2",
    supply_id: "sup-1",
    batch_code: "LOT-2024-002",
    expiry_date: "2025-12-31",
    initial_quantity: 80,
    remaining_quantity: 80,
    received_date: "2024-06-01",
    supplier: "Công ty ABC",
    unit_price: 155000,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  // Găng tay Latex - 1 lô (sắp hết hạn)
  {
    id: "batch-3",
    supply_id: "sup-2",
    batch_code: "LOT-2024-003",
    expiry_date: "2025-01-15", // Near expiry!
    initial_quantity: 50,
    remaining_quantity: 12,
    received_date: "2024-02-01",
    supplier: "Công ty ABC",
    unit_price: 120000,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  // Khẩu trang N95 - 2 lô
  {
    id: "batch-4",
    supply_id: "sup-3",
    batch_code: "LOT-2024-004",
    expiry_date: "2025-01-20", // Near expiry!
    initial_quantity: 30,
    remaining_quantity: 8,
    received_date: "2024-03-10",
    supplier: "Công ty DEF",
    unit_price: 350000,
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  {
    id: "batch-5",
    supply_id: "sup-3",
    batch_code: "LOT-2024-005",
    expiry_date: "2026-01-15",
    initial_quantity: 50,
    remaining_quantity: 50,
    received_date: "2024-07-01",
    supplier: "Công ty DEF",
    unit_price: 360000,
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  // Khẩu trang y tế
  {
    id: "batch-6",
    supply_id: "sup-4",
    batch_code: "LOT-2024-006",
    expiry_date: "2025-09-30",
    initial_quantity: 200,
    remaining_quantity: 180,
    received_date: "2024-04-15",
    supplier: "Công ty DEF",
    unit_price: 85000,
    created_at: "2024-04-15T00:00:00Z",
    updated_at: "2024-07-10T00:00:00Z",
  },
  // Bơm kim tiêm 10ml
  {
    id: "batch-7",
    supply_id: "sup-5",
    batch_code: "LOT-2024-007",
    expiry_date: "2026-06-30",
    initial_quantity: 100,
    remaining_quantity: 95,
    received_date: "2024-05-20",
    supplier: "Công ty GHI",
    unit_price: 280000,
    created_at: "2024-05-20T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  // Bơm kim tiêm 5ml
  {
    id: "batch-8",
    supply_id: "sup-6",
    batch_code: "LOT-2024-008",
    expiry_date: "2026-06-30",
    initial_quantity: 100,
    remaining_quantity: 88,
    received_date: "2024-05-20",
    supplier: "Công ty GHI",
    unit_price: 250000,
    created_at: "2024-05-20T00:00:00Z",
    updated_at: "2024-06-15T00:00:00Z",
  },
  // Gel siêu âm
  {
    id: "batch-9",
    supply_id: "sup-7",
    batch_code: "LOT-2024-009",
    expiry_date: "2025-08-31",
    initial_quantity: 40,
    remaining_quantity: 35,
    received_date: "2024-03-01",
    supplier: "Công ty JKL",
    unit_price: 95000,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  // Điện cực ECG
  {
    id: "batch-10",
    supply_id: "sup-8",
    batch_code: "LOT-2024-010",
    expiry_date: "2025-04-30",
    initial_quantity: 60,
    remaining_quantity: 42,
    received_date: "2024-02-15",
    supplier: "Công ty PQR",
    unit_price: 180000,
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-06-20T00:00:00Z",
  },
  // Nước muối sinh lý
  {
    id: "batch-11",
    supply_id: "sup-9",
    batch_code: "LOT-2024-011",
    expiry_date: "2025-12-31",
    initial_quantity: 150,
    remaining_quantity: 120,
    received_date: "2024-06-10",
    supplier: "Công ty STU",
    unit_price: 25000,
    created_at: "2024-06-10T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  // Mặt nạ Ambu - tồn thấp
  {
    id: "batch-12",
    supply_id: "sup-10",
    batch_code: "LOT-2024-012",
    expiry_date: "2026-03-31",
    initial_quantity: 30,
    remaining_quantity: 15,
    received_date: "2024-04-01",
    supplier: "Công ty VWX",
    unit_price: 85000,
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
];

export const mockStockMovements: StockMovement[] = [
  {
    id: "mov-1",
    supply_id: "sup-1",
    batch_id: "batch-1",
    movement_type: "IN",
    quantity: 100,
    reason: "Nhập kho đợt 1/2024",
    related_module: "MANUAL",
    related_id: null,
    performed_by: "qtvt@truongy.edu.vn",
    performed_at: "2024-01-15T10:00:00Z",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "mov-2",
    supply_id: "sup-1",
    batch_id: "batch-1",
    movement_type: "OUT",
    quantity: 15,
    reason: "Xuất cho buổi thực hành Kỹ năng lâm sàng",
    related_module: "TEACHING_SESSION",
    related_id: null,
    performed_by: "qtvt@truongy.edu.vn",
    performed_at: "2024-06-15T08:00:00Z",
    created_at: "2024-06-15T08:00:00Z",
  },
  {
    id: "mov-3",
    supply_id: "sup-1",
    batch_id: "batch-2",
    movement_type: "IN",
    quantity: 80,
    reason: "Nhập kho đợt 2/2024",
    related_module: "MANUAL",
    related_id: null,
    performed_by: "qtvt@truongy.edu.vn",
    performed_at: "2024-06-01T09:00:00Z",
    created_at: "2024-06-01T09:00:00Z",
  },
  {
    id: "mov-4",
    supply_id: "sup-4",
    batch_id: "batch-6",
    movement_type: "OUT",
    quantity: 20,
    reason: "Xuất cho buổi thực hành Nội khoa",
    related_module: "TEACHING_SESSION",
    related_id: null,
    performed_by: "qtvt@truongy.edu.vn",
    performed_at: "2024-07-10T09:00:00Z",
    created_at: "2024-07-10T09:00:00Z",
  },
];

// Helper functions
const NEAR_EXPIRY_DAYS = 60; // 60 days threshold for near expiry warning

export function calculateBatchStatus(batch: SupplyBatch): SupplyBatch {
  const today = new Date();
  let is_expired = false;
  let is_near_expiry = false;
  let days_until_expiry: number | null = null;

  if (batch.expiry_date) {
    const expiryDate = new Date(batch.expiry_date);
    const diffTime = expiryDate.getTime() - today.getTime();
    days_until_expiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    is_expired = days_until_expiry < 0;
    is_near_expiry = !is_expired && days_until_expiry <= NEAR_EXPIRY_DAYS;
  }

  return {
    ...batch,
    is_expired,
    is_near_expiry,
    days_until_expiry,
  };
}

export function getSupplyCurrentStock(supplyId: string): number {
  return mockSupplyBatches
    .filter((b) => b.supply_id === supplyId)
    .reduce((sum, b) => sum + b.remaining_quantity, 0);
}

export function getSupplyBatches(supplyId: string): SupplyBatch[] {
  return mockSupplyBatches
    .filter((b) => b.supply_id === supplyId)
    .map(calculateBatchStatus)
    .sort((a, b) => {
      // Sort by expiry date (soonest first), then by remaining quantity
      if (a.expiry_date && b.expiry_date) {
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      }
      return 0;
    });
}

export function getSuppliesWithStock(): SupplyWithStock[] {
  return mockSupplies.map((supply) => {
    const batches = getSupplyBatches(supply.id);
    const current_stock = batches.reduce((sum, b) => sum + b.remaining_quantity, 0);

    // Determine stock status
    let stock_status: "ok" | "low" | "critical" | "over" = "ok";
    if (supply.min_stock && current_stock < supply.min_stock) {
      stock_status = current_stock === 0 ? "critical" : "low";
    } else if (supply.max_stock && current_stock > supply.max_stock) {
      stock_status = "over";
    }

    // Count expiry status
    const near_expiry_count = batches.filter(
      (b) => b.is_near_expiry && b.remaining_quantity > 0
    ).length;
    const expired_count = batches.filter(
      (b) => b.is_expired && b.remaining_quantity > 0
    ).length;

    return {
      ...supply,
      current_stock,
      batches,
      stock_status,
      near_expiry_count,
      expired_count,
    };
  });
}

export function getSupplyById(supplyId: string): SupplyWithStock | undefined {
  const supply = mockSupplies.find((s) => s.id === supplyId);
  if (!supply) return undefined;

  const batches = getSupplyBatches(supplyId);
  const current_stock = batches.reduce((sum, b) => sum + b.remaining_quantity, 0);

  let stock_status: "ok" | "low" | "critical" | "over" = "ok";
  if (supply.min_stock && current_stock < supply.min_stock) {
    stock_status = current_stock === 0 ? "critical" : "low";
  } else if (supply.max_stock && current_stock > supply.max_stock) {
    stock_status = "over";
  }

  const near_expiry_count = batches.filter(
    (b) => b.is_near_expiry && b.remaining_quantity > 0
  ).length;
  const expired_count = batches.filter(
    (b) => b.is_expired && b.remaining_quantity > 0
  ).length;

  return {
    ...supply,
    current_stock,
    batches,
    stock_status,
    near_expiry_count,
    expired_count,
  };
}

export function getStockMovements(supplyId?: string): StockMovement[] {
  let movements = mockStockMovements;
  if (supplyId) {
    movements = movements.filter((m) => m.supply_id === supplyId);
  }
  return movements.sort(
    (a, b) =>
      new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
  );
}

export function getSuppliesNeedingReorder(): SupplyWithStock[] {
  return getSuppliesWithStock().filter((s) => s.stock_status === "low" || s.stock_status === "critical");
}

export function getBatchesNearExpiry(daysThreshold: number = NEAR_EXPIRY_DAYS): SupplyBatch[] {
  const today = new Date();
  return mockSupplyBatches
    .filter((b) => {
      if (!b.expiry_date || b.remaining_quantity === 0) return false;
      const expiryDate = new Date(b.expiry_date);
      const diffDays = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays >= 0 && diffDays <= daysThreshold;
    })
    .map(calculateBatchStatus)
    .sort((a, b) => {
      if (a.expiry_date && b.expiry_date) {
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      }
      return 0;
    });
}
