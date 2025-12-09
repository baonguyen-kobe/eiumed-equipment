-- Migration: 002_devices
-- Description: Create devices and device_logs tables for equipment management

-- ===========================================
-- Table: devices (Thiết bị y tế)
-- ===========================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  serial_number TEXT,
  model TEXT,
  manufacturer TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(18,2),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Device status enum (application level):
-- 'AVAILABLE' - Sẵn sàng sử dụng
-- 'IN_USE' - Đang được sử dụng
-- 'MAINTENANCE' - Đang bảo trì/sửa chữa
-- 'RETIRED' - Ngừng sử dụng/thanh lý

-- Indexes
CREATE INDEX idx_devices_code ON devices(code);
CREATE INDEX idx_devices_department_room ON devices(department_id, room_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_category ON devices(category);

-- Trigger for updated_at
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: device_logs (Lịch sử thiết bị)
-- ===========================================
CREATE TABLE IF NOT EXISTS device_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL,
  description TEXT,
  from_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  to_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  from_status TEXT,
  to_status TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  performed_by TEXT,
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Log type enum (application level):
-- 'MAINTENANCE' - Bảo trì định kỳ
-- 'REPAIR' - Sửa chữa
-- 'TRANSFER' - Điều chuyển phòng
-- 'INVENTORY' - Kiểm kê
-- 'STATE_CHANGE' - Thay đổi trạng thái

-- Indexes
CREATE INDEX idx_device_logs_device_id ON device_logs(device_id);
CREATE INDEX idx_device_logs_log_type ON device_logs(log_type);
CREATE INDEX idx_device_logs_performed_at ON device_logs(performed_at DESC);

-- ===========================================
-- Sample Data
-- ===========================================

-- Insert sample devices
INSERT INTO devices (code, name, category, serial_number, model, manufacturer, purchase_date, purchase_price, status, notes) VALUES
  ('DV-ECG-001', 'Máy điện tim 12 đạo trình', 'ECG', 'ECG-2024-001', 'CardioMax 12', 'Philips', '2023-06-15', 150000000, 'AVAILABLE', 'Thiết bị mới, bảo hành 2 năm'),
  ('DV-ECG-002', 'Máy điện tim 6 đạo trình', 'ECG', 'ECG-2024-002', 'CardioLite 6', 'GE Healthcare', '2022-03-20', 85000000, 'AVAILABLE', NULL),
  ('DV-MON-001', 'Monitor theo dõi bệnh nhân', 'Monitor', 'MON-2024-001', 'IntelliVue MX500', 'Philips', '2023-09-01', 280000000, 'IN_USE', 'Đang sử dụng tại phòng SIM-01'),
  ('DV-MON-002', 'Monitor theo dõi bệnh nhân', 'Monitor', 'MON-2024-002', 'IntelliVue MX500', 'Philips', '2023-09-01', 280000000, 'AVAILABLE', NULL),
  ('DV-DEF-001', 'Máy sốc điện', 'Defibrillator', 'DEF-2024-001', 'HeartStart XL+', 'Philips', '2022-11-10', 95000000, 'AVAILABLE', 'Bao gồm 2 bộ paddle'),
  ('DV-VEN-001', 'Máy thở xâm nhập', 'Ventilator', 'VEN-2024-001', 'PB840', 'Medtronic', '2023-01-25', 450000000, 'MAINTENANCE', 'Đang bảo trì định kỳ'),
  ('DV-VEN-002', 'Máy thở không xâm nhập', 'Ventilator', 'VEN-2024-002', 'V60 Plus', 'Philips', '2023-05-18', 320000000, 'AVAILABLE', NULL),
  ('DV-US-001', 'Máy siêu âm di động', 'Ultrasound', 'US-2024-001', 'Lumify', 'Philips', '2024-01-10', 180000000, 'AVAILABLE', 'Hỗ trợ kết nối tablet'),
  ('DV-US-002', 'Máy siêu âm tổng quát', 'Ultrasound', 'US-2024-002', 'EPIQ 7', 'Philips', '2022-08-30', 850000000, 'IN_USE', 'Đang sử dụng tại phòng US-301'),
  ('DV-INF-001', 'Bơm tiêm điện', 'Infusion Pump', 'INF-2024-001', 'Alaris PC', 'BD', '2023-07-22', 45000000, 'AVAILABLE', NULL),
  ('DV-INF-002', 'Bơm tiêm điện', 'Infusion Pump', 'INF-2024-002', 'Alaris PC', 'BD', '2023-07-22', 45000000, 'AVAILABLE', NULL),
  ('DV-INF-003', 'Bơm tiêm điện', 'Infusion Pump', 'INF-2024-003', 'Alaris PC', 'BD', '2023-07-22', 45000000, 'RETIRED', 'Hỏng bo mạch, đã thanh lý'),
  ('DV-MAN-001', 'Manikin hồi sức cấp cứu', 'Manikin', 'MAN-2024-001', 'Resusci Anne QCPR', 'Laerdal', '2023-03-15', 120000000, 'AVAILABLE', 'Kết nối app feedback'),
  ('DV-MAN-002', 'Manikin sản khoa', 'Manikin', 'MAN-2024-002', 'MamaNatalie', 'Laerdal', '2022-12-01', 85000000, 'AVAILABLE', NULL),
  ('DV-MAN-003', 'Manikin tiêm truyền', 'Manikin', 'MAN-2024-003', 'IV Arm', 'Laerdal', '2023-06-20', 35000000, 'IN_USE', 'Đang dùng tại phòng SKILL-01');

-- Insert sample device logs
INSERT INTO device_logs (device_id, log_type, description, from_status, to_status, performed_by, performed_at)
SELECT id, 'INVENTORY', 'Kiểm kê đầu năm 2024 - Tình trạng tốt', NULL, NULL, 'admin@truongy.edu.vn', '2024-01-05 09:00:00'
FROM devices WHERE code = 'DV-ECG-001';

INSERT INTO device_logs (device_id, log_type, description, from_status, to_status, performed_by, performed_at)
SELECT id, 'STATE_CHANGE', 'Đưa vào sử dụng cho buổi thực hành Hồi sức', 'AVAILABLE', 'IN_USE', 'qtvt@truongy.edu.vn', '2024-06-10 08:30:00'
FROM devices WHERE code = 'DV-MON-001';

INSERT INTO device_logs (device_id, log_type, description, from_status, to_status, performed_by, performed_at)
SELECT id, 'MAINTENANCE', 'Bảo trì định kỳ 6 tháng - thay filter, kiểm tra sensor', 'AVAILABLE', 'MAINTENANCE', 'qtvt@truongy.edu.vn', '2024-07-01 10:00:00'
FROM devices WHERE code = 'DV-VEN-001';

INSERT INTO device_logs (device_id, log_type, description, from_status, to_status, performed_by, performed_at)
SELECT id, 'REPAIR', 'Sửa chữa bo mạch điều khiển - không khắc phục được', 'MAINTENANCE', 'RETIRED', 'kythuat@truongy.edu.vn', '2024-05-20 14:00:00'
FROM devices WHERE code = 'DV-INF-003';

INSERT INTO device_logs (device_id, log_type, description, performed_by, performed_at)
SELECT d.id, 'TRANSFER', 'Điều chuyển từ kho sang phòng thực hành', 'qtvt@truongy.edu.vn', '2024-06-15 09:00:00'
FROM devices d
JOIN rooms r ON r.code = 'SKILL-01'
WHERE d.code = 'DV-MAN-003';

-- Update the transfer log with room info
UPDATE device_logs SET to_room_id = (SELECT id FROM rooms WHERE code = 'SKILL-01')
WHERE device_id = (SELECT id FROM devices WHERE code = 'DV-MAN-003') AND log_type = 'TRANSFER';
