"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Monitor,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockDepartments, mockRooms } from "@/data/mock-master";
import {
  getEnrichedDevices,
  getLastMaintenanceDate,
} from "@/data/mock-devices";
import type { Device, DeviceFormData, DeviceStatus } from "@/types/devices";
import {
  DEVICE_STATUS_LABELS,
  DEVICE_STATUS_COLORS,
  DEVICE_CATEGORIES,
} from "@/types/devices";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(getEnrichedDevices());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<DeviceFormData>({
    code: "",
    name: "",
    category: "",
    serial_number: "",
    model: "",
    manufacturer: "",
    purchase_date: "",
    purchase_price: undefined,
    department_id: "",
    room_id: "",
    status: "AVAILABLE",
    notes: "",
  });

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || device.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" || device.department_id === filterDepartment;
    const matchesCategory =
      filterCategory === "all" || device.category === filterCategory;
    return (
      matchesSearch && matchesStatus && matchesDepartment && matchesCategory
    );
  });

  // Get unique categories from devices
  const categories = Array.from(
    new Set(devices.map((d) => d.category).filter(Boolean))
  );

  const handleOpenDialog = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({
        code: device.code,
        name: device.name,
        category: device.category || "",
        serial_number: device.serial_number || "",
        model: device.model || "",
        manufacturer: device.manufacturer || "",
        purchase_date: device.purchase_date || "",
        purchase_price: device.purchase_price || undefined,
        department_id: device.department_id || "",
        room_id: device.room_id || "",
        status: device.status,
        notes: device.notes || "",
      });
    } else {
      setEditingDevice(null);
      setFormData({
        code: "",
        name: "",
        category: "",
        serial_number: "",
        model: "",
        manufacturer: "",
        purchase_date: "",
        purchase_price: undefined,
        department_id: "",
        room_id: "",
        status: "AVAILABLE",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDevice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const department = formData.department_id
      ? mockDepartments.find((d) => d.id === formData.department_id)
      : null;
    const room = formData.room_id
      ? mockRooms.find((r) => r.id === formData.room_id)
      : null;

    if (editingDevice) {
      setDevices((prev) =>
        prev.map((device) =>
          device.id === editingDevice.id
            ? {
                ...device,
                ...formData,
                department_id: formData.department_id || null,
                department: department || null,
                room_id: formData.room_id || null,
                room: room || null,
                category: formData.category || null,
                serial_number: formData.serial_number || null,
                model: formData.model || null,
                manufacturer: formData.manufacturer || null,
                purchase_date: formData.purchase_date || null,
                purchase_price: formData.purchase_price || null,
                notes: formData.notes || null,
                updated_at: new Date().toISOString(),
              }
            : device
        )
      );
    } else {
      const newDevice: Device = {
        id: `dev-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        category: formData.category || null,
        serial_number: formData.serial_number || null,
        model: formData.model || null,
        manufacturer: formData.manufacturer || null,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price || null,
        department_id: formData.department_id || null,
        department: department || null,
        room_id: formData.room_id || null,
        room: room || null,
        status: formData.status,
        notes: formData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDevices((prev) => [...prev, newDevice]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa thiết bị này?")) {
      setDevices((prev) => prev.filter((device) => device.id !== id));
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Thiết bị</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách thiết bị y tế
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thiết bị
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thiết bị</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sẵn sàng</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter((d) => d.status === "AVAILABLE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang dùng</CardTitle>
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter((d) => d.status === "IN_USE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bảo trì</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {devices.filter((d) => d.status === "MAINTENANCE").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã, tên, serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {(Object.keys(DEVICE_STATUS_LABELS) as DeviceStatus[]).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {DEVICE_STATUS_LABELS[status]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Loại thiết bị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat!}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Bộ môn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bộ môn</SelectItem>
            {mockDepartments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thiết bị</CardTitle>
          <CardDescription>
            Hiển thị {filteredDevices.length} / {devices.length} thiết bị
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Mã</th>
                  <th className="h-10 px-4 text-left font-medium">Tên</th>
                  <th className="h-10 px-4 text-left font-medium">Loại</th>
                  <th className="h-10 px-4 text-left font-medium">Phòng</th>
                  <th className="h-10 px-4 text-left font-medium">Bộ môn</th>
                  <th className="h-10 px-4 text-center font-medium">
                    Trạng thái
                  </th>
                  <th className="h-10 px-4 text-left font-medium">
                    Bảo trì gần nhất
                  </th>
                  <th className="h-10 px-4 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map((device) => {
                    const lastMaintenance = getLastMaintenanceDate(device.id);
                    return (
                      <tr key={device.id} className="border-b hover:bg-muted/50">
                        <td className="h-12 px-4 font-medium">
                          <Link
                            href={`/dashboard/devices/${device.id}`}
                            className="text-primary hover:underline"
                          >
                            {device.code}
                          </Link>
                        </td>
                        <td className="h-12 px-4">{device.name}</td>
                        <td className="h-12 px-4">
                          {device.category ? (
                            <Badge variant="outline">{device.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="h-12 px-4 text-muted-foreground">
                          {device.room?.name || "-"}
                        </td>
                        <td className="h-12 px-4 text-muted-foreground">
                          {device.department?.name || "-"}
                        </td>
                        <td className="h-12 px-4 text-center">
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
                        </td>
                        <td className="h-12 px-4 text-muted-foreground">
                          {lastMaintenance
                            ? formatDate(lastMaintenance)
                            : "-"}
                        </td>
                        <td className="h-12 px-4 text-right">
                          <Link href={`/dashboard/devices/${device.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(device)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(device.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}
            </DialogTitle>
            <DialogDescription>
              {editingDevice
                ? "Cập nhật thông tin thiết bị"
                : "Nhập thông tin thiết bị mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã thiết bị *</Label>
                  <Input
                    id="code"
                    placeholder="VD: DV-ECG-001"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên thiết bị *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Máy điện tim 12 đạo trình"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 2: Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Loại thiết bị</Label>
                  <Select
                    value={formData.category || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {DEVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Trạng thái *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: DeviceStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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

              {/* Row 3: Serial & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="serial_number">Số Serial</Label>
                  <Input
                    id="serial_number"
                    placeholder="VD: ECG-2024-001"
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData({ ...formData, serial_number: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="VD: CardioMax 12"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 4: Manufacturer & Purchase Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">Hãng sản xuất</Label>
                  <Input
                    id="manufacturer"
                    placeholder="VD: Philips, GE Healthcare..."
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="purchase_date">Ngày mua</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) =>
                      setFormData({ ...formData, purchase_date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 5: Price & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="purchase_price">Giá mua (VND)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    placeholder="VD: 150000000"
                    value={formData.purchase_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchase_price: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Bộ môn quản lý</Label>
                  <Select
                    value={formData.department_id || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        department_id: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bộ môn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {mockDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 6: Room */}
              <div className="grid gap-2">
                <Label htmlFor="room">Phòng đặt thiết bị</Label>
                <Select
                  value={formData.room_id || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      room_id: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Kho / Chưa phân bổ --</SelectItem>
                    {mockRooms
                      .filter((r) => r.is_active)
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.code} - {room.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 7: Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  placeholder="Ghi chú thêm về thiết bị..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Hủy
              </Button>
              <Button type="submit">
                {editingDevice ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
