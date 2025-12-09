-- Migration: 003_supplies
-- Description: Create supplies, supply_batches, and stock_movements tables

-- ===========================================
-- Table: supplies (Danh mục vật tư)
-- ===========================================
CREATE TABLE IF NOT EXISTS supplies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  category TEXT,
  main_supplier TEXT,
  min_stock INTEGER,
  max_stock INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_supplies_code ON supplies(code);
CREATE INDEX idx_supplies_category ON supplies(category);

-- Trigger for updated_at
CREATE TRIGGER update_supplies_updated_at
  BEFORE UPDATE ON supplies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: supply_batches (Lô vật tư theo HSD)
-- ===========================================
CREATE TABLE IF NOT EXISTS supply_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
  batch_code TEXT,
  expiry_date DATE,
  initial_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier TEXT,
  unit_price NUMERIC(18,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT remaining_quantity_non_negative CHECK (remaining_quantity >= 0)
);

-- Indexes
CREATE INDEX idx_supply_batches_supply_id ON supply_batches(supply_id);
CREATE INDEX idx_supply_batches_expiry_date ON supply_batches(expiry_date);
CREATE INDEX idx_supply_batches_remaining ON supply_batches(remaining_quantity) WHERE remaining_quantity > 0;

-- Trigger for updated_at
CREATE TRIGGER update_supply_batches_updated_at
  BEFORE UPDATE ON supply_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: stock_movements (Phiếu nhập/xuất/điều chỉnh)
