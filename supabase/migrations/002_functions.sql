-- =============================================
-- Function to handle new user creation
-- This should be called via a database trigger on auth.users
-- =============================================

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'GIANGVIEN'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to check device availability for a given date and time slot
CREATE OR REPLACE FUNCTION check_device_availability(
    p_device_id UUID,
    p_date DATE,
    p_time_slot_id UUID,
    p_exclude_request_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM device_reservations dr
        JOIN borrow_requests br ON br.id = dr.borrow_request_id
        WHERE dr.device_id = p_device_id
        AND dr.date = p_date
        AND dr.time_slot_id = p_time_slot_id
        AND br.status IN ('APPROVED', 'IN_USE')
        AND (p_exclude_request_id IS NULL OR dr.borrow_request_id != p_exclude_request_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve borrow request with conflict checking
CREATE OR REPLACE FUNCTION approve_borrow_request(
    p_request_id UUID,
    p_qtvt_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_request RECORD;
    v_item RECORD;
    v_conflicts JSON[];
    v_conflict RECORD;
BEGIN
    -- Get the request
    SELECT * INTO v_request FROM borrow_requests WHERE id = p_request_id;
    
    IF v_request IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Phiếu mượn không tồn tại');
    END IF;
    
    IF v_request.status != 'SUBMITTED' THEN
        RETURN json_build_object('success', false, 'error', 'Chỉ có thể duyệt phiếu ở trạng thái SUBMITTED');
    END IF;
    
    -- Check for conflicts
    v_conflicts := ARRAY[]::JSON[];
    
    FOR v_item IN 
        SELECT bri.*, d.name as device_name, d.code as device_code
        FROM borrow_request_items bri
        JOIN devices d ON d.id = bri.device_id
        WHERE bri.borrow_request_id = p_request_id
    LOOP
        IF NOT check_device_availability(v_item.device_id, v_request.requested_date, v_request.time_slot_id) THEN
            -- Find the conflicting request
            SELECT br.id, u.full_name as borrower_name
            INTO v_conflict
            FROM device_reservations dr
            JOIN borrow_requests br ON br.id = dr.borrow_request_id
            JOIN users u ON u.id = br.created_by
            WHERE dr.device_id = v_item.device_id
            AND dr.date = v_request.requested_date
            AND dr.time_slot_id = v_request.time_slot_id
            AND br.status IN ('APPROVED', 'IN_USE')
            LIMIT 1;
            
            v_conflicts := array_append(v_conflicts, json_build_object(
                'device_id', v_item.device_id,
                'device_name', v_item.device_name,
                'device_code', v_item.device_code,
                'conflicting_borrower', v_conflict.borrower_name
            ));
        END IF;
    END LOOP;
    
    IF array_length(v_conflicts, 1) > 0 THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Một số thiết bị đã được mượn trong thời gian này',
            'conflicts', v_conflicts
        );
    END IF;
    
    -- Create reservations
    INSERT INTO device_reservations (device_id, borrow_request_id, date, time_slot_id)
    SELECT 
        bri.device_id, 
        p_request_id, 
        v_request.requested_date, 
        v_request.time_slot_id
    FROM borrow_request_items bri
    WHERE bri.borrow_request_id = p_request_id;
    
    -- Update request status
    UPDATE borrow_requests
    SET 
        status = 'APPROVED',
        qtvt_note = p_qtvt_note,
        approved_by = auth.uid(),
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Update quantity_approved
    UPDATE borrow_request_items
    SET quantity_approved = quantity_requested
    WHERE borrow_request_id = p_request_id;
    
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject borrow request
CREATE OR REPLACE FUNCTION reject_borrow_request(
    p_request_id UUID,
    p_qtvt_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_request RECORD;
BEGIN
    SELECT * INTO v_request FROM borrow_requests WHERE id = p_request_id;
    
    IF v_request IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Phiếu mượn không tồn tại');
    END IF;
    
    IF v_request.status != 'SUBMITTED' THEN
        RETURN json_build_object('success', false, 'error', 'Chỉ có thể từ chối phiếu ở trạng thái SUBMITTED');
    END IF;
    
    UPDATE borrow_requests
    SET 
        status = 'REJECTED',
        qtvt_note = p_qtvt_note,
        approved_by = auth.uid(),
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to issue devices (GIAO)
CREATE OR REPLACE FUNCTION issue_devices(
    p_request_id UUID,
    p_items JSON[],
    p_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_request RECORD;
    v_handover_id UUID;
    v_item JSON;
BEGIN
    SELECT * INTO v_request FROM borrow_requests WHERE id = p_request_id;
    
    IF v_request IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Phiếu mượn không tồn tại');
    END IF;
    
    IF v_request.status != 'APPROVED' THEN
        RETURN json_build_object('success', false, 'error', 'Chỉ có thể giao thiết bị cho phiếu đã được duyệt');
    END IF;
    
    -- Create handover record
    INSERT INTO handover_records (borrow_request_id, type, performed_by, note)
    VALUES (p_request_id, 'ISSUE', auth.uid(), p_note)
    RETURNING id INTO v_handover_id;
    
    -- Create handover items and update device status
    FOREACH v_item IN ARRAY p_items
    LOOP
        INSERT INTO handover_items (handover_record_id, device_id, condition_issue, notes)
        VALUES (
            v_handover_id, 
            (v_item->>'device_id')::UUID, 
            v_item->>'condition',
            v_item->>'notes'
        );
        
        UPDATE devices
        SET status = 'IN_USE', updated_at = NOW()
        WHERE id = (v_item->>'device_id')::UUID;
    END LOOP;
    
    -- Update request status
    UPDATE borrow_requests
    SET status = 'IN_USE', updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN json_build_object('success', true, 'handover_id', v_handover_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to return devices (NHẬN TRẢ)
CREATE OR REPLACE FUNCTION return_devices(
    p_request_id UUID,
    p_items JSON[],
    p_note TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_request RECORD;
    v_handover_id UUID;
    v_item JSON;
    v_device_status device_status;
BEGIN
    SELECT * INTO v_request FROM borrow_requests WHERE id = p_request_id;
    
    IF v_request IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Phiếu mượn không tồn tại');
    END IF;
    
    IF v_request.status != 'IN_USE' THEN
        RETURN json_build_object('success', false, 'error', 'Chỉ có thể nhận trả cho phiếu đang mượn');
    END IF;
    
    -- Create handover record
    INSERT INTO handover_records (borrow_request_id, type, performed_by, note)
    VALUES (p_request_id, 'RETURN', auth.uid(), p_note)
    RETURNING id INTO v_handover_id;
    
    -- Create handover items and update device status
    FOREACH v_item IN ARRAY p_items
    LOOP
        INSERT INTO handover_items (
            handover_record_id, 
            device_id, 
            condition_return, 
            is_missing, 
            is_broken,
            notes
        )
        VALUES (
            v_handover_id, 
            (v_item->>'device_id')::UUID, 
            v_item->>'condition',
            COALESCE((v_item->>'is_missing')::BOOLEAN, false),
            COALESCE((v_item->>'is_broken')::BOOLEAN, false),
            v_item->>'notes'
        );
        
        -- Determine new device status
        IF (v_item->>'is_missing')::BOOLEAN = true THEN
            v_device_status := 'LOST';
            -- Create device event
            INSERT INTO device_events (device_id, event_type, performed_by, notes)
            VALUES ((v_item->>'device_id')::UUID, 'LOST', auth.uid(), 'Thiết bị bị mất khi trả');
        ELSIF (v_item->>'is_broken')::BOOLEAN = true THEN
            v_device_status := 'UNDER_MAINTENANCE';
            -- Create device event
            INSERT INTO device_events (device_id, event_type, performed_by, notes)
            VALUES ((v_item->>'device_id')::UUID, 'MAINTENANCE', auth.uid(), 'Thiết bị bị hỏng khi trả, cần bảo trì');
        ELSE
            v_device_status := 'AVAILABLE';
        END IF;
        
        UPDATE devices
        SET status = v_device_status, updated_at = NOW()
        WHERE id = (v_item->>'device_id')::UUID;
    END LOOP;
    
    -- Update request status
    UPDATE borrow_requests
    SET status = 'COMPLETED', updated_at = NOW()
    WHERE id = p_request_id;
    
    -- Delete reservations
    DELETE FROM device_reservations WHERE borrow_request_id = p_request_id;
    
    RETURN json_build_object('success', true, 'handover_id', v_handover_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
