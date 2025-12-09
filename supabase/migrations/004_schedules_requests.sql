-- Migration: 004_schedules_requests
-- Description: Create teaching_schedules, session_requests, and session_request_lines tables

-- ===========================================
-- Table: teaching_schedules (Lịch giảng dạy)
-- ===========================================
CREATE TABLE IF NOT EXISTS teaching_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
  session_date DATE NOT NULL,
  lecturer_id TEXT,
  assistant_ids TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_room_slot_date UNIQUE (room_id, time_slot_id, session_date)
);

-- Indexes
CREATE INDEX idx_teaching_schedules_course ON teaching_schedules(course_id);
CREATE INDEX idx_teaching_schedules_lecturer ON teaching_schedules(lecturer_id);
CREATE INDEX idx_teaching_schedules_date ON teaching_schedules(session_date);
CREATE INDEX idx_teaching_schedules_room ON teaching_schedules(room_id);

-- Trigger for updated_at
CREATE TRIGGER update_teaching_schedules_updated_at
  BEFORE UPDATE ON teaching_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: session_requests (Đăng ký thiết bị & vật tư)
-- ===========================================
CREATE TABLE IF NOT EXISTS session_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES teaching_schedules(id) ON DELETE CASCADE,
  skill_name TEXT,
  requester_id TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT
);

-- Status enum (application level):
-- 'PENDING' - Chờ duyệt
-- 'APPROVED' - Đã duyệt
-- 'REJECTED' - Từ chối
-- 'CANCELLED' - Đã huỷ

-- Indexes
CREATE INDEX idx_session_requests_schedule ON session_requests(schedule_id);
CREATE INDEX idx_session_requests_status ON session_requests(status);
CREATE INDEX idx_session_requests_requester ON session_requests(requester_id);

-- Trigger for updated_at
CREATE TRIGGER update_session_requests_updated_at
  BEFORE UPDATE ON session_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Table: session_request_lines (Chi tiết đăng ký)
-- ===========================================
CREATE TABLE IF NOT EXISTS session_request_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_request_id UUID NOT NULL REFERENCES session_requests(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL,
  device_id UUID REFERENCES devices(id) ON DELETE RESTRICT,
  supply_id UUID REFERENCES supplies(id) ON DELETE RESTRICT,
  quantity INTEGER,
  notes TEXT,
  CONSTRAINT valid_line_type CHECK (line_type IN ('DEVICE', 'SUPPLY')),
  CONSTRAINT device_or_supply CHECK (
    (line_type = 'DEVICE' AND device_id IS NOT NULL) OR
    (line_type = 'SUPPLY' AND supply_id IS NOT NULL AND quantity IS NOT NULL AND quantity > 0)
  )
);

-- Line type:
-- 'DEVICE' - Thiết bị
-- 'SUPPLY' - Vật tư

-- Indexes
CREATE INDEX idx_session_request_lines_request ON session_request_lines(session_request_id);
CREATE INDEX idx_session_request_lines_device ON session_request_lines(device_id);
CREATE INDEX idx_session_request_lines_supply ON session_request_lines(supply_id);

-- ===========================================
-- Sample Data
-- ===========================================

-- Insert sample teaching schedules (using existing course, room, time_slot IDs)
-- Note: These will need to match actual IDs in your database

-- For demo, we'll insert schedules referencing the mock data structure
-- In real usage, run this after courses, rooms, time_slots are populated

-- Sample schedules for current week (adjust dates as needed)
INSERT INTO teaching_schedules (course_id, room_id, time_slot_id, session_date, lecturer_id, notes)
SELECT
  c.id,
  r.id,
  ts.id,
  CURRENT_DATE + interval '1 day',
  'gv001@truongy.edu.vn',
  'Buổi thực hành kỹ năng cơ bản'
FROM courses c, rooms r, time_slots ts
WHERE c.code = 'KNLS' AND r.code = 'P.TH-101' AND ts.name = 'Sáng 1'
LIMIT 1;

INSERT INTO teaching_schedules (course_id, room_id, time_slot_id, session_date, lecturer_id, notes)
SELECT
  c.id,
  r.id,
  ts.id,
  CURRENT_DATE + interval '2 days',
  'gv002@truongy.edu.vn',
  'Thực hành nội khoa'
FROM courses c, rooms r, time_slots ts
WHERE c.code = 'NK' AND r.code = 'P.TH-102' AND ts.name = 'Chiều 1'
LIMIT 1;

INSERT INTO teaching_schedules (course_id, room_id, time_slot_id, session_date, lecturer_id, notes)
SELECT
  c.id,
  r.id,
  ts.id,
  CURRENT_DATE + interval '3 days',
  'gv001@truongy.edu.vn',
  'Thực hành cấp cứu'
FROM courses c, rooms r, time_slots ts
WHERE c.code = 'CC' AND r.code = 'P.TH-103' AND ts.name = 'Sáng 2'
LIMIT 1;

-- Sample session request
INSERT INTO session_requests (schedule_id, skill_name, requester_id, status, note)
SELECT
  ts.id,
  'Đặt nội khí quản',
  'gv001@truongy.edu.vn',
  'PENDING',
  'Cần chuẩn bị đủ thiết bị cho 20 sinh viên'
FROM teaching_schedules ts
LIMIT 1;