-- ===========================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES supply_batches(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  related_module TEXT,
  related_id TEXT,
  performed_by TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Movement type enum (application level):
-- 'IN' - Nhập kho
-- 'OUT' - Xuất kho
-- 'ADJUST' - Điều chỉnh

-- Related module:
-- 'TEACHING_SESSION' - Xuất cho buổi học
-- 'INVENTORY' - Kiểm kê
-- 'MANUAL' - Thủ công
-- 'EXPIRED' - Hủy do hết hạn

-- Indexes
CREATE INDEX idx_stock_movements_supply_id ON stock_movements(supply_id);
CREATE INDEX idx_stock_movements_batch_id ON stock_movements(batch_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_performed_at ON stock_movements(performed_at DESC);

-- ===========================================
-- Sample Data
-- ===========================================

-- Insert sample supplies
INSERT INTO supplies (code, name, unit, category, main_supplier, min_stock, max_stock, notes) VALUES
  ('VT-GT-NITRILE', 'Găng tay Nitrile không bột', 'hộp', 'Găng tay', 'Công ty ABC', 50, 200, 'Hộp 100 cái, size M'),
  ('VT-GT-LATEX', 'Găng tay Latex có bột', 'hộp', 'Găng tay', 'Công ty ABC', 30, 150, 'Hộp 100 cái'),
  ('VT-KT-N95', 'Khẩu trang N95', 'hộp', 'Khẩu trang', 'Công ty DEF', 20, 100, 'Hộp 20 cái'),
  ('VT-KT-YTXK', 'Khẩu trang y tế 3 lớp', 'hộp', 'Khẩu trang', 'Công ty DEF', 100, 500, 'Hộp 50 cái'),
  ('VT-BKT-10ML', 'Bơm kim tiêm 10ml', 'hộp', 'Kim tiêm', 'Công ty GHI', 50, 200, 'Hộp 100 cái'),
  ('VT-BKT-5ML', 'Bơm kim tiêm 5ml', 'hộp', 'Kim tiêm', 'Công ty GHI', 50, 200, 'Hộp 100 cái'),
  ('VT-BKT-3ML', 'Bơm kim tiêm 3ml', 'hộp', 'Kim tiêm', 'Công ty GHI', 30, 150, 'Hộp 100 cái'),
  ('VT-GEL-SA', 'Gel siêu âm', 'chai', 'Gel/Dung dịch', 'Công ty JKL', 20, 80, 'Chai 250ml'),
  ('VT-CON-SA', 'Bao đầu dò siêu âm', 'hộp', 'Bao bọc', 'Công ty JKL', 10, 50, 'Hộp 100 cái'),
  ('VT-BANG-VT', 'Băng vô trùng', 'hộp', 'Băng gạc', 'Công ty MNO', 30, 100, 'Hộp 50 miếng'),
  ('VT-GAC-VT', 'Gạc vô trùng 10x10', 'gói', 'Băng gạc', 'Công ty MNO', 50, 200, 'Gói 10 miếng'),
  ('VT-CON-ECG', 'Điện cực ECG dùng 1 lần', 'gói', 'Điện cực', 'Công ty PQR', 30, 100, 'Gói 50 miếng'),
  ('VT-NL-NS', 'Nước muối sinh lý NaCl 0.9%', 'chai', 'Dung dịch', 'Công ty STU', 100, 400, 'Chai 500ml'),
  ('VT-CON-AMBU', 'Mặt nạ Ambu dùng 1 lần', 'cái', 'Hồi sức', 'Công ty VWX', 20, 80, 'Size người lớn'),
  ('VT-ONG-NKQ', 'Ống nội khí quản số 7.5', 'cái', 'Hồi sức', 'Công ty VWX', 10, 40, 'Có bóng chèn');

-- Insert sample batches
INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-001', '2025-06-30', 100, 85, '2024-01-15', 'Công ty ABC', 150000
FROM supplies WHERE code = 'VT-GT-NITRILE';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-002', '2025-12-31', 80, 80, '2024-06-01', 'Công ty ABC', 155000
FROM supplies WHERE code = 'VT-GT-NITRILE';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-003', '2025-03-15', 50, 12, '2024-02-01', 'Công ty ABC', 120000
FROM supplies WHERE code = 'VT-GT-LATEX';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-004', '2025-01-20', 30, 8, '2024-03-10', 'Công ty DEF', 350000
FROM supplies WHERE code = 'VT-KT-N95';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-005', '2026-01-15', 50, 50, '2024-07-01', 'Công ty DEF', 360000
FROM supplies WHERE code = 'VT-KT-N95';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-006', '2025-09-30', 200, 180, '2024-04-15', 'Công ty DEF', 85000
FROM supplies WHERE code = 'VT-KT-YTXK';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-007', '2026-06-30', 100, 95, '2024-05-20', 'Công ty GHI', 280000
FROM supplies WHERE code = 'VT-BKT-10ML';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-008', '2026-06-30', 100, 88, '2024-05-20', 'Công ty GHI', 250000
FROM supplies WHERE code = 'VT-BKT-5ML';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-009', '2025-08-31', 40, 35, '2024-03-01', 'Công ty JKL', 95000
FROM supplies WHERE code = 'VT-GEL-SA';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-010', '2025-04-30', 60, 42, '2024-02-15', 'Công ty PQR', 180000
FROM supplies WHERE code = 'VT-CON-ECG';

INSERT INTO supply_batches (supply_id, batch_code, expiry_date, initial_quantity, remaining_quantity, received_date, supplier, unit_price)
SELECT id, 'LOT-2024-011', '2025-12-31', 150, 120, '2024-06-10', 'Công ty STU', 25000
FROM supplies WHERE code = 'VT-NL-NS';

-- Insert sample stock movements
INSERT INTO stock_movements (supply_id, batch_id, movement_type, quantity, reason, related_module, performed_by, performed_at)
SELECT s.id, b.id, 'IN', 100, 'Nhập kho đợt 1/2024', 'MANUAL', 'qtvt@truongy.edu.vn', '2024-01-15 10:00:00'
FROM supplies s
JOIN supply_batches b ON b.supply_id = s.id AND b.batch_code = 'LOT-2024-001'
WHERE s.code = 'VT-GT-NITRILE';

INSERT INTO stock_movements (supply_id, batch_id, movement_type, quantity, reason, related_module, performed_by, performed_at)
SELECT s.id, b.id, 'OUT', 15, 'Xuất cho buổi thực hành Kỹ năng lâm sàng', 'TEACHING_SESSION', 'qtvt@truongy.edu.vn', '2024-06-15 08:00:00'
FROM supplies s
JOIN supply_batches b ON b.supply_id = s.id AND b.batch_code = 'LOT-2024-001'
WHERE s.code = 'VT-GT-NITRILE';

INSERT INTO stock_movements (supply_id, batch_id, movement_type, quantity, reason, related_module, performed_by, performed_at)
SELECT s.id, b.id, 'OUT', 20, 'Xuất cho buổi thực hành Nội khoa', 'TEACHING_SESSION', 'qtvt@truongy.edu.vn', '2024-07-10 09:00:00'
FROM supplies s
JOIN supply_batches b ON b.supply_id = s.id AND b.batch_code = 'LOT-2024-006'
WHERE s.code = 'VT-KT-YTXK';
