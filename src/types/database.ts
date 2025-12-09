// Database types - auto-generated from Supabase schema

export type UserRole = 'ADMIN' | 'QTVT' | 'GIANGVIEN';

export type DeviceStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED';

export type DeviceEventType = 'MAINTENANCE' | 'REPAIR' | 'NOTE' | 'LOST' | 'FOUND';

export type BorrowRequestStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'IN_USE' | 'COMPLETED' | 'CANCELLED';

export type HandoverType = 'ISSUE' | 'RETURN';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface DeviceCategory {
  id: string;
  name: string;
  code_prefix: string;
  description: string | null;
  created_at: string;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  category_id: string | null;
  serial_number: string | null;
  model: string | null;
  vendor: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  current_room: string | null;
  status: DeviceStatus;
  qr_code_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: DeviceCategory;
}

export interface DeviceEvent {
  id: string;
  device_id: string;
  event_type: DeviceEventType;
  event_date: string;
  performed_by: string | null;
  notes: string | null;
  cost: number | null;
  created_at: string;
  // Joined fields
  performer?: User;
}

export interface TimeSlot {
  id: string;
  code: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BorrowRequest {
  id: string;
  created_by: string;
  requested_date: string;
  time_slot_id: string;
  room: string | null;
  status: BorrowRequestStatus;
  purpose: string | null;
  note: string | null;
  qtvt_note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator?: User;
  approver?: User;
  time_slot?: TimeSlot;
  items?: BorrowRequestItem[];
}

export interface BorrowRequestItem {
  id: string;
  borrow_request_id: string;
  device_id: string;
  quantity_requested: number;
  quantity_approved: number | null;
  created_at: string;
  // Joined fields
  device?: Device;
}

export interface DeviceReservation {
  id: string;
  device_id: string;
  borrow_request_id: string;
  date: string;
  time_slot_id: string;
  created_at: string;
  // Joined fields
  device?: Device;
  borrow_request?: BorrowRequest;
  time_slot?: TimeSlot;
}

export interface HandoverRecord {
  id: string;
  borrow_request_id: string;
  type: HandoverType;
  performed_by: string;
  performed_at: string;
  note: string | null;
  created_at: string;
  // Joined fields
  performer?: User;
  borrow_request?: BorrowRequest;
  items?: HandoverItem[];
}

export interface HandoverItem {
  id: string;
  handover_record_id: string;
  device_id: string;
  condition_issue: string | null;
  condition_return: string | null;
  is_missing: boolean;
  is_broken: boolean;
  notes: string | null;
  created_at: string;
  // Joined fields
  device?: Device;
}

// Form types
export interface CreateDeviceInput {
  code: string;
  name: string;
  category_id?: string;
  serial_number?: string;
  model?: string;
  vendor?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  current_room?: string;
  notes?: string;
}

export interface UpdateDeviceInput extends Partial<CreateDeviceInput> {
  status?: DeviceStatus;
}

export interface CreateBorrowRequestInput {
  requested_date: string;
  time_slot_id: string;
  room?: string;
  purpose?: string;
  note?: string;
  device_ids: string[];
}

export interface CreateDeviceEventInput {
  device_id: string;
  event_type: DeviceEventType;
  event_date: string;
  notes?: string;
  cost?: number;
}

export interface HandoverItemInput {
  device_id: string;
  condition?: string;
  is_missing?: boolean;
  is_broken?: boolean;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApproveRequestResult {
  success: boolean;
  error?: string;
  conflicts?: Array<{
    device_id: string;
    device_name: string;
    device_code: string;
    conflicting_borrower: string;
  }>;
}

// Database types for Supabase client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      device_categories: {
        Row: DeviceCategory;
        Insert: Omit<DeviceCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<DeviceCategory, 'id' | 'created_at'>>;
      };
      devices: {
        Row: Device;
        Insert: Omit<Device, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: DeviceStatus };
        Update: Partial<Omit<Device, 'id' | 'created_at' | 'updated_at'>>;
      };
      device_events: {
        Row: DeviceEvent;
        Insert: Omit<DeviceEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<DeviceEvent, 'id' | 'created_at'>>;
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Omit<TimeSlot, 'id' | 'created_at'>;
        Update: Partial<Omit<TimeSlot, 'id' | 'created_at'>>;
      };
      borrow_requests: {
        Row: BorrowRequest;
        Insert: Omit<BorrowRequest, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: BorrowRequestStatus };
        Update: Partial<Omit<BorrowRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
      borrow_request_items: {
        Row: BorrowRequestItem;
        Insert: Omit<BorrowRequestItem, 'id' | 'created_at'>;
        Update: Partial<Omit<BorrowRequestItem, 'id' | 'created_at'>>;
      };
      device_reservations: {
        Row: DeviceReservation;
        Insert: Omit<DeviceReservation, 'id' | 'created_at'>;
        Update: Partial<Omit<DeviceReservation, 'id' | 'created_at'>>;
      };
      handover_records: {
        Row: HandoverRecord;
        Insert: Omit<HandoverRecord, 'id' | 'created_at' | 'performed_at'>;
        Update: Partial<Omit<HandoverRecord, 'id' | 'created_at'>>;
      };
      handover_items: {
        Row: HandoverItem;
        Insert: Omit<HandoverItem, 'id' | 'created_at'>;
        Update: Partial<Omit<HandoverItem, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      check_device_availability: {
        Args: {
          p_device_id: string;
          p_date: string;
          p_time_slot_id: string;
          p_exclude_request_id?: string;
        };
        Returns: boolean;
      };
      approve_borrow_request: {
        Args: {
          p_request_id: string;
          p_qtvt_note?: string;
        };
        Returns: ApproveRequestResult;
      };
      reject_borrow_request: {
        Args: {
          p_request_id: string;
          p_qtvt_note?: string;
        };
        Returns: ApproveRequestResult;
      };
      issue_devices: {
        Args: {
          p_request_id: string;
          p_items: HandoverItemInput[];
          p_note?: string;
        };
        Returns: { success: boolean; error?: string; handover_id?: string };
      };
      return_devices: {
        Args: {
          p_request_id: string;
          p_items: HandoverItemInput[];
          p_note?: string;
        };
        Returns: { success: boolean; error?: string; handover_id?: string };
      };
    };
  };
}
