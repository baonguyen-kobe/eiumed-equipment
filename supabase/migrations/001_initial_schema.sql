-- =============================================
-- MVP1: Medical Equipment Management System
-- Initial Schema Migration
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES (using text with constraints)
-- =============================================

-- User roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'QTVT', 'GIANGVIEN');

-- Device status
CREATE TYPE device_status AS ENUM ('AVAILABLE', 'IN_USE', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED');

-- Device event types
CREATE TYPE device_event_type AS ENUM ('MAINTENANCE', 'REPAIR', 'NOTE', 'LOST', 'FOUND');

-- Borrow request status
CREATE TYPE borrow_request_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'IN_USE', 'COMPLETED', 'CANCELLED');

-- Handover type
CREATE TYPE handover_type AS ENUM ('ISSUE', 'RETURN');

-- =============================================
-- TABLES
-- =============================================

-- Users table (maps from auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'GIANGVIEN' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Device categories
CREATE TABLE device_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code_prefix TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Devices
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES device_categories(id) ON DELETE SET NULL,
    serial_number TEXT,
    model TEXT,
    vendor TEXT,
    purchase_date DATE,
    warranty_expiry DATE,
    current_room TEXT,
    status device_status DEFAULT 'AVAILABLE' NOT NULL,
    qr_code_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Device events (maintenance history, repairs, etc.)
CREATE TABLE device_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    event_type device_event_type NOT NULL,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    cost NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Time slots
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Borrow requests
CREATE TABLE borrow_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
    room TEXT,
    status borrow_request_status DEFAULT 'DRAFT' NOT NULL,
    purpose TEXT,
    note TEXT,
    qtvt_note TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Borrow request items
CREATE TABLE borrow_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrow_request_id UUID NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    quantity_requested INT DEFAULT 1 NOT NULL,
    quantity_approved INT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(borrow_request_id, device_id)
);

-- Device reservations (for conflict checking)
CREATE TABLE device_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    borrow_request_id UUID NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(device_id, date, time_slot_id)
);

-- Handover records
CREATE TABLE handover_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrow_request_id UUID NOT NULL REFERENCES borrow_requests(id) ON DELETE CASCADE,
    type handover_type NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Handover items
CREATE TABLE handover_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    handover_record_id UUID NOT NULL REFERENCES handover_records(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    condition_issue TEXT,
    condition_return TEXT,
    is_missing BOOLEAN DEFAULT FALSE,
    is_broken BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_devices_category ON devices(category_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_device_events_device ON device_events(device_id);
CREATE INDEX idx_device_events_date ON device_events(event_date);
CREATE INDEX idx_borrow_requests_created_by ON borrow_requests(created_by);
CREATE INDEX idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX idx_borrow_requests_date ON borrow_requests(requested_date);
CREATE INDEX idx_borrow_request_items_request ON borrow_request_items(borrow_request_id);
CREATE INDEX idx_device_reservations_device ON device_reservations(device_id);
CREATE INDEX idx_device_reservations_date ON device_reservations(date);
CREATE INDEX idx_handover_records_request ON handover_records(borrow_request_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_borrow_requests_updated_at
    BEFORE UPDATE ON borrow_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM users WHERE id = auth.uid();
    RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage users" ON users
    FOR ALL USING (get_user_role() = 'ADMIN');

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- Device categories policies
CREATE POLICY "Anyone can view categories" ON device_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/QTVT can manage categories" ON device_categories
    FOR ALL USING (get_user_role() IN ('ADMIN', 'QTVT'));

-- Devices policies
CREATE POLICY "Anyone can view devices" ON devices
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/QTVT can manage devices" ON devices
    FOR ALL USING (get_user_role() IN ('ADMIN', 'QTVT'));

-- Device events policies
CREATE POLICY "Anyone can view device events" ON device_events
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/QTVT can manage device events" ON device_events
    FOR ALL USING (get_user_role() IN ('ADMIN', 'QTVT'));

-- Time slots policies
CREATE POLICY "Anyone can view time slots" ON time_slots
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage time slots" ON time_slots
    FOR ALL USING (get_user_role() = 'ADMIN');

-- Borrow requests policies
CREATE POLICY "Users can view own borrow requests" ON borrow_requests
    FOR SELECT USING (
        auth.uid() = created_by OR 
        get_user_role() IN ('ADMIN', 'QTVT')
    );

CREATE POLICY "Users can create own borrow requests" ON borrow_requests
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own draft requests" ON borrow_requests
    FOR UPDATE USING (
        (auth.uid() = created_by AND status IN ('DRAFT', 'SUBMITTED')) OR
        get_user_role() IN ('ADMIN', 'QTVT')
    );

CREATE POLICY "Users can delete own draft requests" ON borrow_requests
    FOR DELETE USING (
        auth.uid() = created_by AND status = 'DRAFT'
    );

-- Borrow request items policies
CREATE POLICY "Users can view request items" ON borrow_request_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM borrow_requests br 
            WHERE br.id = borrow_request_id 
            AND (br.created_by = auth.uid() OR get_user_role() IN ('ADMIN', 'QTVT'))
        )
    );

CREATE POLICY "Users can manage own request items" ON borrow_request_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM borrow_requests br 
            WHERE br.id = borrow_request_id 
            AND (
                (br.created_by = auth.uid() AND br.status IN ('DRAFT', 'SUBMITTED')) OR
                get_user_role() IN ('ADMIN', 'QTVT')
            )
        )
    );

-- Device reservations policies
CREATE POLICY "Anyone can view reservations" ON device_reservations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/QTVT can manage reservations" ON device_reservations
    FOR ALL USING (get_user_role() IN ('ADMIN', 'QTVT'));

-- Handover records policies
CREATE POLICY "Users can view handover records" ON handover_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM borrow_requests br 
            WHERE br.id = borrow_request_id 
            AND (br.created_by = auth.uid() OR get_user_role() IN ('ADMIN', 'QTVT'))
        )
    );

CREATE POLICY "Admin/QTVT can manage handover records" ON handover_records
    FOR ALL USING (get_user_role() IN ('ADMIN', 'QTVT'));

-- Handover items policies
CREATE POLICY "Users can view handover items" ON handover_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM handover_records hr 
            JOIN borrow_requests br ON br.id = hr.borrow_request_id
            WHERE hr.id = handover_record_id 
            AND (br.created_by = auth.uid() OR get_user_role() IN ('ADMIN', 'QTVT'))
        )
    );

CREATE POLICY "Admin/QTVT can manage handover items" ON handover_items
    FOR ALL USING (get_user_role() IN ('ADMIN', 'QTVT'));

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default time slots
INSERT INTO time_slots (code, name, start_time, end_time) VALUES
    ('CA1', 'Ca 1 (Sáng sớm)', '07:00', '09:00'),
    ('CA2', 'Ca 2 (Sáng)', '09:00', '11:00'),
    ('CA3', 'Ca 3 (Trưa)', '13:00', '15:00'),
    ('CA4', 'Ca 4 (Chiều)', '15:00', '17:00'),
    ('CA5', 'Ca 5 (Tối)', '17:00', '19:00');

-- Insert sample device categories
INSERT INTO device_categories (name, code_prefix, description) VALUES
    ('Máy chiếu', 'MC', 'Máy chiếu các loại'),
    ('Laptop', 'LT', 'Máy tính xách tay'),
    ('Micro', 'MIC', 'Micro và thiết bị âm thanh'),
    ('Camera', 'CAM', 'Camera và thiết bị ghi hình'),
    ('Thiết bị y tế', 'YT', 'Các thiết bị y tế dùng trong giảng dạy');
