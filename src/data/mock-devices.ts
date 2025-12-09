// Mock data for devices module
import type { Device, DeviceLog, DeviceStatus, DeviceLogType } from "@/types/devices";
import { mockDepartments, mockRooms } from "./mock-master";

// Helper to get room/department by ID
const getRoomById = (id: string | null) =>
  id ? mockRooms.find((r) => r.id === id) : null;
const getDeptById = (id: string | null) =>
  id ? mockDepartments.find((d) => d.id === id) : null;

export const mockDevices: Device[] = [
  {
    id: "dev-1",
    code: "DV-ECG-001",
    name: "Máy điện tim 12 đạo trình",
    category: "ECG",
    serial_number: "ECG-2024-001",
    model: "CardioMax 12",
    manufacturer: "Philips",
    purchase_date: "2023-06-15",
    purchase_price: 150000000,
    department_id: "dept-5",
    room_id: "room-4",
    status: "AVAILABLE",
    notes: "Thiết bị mới, bảo hành 2 năm",
    created_at: "2023-06-15T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-2",
    code: "DV-ECG-002",
    name: "Máy điện tim 6 đạo trình",
    category: "ECG",
    serial_number: "ECG-2024-002",
    model: "CardioLite 6",
    manufacturer: "GE Healthcare",
    purchase_date: "2022-03-20",
    purchase_price: 85000000,
    department_id: "dept-5",
    room_id: null,
    status: "AVAILABLE",
    notes: null,
    created_at: "2022-03-20T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-3",
    code: "DV-MON-001",
    name: "Monitor theo dõi bệnh nhân",
    category: "Monitor",
    serial_number: "MON-2024-001",
    model: "IntelliVue MX500",
    manufacturer: "Philips",
    purchase_date: "2023-09-01",
    purchase_price: 280000000,
    department_id: "dept-5",
    room_id: "room-4",
    status: "IN_USE",
    notes: "Đang sử dụng tại phòng SIM-01",
    created_at: "2023-09-01T00:00:00Z",
    updated_at: "2024-06-10T00:00:00Z",
  },
  {
    id: "dev-4",
    code: "DV-MON-002",
    name: "Monitor theo dõi bệnh nhân",
    category: "Monitor",
    serial_number: "MON-2024-002",
    model: "IntelliVue MX500",
    manufacturer: "Philips",
    purchase_date: "2023-09-01",
    purchase_price: 280000000,
    department_id: "dept-5",
    room_id: null,
    status: "AVAILABLE",
    notes: null,
    created_at: "2023-09-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-5",
    code: "DV-DEF-001",
    name: "Máy sốc điện",
    category: "Defibrillator",
    serial_number: "DEF-2024-001",
    model: "HeartStart XL+",
    manufacturer: "Philips",
    purchase_date: "2022-11-10",
    purchase_price: 95000000,
    department_id: "dept-5",
    room_id: "room-4",
    status: "AVAILABLE",
    notes: "Bao gồm 2 bộ paddle",
    created_at: "2022-11-10T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-6",
    code: "DV-VEN-001",
    name: "Máy thở xâm nhập",
    category: "Ventilator",
    serial_number: "VEN-2024-001",
    model: "PB840",
    manufacturer: "Medtronic",
    purchase_date: "2023-01-25",
    purchase_price: 450000000,
    department_id: "dept-5",
    room_id: null,
    status: "MAINTENANCE",
    notes: "Đang bảo trì định kỳ",
    created_at: "2023-01-25T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
  },
  {
    id: "dev-7",
    code: "DV-US-001",
    name: "Máy siêu âm di động",
    category: "Ultrasound",
    serial_number: "US-2024-001",
    model: "Lumify",
    manufacturer: "Philips",
    purchase_date: "2024-01-10",
    purchase_price: 180000000,
    department_id: "dept-6",
    room_id: "room-7",
    status: "AVAILABLE",
    notes: "Hỗ trợ kết nối tablet",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "dev-8",
    code: "DV-US-002",
    name: "Máy siêu âm tổng quát",
    category: "Ultrasound",
    serial_number: "US-2024-002",
    model: "EPIQ 7",
    manufacturer: "Philips",
    purchase_date: "2022-08-30",
    purchase_price: 850000000,
    department_id: "dept-6",
    room_id: "room-7",
    status: "IN_USE",
    notes: "Đang sử dụng tại phòng US-301",
    created_at: "2022-08-30T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "dev-9",
    code: "DV-INF-001",
    name: "Bơm tiêm điện",
    category: "Infusion Pump",
    serial_number: "INF-2024-001",
    model: "Alaris PC",
    manufacturer: "BD",
    purchase_date: "2023-07-22",
    purchase_price: 45000000,
    department_id: null,
    room_id: "room-6",
    status: "AVAILABLE",
    notes: null,
    created_at: "2023-07-22T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-10",
    code: "DV-INF-003",
    name: "Bơm tiêm điện",
    category: "Infusion Pump",
    serial_number: "INF-2024-003",
    model: "Alaris PC",
    manufacturer: "BD",
    purchase_date: "2023-07-22",
    purchase_price: 45000000,
    department_id: null,
    room_id: null,
    status: "RETIRED",
    notes: "Hỏng bo mạch, đã thanh lý",
    created_at: "2023-07-22T00:00:00Z",
    updated_at: "2024-05-20T00:00:00Z",
  },
  {
    id: "dev-11",
    code: "DV-MAN-001",
    name: "Manikin hồi sức cấp cứu",
    category: "Manikin",
    serial_number: "MAN-2024-001",
    model: "Resusci Anne QCPR",
    manufacturer: "Laerdal",
    purchase_date: "2023-03-15",
    purchase_price: 120000000,
    department_id: "dept-5",
    room_id: "room-4",
    status: "AVAILABLE",
    notes: "Kết nối app feedback",
    created_at: "2023-03-15T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-12",
    code: "DV-MAN-002",
    name: "Manikin sản khoa",
    category: "Manikin",
    serial_number: "MAN-2024-002",
    model: "MamaNatalie",
    manufacturer: "Laerdal",
    purchase_date: "2022-12-01",
    purchase_price: 85000000,
    department_id: "dept-3",
    room_id: "room-5",
    status: "AVAILABLE",
    notes: null,
    created_at: "2022-12-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "dev-13",
    code: "DV-MAN-003",
    name: "Manikin tiêm truyền",
    category: "Manikin",
    serial_number: "MAN-2024-003",
    model: "IV Arm",
    manufacturer: "Laerdal",
    purchase_date: "2023-06-20",
    purchase_price: 35000000,
    department_id: null,
    room_id: "room-6",
    status: "IN_USE",
    notes: "Đang dùng tại phòng SKILL-01",
    created_at: "2023-06-20T00:00:00Z",
    updated_at: "2024-06-15T00:00:00Z",
  },
];

