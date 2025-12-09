-- Migration: 001_master_data
-- Description: Create master data tables for departments, rooms, courses, time_slots

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Table: departments (Khoa / Bộ môn)
-- ===========================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_departments_code ON departments(code);

-- Sample data
INSERT INTO departments (code, name, description) VALUES
  ('NOI', 'Bộ môn Nội', 'Bộ môn Nội khoa tổng hợp'),
  ('NGOAI', 'Bộ môn Ngoại', 'Bộ môn Ngoại khoa'),
  ('SAN', 'Bộ môn Sản', 'Bộ môn Sản phụ khoa'),
  ('NHI', 'Bộ môn Nhi', 'Bộ môn Nhi khoa'),
  ('GMHS', 'Bộ môn Gây mê Hồi sức', 'Bộ môn Gây mê - Hồi sức cấp cứu'),
  ('CDHA', 'Bộ môn Chẩn đoán hình ảnh', 'Bộ môn Chẩn đoán hình ảnh y học'),
  ('GPB', 'Bộ môn Giải phẫu bệnh', 'Bộ môn Giải phẫu bệnh - Pháp y'),
  ('YHCT', 'Bộ môn Y học cổ truyền', 'Bộ môn Y học cổ truyền');

-- ===========================================
-- Table: rooms (Phòng học / Phòng thực hành)
-- ===========================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  capacity INTEGER,
  location TEXT,
  room_type TEXT DEFAULT 'CLASSROOM',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_department_id ON rooms(department_id);
CREATE INDEX idx_rooms_is_active ON rooms(is_active);

-- Room type can be: CLASSROOM, LAB, SIMULATION, SKILL_LAB, OFFICE

-- Sample data
INSERT INTO rooms (code, name, capacity, location, room_type) VALUES
  ('P101', 'Phòng học lý thuyết 101', 60, 'Tầng 1, Tòa A', 'CLASSROOM'),
  ('P102', 'Phòng học lý thuyết 102', 60, 'Tầng 1, Tòa A', 'CLASSROOM'),
  ('P201', 'Phòng học lý thuyết 201', 45, 'Tầng 2, Tòa A', 'CLASSROOM'),
  ('LAB-A1', 'Phòng thực hành Giải phẫu 1', 30, 'Tầng 1, Tòa B', 'LAB'),
  ('LAB-A2', 'Phòng thực hành Giải phẫu 2', 30, 'Tầng 1, Tòa B', 'LAB'),
  ('SIM-01', 'Phòng mô phỏng Hồi sức 1', 20, 'Tầng 2, Tòa B', 'SIMULATION'),
  ('SIM-02', 'Phòng mô phỏng Sản khoa', 15, 'Tầng 2, Tòa B', 'SIMULATION'),
  ('SKILL-01', 'Phòng kỹ năng lâm sàng 1', 25, 'Tầng 3, Tòa B', 'SKILL_LAB'),
  ('SKILL-02', 'Phòng kỹ năng lâm sàng 2', 25, 'Tầng 3, Tòa B', 'SKILL_LAB'),
  ('US-301', 'Phòng siêu âm 301', 10, 'Tầng 3, Tòa C', 'LAB'),
  ('XRAY-101', 'Phòng X-quang thực hành', 8, 'Tầng 1, Tòa C', 'LAB');

-- ===========================================
-- Table: courses (Môn học)
-- ===========================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  description TEXT,
  credits INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department_id ON courses(department_id);

-- Sample data
INSERT INTO courses (code, name, credits, description) VALUES
  ('NOI101', 'Nội khoa cơ sở', 3, 'Môn học cơ bản về nội khoa'),
  ('NOI201', 'Nội khoa nâng cao', 4, 'Chuyên sâu các bệnh lý nội khoa'),
  ('NGOAI101', 'Ngoại khoa cơ sở', 3, 'Cơ bản về ngoại khoa tổng quát'),
  ('NGOAI201', 'Phẫu thuật thực hành', 4, 'Thực hành phẫu thuật cơ bản'),
  ('SAN101', 'Sản phụ khoa', 3, 'Sản khoa và phụ khoa cơ bản'),
  ('NHI101', 'Nhi khoa', 3, 'Bệnh lý trẻ em'),
  ('GMHS101', 'Hồi sức cấp cứu', 3, 'Kỹ năng hồi sức cấp cứu cơ bản'),
  ('GMHS201', 'Gây mê hồi sức nâng cao', 4, 'Gây mê và hồi sức chuyên sâu'),
  ('CDHA101', 'Chẩn đoán hình ảnh', 3, 'Siêu âm, X-quang, CT, MRI'),
  ('GPB101', 'Giải phẫu học', 4, 'Giải phẫu người cơ bản'),
  ('GPB201', 'Giải phẫu bệnh', 3, 'Giải phẫu bệnh lý'),
  ('KNLS101', 'Kỹ năng lâm sàng 1', 2, 'Kỹ năng khám bệnh cơ bản'),
  ('KNLS201', 'Kỹ năng lâm sàng 2', 2, 'Kỹ năng thủ thuật cơ bản');

-- ===========================================
-- Table: time_slots (Khung giờ học)
-- ===========================================
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_time_slots_code ON time_slots(code);

-- Sample data (Vietnam standard class periods)
INSERT INTO time_slots (code, label, start_time, end_time) VALUES
  ('S1', 'Sáng 1 (7h00 - 9h00)', '07:00', '09:00'),
  ('S2', 'Sáng 2 (9h15 - 11h15)', '09:15', '11:15'),
  ('C1', 'Chiều 1 (13h00 - 15h00)', '13:00', '15:00'),
  ('C2', 'Chiều 2 (15h15 - 17h15)', '15:15', '17:15'),
  ('T1', 'Tối 1 (18h00 - 20h00)', '18:00', '20:00'),
  ('T2', 'Tối 2 (20h15 - 22h00)', '20:15', '22:00');

-- ===========================================
-- Trigger: Auto update updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
