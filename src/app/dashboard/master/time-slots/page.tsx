"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Clock } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { mockTimeSlots } from "@/data/mock-master";
import type { TimeSlot, TimeSlotFormData } from "@/types/master";

export default function TimeSlotsPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(mockTimeSlots);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<TimeSlotFormData>({
    code: "",
    label: "",
    start_time: "",
    end_time: "",
  });

  const filteredSlots = timeSlots.filter(
    (slot) =>
      slot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (slot?: TimeSlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        code: slot.code,
        label: slot.label,
        start_time: slot.start_time,
        end_time: slot.end_time,
      });
    } else {
      setEditingSlot(null);
      setFormData({
        code: "",
        label: "",
        start_time: "",
        end_time: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSlot(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSlot) {
      setTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === editingSlot.id
            ? {
                ...slot,
                ...formData,
                updated_at: new Date().toISOString(),
              }
            : slot
        )
      );
    } else {
      const newSlot: TimeSlot = {
        id: `slot-${Date.now()}`,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTimeSlots((prev) => [...prev, newSlot]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa khung giờ này?")) {
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
    }
  };

  // Helper to determine time period badge
  const getTimePeriodBadge = (code: string) => {
    if (code.startsWith("S")) return { label: "Sáng", variant: "default" as const };
    if (code.startsWith("C")) return { label: "Chiều", variant: "secondary" as const };
    if (code.startsWith("T")) return { label: "Tối", variant: "outline" as const };
    return { label: "Khác", variant: "outline" as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Khung giờ học</h2>
          <p className="text-muted-foreground">
            Quản lý các khung giờ học trong ngày
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      {/* Search */}
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
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSlots.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
              Không có dữ liệu
            </CardContent>
          </Card>
        ) : (
          filteredSlots.map((slot) => {
            const period = getTimePeriodBadge(slot.code);
            return (
              <Card key={slot.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={period.variant}>{period.label}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(slot)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{slot.code}</CardTitle>
                  <CardDescription>{slot.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết khung giờ</CardTitle>
          <CardDescription>
            Tổng cộng {filteredSlots.length} khung giờ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Mã</th>
                  <th className="h-10 px-4 text-left font-medium">Tên hiển thị</th>
                  <th className="h-10 px-4 text-center font-medium">
                    Buổi
                  </th>
                  <th className="h-10 px-4 text-center font-medium">
                    Giờ bắt đầu
                  </th>
                  <th className="h-10 px-4 text-center font-medium">
                    Giờ kết thúc
                  </th>
                  <th className="h-10 px-4 text-center font-medium">
                    Thời lượng
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot) => {
                  const period = getTimePeriodBadge(slot.code);
                  // Calculate duration
                  const [startH, startM] = slot.start_time.split(":").map(Number);
                  const [endH, endM] = slot.end_time.split(":").map(Number);
                  const durationMinutes =
                    endH * 60 + endM - (startH * 60 + startM);
                  const hours = Math.floor(durationMinutes / 60);
                  const minutes = durationMinutes % 60;

                  return (
                    <tr key={slot.id} className="border-b">
                      <td className="h-12 px-4 font-medium">{slot.code}</td>
                      <td className="h-12 px-4">{slot.label}</td>
                      <td className="h-12 px-4 text-center">
                        <Badge variant={period.variant}>{period.label}</Badge>
                      </td>
                      <td className="h-12 px-4 text-center font-mono">
                        {slot.start_time}
                      </td>
                      <td className="h-12 px-4 text-center font-mono">
                        {slot.end_time}
                      </td>
                      <td className="h-12 px-4 text-center text-muted-foreground">
                        {hours > 0 && `${hours}h`}
                        {minutes > 0 && `${minutes}p`}
                      </td>
                    </tr>
                  );
                })}
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
              {editingSlot ? "Chỉnh sửa khung giờ" : "Thêm khung giờ mới"}
            </DialogTitle>
            <DialogDescription>
              {editingSlot
                ? "Cập nhật thông tin khung giờ"
                : "Nhập thông tin khung giờ mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã khung giờ *</Label>
                <Input
                  id="code"
                  placeholder="VD: S1, S2, C1, T1..."
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Gợi ý: S = Sáng, C = Chiều, T = Tối
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label">Tên hiển thị *</Label>
                <Input
                  id="label"
                  placeholder="VD: Sáng 1 (7h00 - 9h00)"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Giờ bắt đầu *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">Giờ kết thúc *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    required
                  />
                </div>
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
                {editingSlot ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