export const mockDeviceLogs: DeviceLog[] = [
  {
    id: "log-1",
    device_id: "dev-1",
    log_type: "INVENTORY",
    description: "Kiểm kê đầu năm 2024 - Tình trạng tốt",
    from_room_id: null,
    to_room_id: null,
    from_status: null,
    to_status: null,
    performed_at: "2024-01-05T09:00:00Z",
    performed_by: "admin@truongy.edu.vn",
    attachment_urls: null,
    created_at: "2024-01-05T09:00:00Z",
  },
  {
    id: "log-2",
    device_id: "dev-3",
    log_type: "STATE_CHANGE",
    description: "Đưa vào sử dụng cho buổi thực hành Hồi sức",
    from_room_id: null,
    to_room_id: null,
    from_status: "AVAILABLE",
    to_status: "IN_USE",
    performed_at: "2024-06-10T08:30:00Z",
    performed_by: "qtvt@truongy.edu.vn",
    attachment_urls: null,
    created_at: "2024-06-10T08:30:00Z",
  },
  {
    id: "log-3",
    device_id: "dev-6",
    log_type: "MAINTENANCE",
    description: "Bảo trì định kỳ 6 tháng - thay filter, kiểm tra sensor",
    from_room_id: null,
    to_room_id: null,
    from_status: "AVAILABLE",
    to_status: "MAINTENANCE",
    performed_at: "2024-07-01T10:00:00Z",
    performed_by: "qtvt@truongy.edu.vn",
    attachment_urls: null,
    created_at: "2024-07-01T10:00:00Z",
  },
  {
    id: "log-4",
    device_id: "dev-10",
    log_type: "REPAIR",
    description: "Sửa chữa bo mạch điều khiển - không khắc phục được",
    from_room_id: null,
    to_room_id: null,
    from_status: "MAINTENANCE",
    to_status: "RETIRED",
    performed_at: "2024-05-20T14:00:00Z",
    performed_by: "kythuat@truongy.edu.vn",
    attachment_urls: null,
    created_at: "2024-05-20T14:00:00Z",
  },
  {
    id: "log-5",
    device_id: "dev-13",
    log_type: "TRANSFER",
    description: "Điều chuyển từ kho sang phòng thực hành",
    from_room_id: null,
    to_room_id: "room-6",
    from_status: null,
    to_status: null,
    performed_at: "2024-06-15T09:00:00Z",
    performed_by: "qtvt@truongy.edu.vn",
    attachment_urls: null,
    created_at: "2024-06-15T09:00:00Z",
  },
  {
    id: "log-6",
    device_id: "dev-1",
    log_type: "MAINTENANCE",
    description: "Bảo trì định kỳ - Kiểm tra điện cực, calibrate",
    from_room_id: null,
    to_room_id: null,
    from_status: "AVAILABLE",
    to_status: "AVAILABLE",
    performed_at: "2024-03-15T10:00:00Z",
    performed_by: "kythuat@truongy.edu.vn",
    attachment_urls: null,
    created_at: "2024-03-15T10:00:00Z",
  },
];

// Enrich devices with department and room data
export const getEnrichedDevices = (): Device[] => {
  return mockDevices.map((device) => ({
    ...device,
    department: getDeptById(device.department_id) || null,
    room: getRoomById(device.room_id) || null,
  }));
};

// Get device by ID with enriched data
export const getDeviceById = (id: string): Device | undefined => {
  const device = mockDevices.find((d) => d.id === id);
  if (!device) return undefined;
  return {
    ...device,
    department: getDeptById(device.department_id) || null,
    room: getRoomById(device.room_id) || null,
  };
};

// Get logs for a specific device with enriched room data
export const getDeviceLogsById = (deviceId: string): DeviceLog[] => {
  return mockDeviceLogs
    .filter((log) => log.device_id === deviceId)
    .map((log) => ({
      ...log,
      from_room: getRoomById(log.from_room_id) || null,
      to_room: getRoomById(log.to_room_id) || null,
    }))
    .sort(
      (a, b) =>
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
};

// Get latest maintenance date for a device
export const getLastMaintenanceDate = (deviceId: string): string | null => {
  const maintenanceLogs = mockDeviceLogs
    .filter(
      (log) =>
        log.device_id === deviceId &&
        (log.log_type === "MAINTENANCE" || log.log_type === "REPAIR")
    )
    .sort(
      (a, b) =>
        new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    );
  return maintenanceLogs.length > 0 ? maintenanceLogs[0].performed_at : null;
};
