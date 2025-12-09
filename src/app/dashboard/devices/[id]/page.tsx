"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Calendar,
  MapPin,
  Building2,
  Tag,
  Hash,
  Factory,
  Banknote,
  FileText,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeviceQrCard } from "@/components/devices/device-qr-card";
import { mockRooms } from "@/data/mock-master";
import { getDeviceById, getDeviceLogsById, mockDeviceLogs } from "@/data/mock-devices";
import type { Device, DeviceLog, DeviceLogFormData, DeviceLogType, DeviceStatus } from "@/types/devices";
import {
  DEVICE_STATUS_LABELS,
  DEVICE_STATUS_COLORS,
  DEVICE_LOG_TYPE_LABELS,
} from "@/types/devices";

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [logFormData, setLogFormData] = useState<DeviceLogFormData>({
    log_type: "MAINTENANCE",
    description: "",
    from_room_id: "",
    to_room_id: "",
    from_status: undefined,
    to_status: undefined,
    performed_at: new Date().toISOString().slice(0, 16),
    performed_by: "demo@truongy.edu.vn",
  });

  useEffect(() => {
    const deviceData = getDeviceById(deviceId);
    if (deviceData) {
      setDevice(deviceData);
      setLogs(getDeviceLogsById(deviceId));
    }
  }, [deviceId]);

  if (!device) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Không tìm thấy thiết bị</p>
      </div>
    );
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN");
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: DeviceLog = {
      id: `log-${Date.now()}`,
      device_id: deviceId,
      log_type: logFormData.log_type,
      description: logFormData.description || null,
      from_room_id: logFormData.from_room_id || null,
      from_room: logFormData.from_room_id
        ? mockRooms.find((r) => r.id === logFormData.from_room_id) || null
        : null,
      to_room_id: logFormData.to_room_id || null,
      to_room: logFormData.to_room_id
        ? mockRooms.find((r) => r.id === logFormData.to_room_id) || null
        : null,
      from_status: logFormData.from_status || null,
      to_status: logFormData.to_status || null,
      performed_at: logFormData.performed_at || new Date().toISOString(),
      performed_by: logFormData.performed_by || null,
      attachment_urls: null,
      created_at: new Date().toISOString(),
    };

    setLogs((prev) => [newLog, ...prev]);

    // Also add to mock data for persistence during session
    mockDeviceLogs.push(newLog);

    // Update device status if changed
    if (logFormData.to_status && logFormData.to_status !== device.status) {
      setDevice((prev) =>
        prev ? { ...prev, status: logFormData.to_status as DeviceStatus } : null
      );
    }

    // Update device room if transferred
    if (logFormData.log_type === "TRANSFER" && logFormData.to_room_id) {
      const newRoom = mockRooms.find((r) => r.id === logFormData.to_room_id);
      setDevice((prev) =>
        prev
          ? { ...prev, room_id: logFormData.to_room_id || null, room: newRoom || null }
          : null
      );
    }

    setIsLogDialogOpen(false);
    setLogFormData({
      log_type: "MAINTENANCE",
      description: "",
      from_room_id: "",
      to_room_id: "",
      from_status: undefined,
      to_status: undefined,
      performed_at: new Date().toISOString().slice(0, 16),
      performed_by: "demo@truongy.edu.vn",
    });
  };

  const getLogTypeColor = (logType: DeviceLogType) => {
    const colors: Record<DeviceLogType, string> = {
      MAINTENANCE: "bg-blue-100 text-blue-800",
      REPAIR: "bg-red-100 text-red-800",
      TRANSFER: "bg-purple-100 text-purple-800",
      INVENTORY: "bg-green-100 text-green-800",
      STATE_CHANGE: "bg-yellow-100 text-yellow-800",
    };
    return colors[logType];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/devices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{device.code}</h2>
              <Badge
                variant={
                  DEVICE_STATUS_COLORS[device.status] as
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                    | "success"
                    | "warning"
                }
              >
                {DEVICE_STATUS_LABELS[device.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{device.name}</p>
          </div>
        </div>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Device Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thiết bị</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Loại thiết bị</p>
                    <p className="font-medium">{device.category || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số Serial</p>
                    <p className="font-medium">{device.serial_number || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{device.model || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Factory className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hãng sản xuất</p>
                    <p className="font-medium">{device.manufacturer || "-"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày mua</p>
                    <p className="font-medium">{formatDate(device.purchase_date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Banknote className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Giá mua</p>
                    <p className="font-medium">
                      {formatCurrency(device.purchase_price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phòng</p>
                    <p className="font-medium">
                      {device.room ? `${device.room.code} - ${device.room.name}` : "Kho"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bộ môn quản lý</p>
                    <p className="font-medium">{device.department?.name || "-"}</p>
                  </div>
                </div>
              </div>

              {device.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                    <p className="text-sm">{device.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* History Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Lịch sử hoạt động
                </CardTitle>
                <CardDescription>
                  {logs.length} sự kiện được ghi nhận
                </CardDescription>
              </div>
              <Button onClick={() => setIsLogDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm log
              </Button>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có lịch sử hoạt động
                </p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-4 p-4 rounded-lg border bg-muted/30"
                    >
                      <div
                        className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${getLogTypeColor(
                          log.log_type
                        )}`}
                      >
                        {DEVICE_LOG_TYPE_LABELS[log.log_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{log.description || "Không có mô tả"}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span>{formatDateTime(log.performed_at)}</span>
                          {log.performed_by && <span>bởi {log.performed_by}</span>}
                          {log.from_status && log.to_status && (
                            <span>
                              {DEVICE_STATUS_LABELS[log.from_status]} →{" "}
                              {DEVICE_STATUS_LABELS[log.to_status]}
                            </span>
                          )}
                          {log.from_room && log.to_room && (
                            <span>
                              {log.from_room.code} → {log.to_room.code}
                            </span>
                          )}
                          {!log.from_room && log.to_room && (
                            <span>→ {log.to_room.code}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - QR Code */}
        <div className="space-y-6">
          <DeviceQrCard
            deviceId={device.id}
            code={device.code}
            name={device.name}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng sự kiện</span>
                <span className="font-medium">{logs.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bảo trì</span>
                <span className="font-medium">
                  {logs.filter((l) => l.log_type === "MAINTENANCE").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sửa chữa</span>
                <span className="font-medium">
                  {logs.filter((l) => l.log_type === "REPAIR").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Điều chuyển</span>
                <span className="font-medium">
                  {logs.filter((l) => l.log_type === "TRANSFER").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Log Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm lịch sử hoạt động</DialogTitle>
            <DialogDescription>
              Ghi nhận sự kiện mới cho thiết bị {device.code}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLog}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="log_type">Loại sự kiện *</Label>
                <Select
                  value={logFormData.log_type}
                  onValueChange={(value: DeviceLogType) =>
                    setLogFormData({ ...logFormData, log_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DEVICE_LOG_TYPE_LABELS) as DeviceLogType[]).map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {DEVICE_LOG_TYPE_LABELS[type]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết sự kiện..."
                  value={logFormData.description}
                  onChange={(e) =>
                    setLogFormData({ ...logFormData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {logFormData.log_type === "TRANSFER" && (
                <>
                  <div className="grid gap-2">
                    <Label>Từ phòng</Label>
                    <Select
                      value={logFormData.from_room_id || "none"}
                      onValueChange={(value) =>
                        setLogFormData({
                          ...logFormData,
                          from_room_id: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Kho --</SelectItem>
                        {mockRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.code} - {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Đến phòng</Label>
                    <Select
                      value={logFormData.to_room_id || "none"}
                      onValueChange={(value) =>
                        setLogFormData({
                          ...logFormData,
                          to_room_id: value === "none" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Kho --</SelectItem>
                        {mockRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.code} - {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {(logFormData.log_type === "STATE_CHANGE" ||
                logFormData.log_type === "MAINTENANCE" ||
                logFormData.log_type === "REPAIR") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Từ trạng thái</Label>
                    <Select
                      value={logFormData.from_status || "none"}
                      onValueChange={(value) =>
                        setLogFormData({
                          ...logFormData,
                          from_status:
                            value === "none" ? undefined : (value as DeviceStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Không đổi --</SelectItem>
                        {(Object.keys(DEVICE_STATUS_LABELS) as DeviceStatus[]).map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {DEVICE_STATUS_LABELS[status]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Sang trạng thái</Label>
                    <Select
                      value={logFormData.to_status || "none"}
                      onValueChange={(value) =>
                        setLogFormData({
                          ...logFormData,
                          to_status:
                            value === "none" ? undefined : (value as DeviceStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Không đổi --</SelectItem>
                        {(Object.keys(DEVICE_STATUS_LABELS) as DeviceStatus[]).map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {DEVICE_STATUS_LABELS[status]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="performed_at">Thời gian thực hiện</Label>
                <Input
                  id="performed_at"
                  type="datetime-local"
                  value={logFormData.performed_at}
                  onChange={(e) =>
                    setLogFormData({ ...logFormData, performed_at: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="performed_by">Người thực hiện</Label>
                <Input
                  id="performed_by"
                  placeholder="Email hoặc tên"
                  value={logFormData.performed_by}
                  onChange={(e) =>
                    setLogFormData({ ...logFormData, performed_by: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
