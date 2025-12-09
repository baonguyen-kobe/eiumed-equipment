"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  mockDepartments,
  getEnrichedRooms,
} from "@/data/mock-master";
import type { Room, RoomFormData, RoomType } from "@/types/master";
import { ROOM_TYPE_LABELS } from "@/types/master";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(getEnrichedRooms());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    code: "",
    name: "",
    department_id: "",
    capacity: undefined,
    location: "",
    room_type: "CLASSROOM",
    is_active: true,
  });

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || room.room_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        code: room.code,
        name: room.name,
        department_id: room.department_id || "",
        capacity: room.capacity || undefined,
        location: room.location || "",
        room_type: room.room_type,
        is_active: room.is_active,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        code: "",
        name: "",
        department_id: "",
        capacity: undefined,
        location: "",
        room_type: "CLASSROOM",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const department = formData.department_id
      ? mockDepartments.find((d) => d.id === formData.department_id)
      : null;

    if (editingRoom) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === editingRoom.id
            ? {
                ...room,
                ...formData,
                department_id: formData.department_id || null,
                department: department || null,
                capacity: formData.capacity || null,
                location: formData.location || null,
                updated_at: new Date().toISOString(),
              }
            : room
        )
      );
    } else {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        department_id: formData.department_id || null,
        department: department || null,
        capacity: formData.capacity || null,
        location: formData.location || null,
        room_type: formData.room_type,
        is_active: formData.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRooms((prev) => [...prev, newRoom]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa phòng này?")) {
      setRooms((prev) => prev.filter((room) => room.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Phòng học</h2>
          <p className="text-muted-foreground">
            Quản lý phòng học, phòng thực hành, phòng mô phỏng
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại phòng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {ROOM_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng</CardTitle>
          <CardDescription>
            Tổng cộng {filteredRooms.length} phòng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Mã</th>
                  <th className="h-10 px-4 text-left font-medium">Tên</th>
                  <th className="h-10 px-4 text-left font-medium">Loại</th>
                  <th className="h-10 px-4 text-left font-medium">Bộ môn</th>
                  <th className="h-10 px-4 text-left font-medium">Sức chứa</th>
                  <th className="h-10 px-4 text-left font-medium">Vị trí</th>
                  <th className="h-10 px-4 text-center font-medium">
                    Trạng thái
                  </th>
                  <th className="h-10 px-4 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="border-b">
                      <td className="h-12 px-4 font-medium">{room.code}</td>
                      <td className="h-12 px-4">{room.name}</td>
                      <td className="h-12 px-4">
                        <Badge variant="outline">
                          {ROOM_TYPE_LABELS[room.room_type]}
                        </Badge>
                      </td>
                      <td className="h-12 px-4 text-muted-foreground">
                        {room.department?.name || "-"}
                      </td>
                      <td className="h-12 px-4">{room.capacity || "-"}</td>
                      <td className="h-12 px-4 text-muted-foreground">
                        {room.location || "-"}
                      </td>
                      <td className="h-12 px-4 text-center">
                        <Badge
                          variant={room.is_active ? "success" : "secondary"}
                        >
                          {room.is_active ? "Hoạt động" : "Tạm ngưng"}
                        </Badge>
                      </td>
                      <td className="h-12 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(room.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Cập nhật thông tin phòng"
                : "Nhập thông tin phòng mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã phòng *</Label>
                  <Input
                    id="code"
                    placeholder="VD: P101, LAB-A1..."
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
                  <Label htmlFor="capacity">Sức chứa</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="VD: 30"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên phòng *</Label>
                <Input
                  id="name"
                  placeholder="VD: Phòng học lý thuyết 101"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room_type">Loại phòng *</Label>
                <Select
                  value={formData.room_type}
                  onValueChange={(value: RoomType) =>
                    setFormData({ ...formData, room_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {ROOM_TYPE_LABELS[type]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
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
              <div className="grid gap-2">
                <Label htmlFor="location">Vị trí</Label>
                <Input
                  id="location"
                  placeholder="VD: Tầng 1, Tòa A"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Đang hoạt động</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
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
                {editingRoom ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
