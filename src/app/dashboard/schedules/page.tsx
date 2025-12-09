"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Eye } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mockCourses, mockRooms, mockTimeSlots } from "@/data/mock-master";
import {
  getSchedulesForWeek,
  getRequestForSchedule,
  getAllLecturers,
  mockTeachingSchedules,
} from "@/data/mock-schedules";
import type {
  TeachingSchedule,
  TeachingScheduleFormData,
  TeachingScheduleWithRelations,
} from "@/types/schedules";
import { SESSION_REQUEST_STATUS_LABELS, SESSION_REQUEST_STATUS_COLORS } from "@/types/schedules";
import Link from "next/link";

// Helper to get Monday of a week
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// Helper to format date
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Vietnamese day names
const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

export default function SchedulesPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterLecturer, setFilterLecturer] = useState<string>("all");

  // Sheet state for viewing schedule details
  const [selectedSchedule, setSelectedSchedule] = useState<TeachingScheduleWithRelations | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Dialog state for adding new schedule
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TeachingScheduleFormData>({
    course_id: "",
    room_id: "",
    time_slot_id: "",
    session_date: "",
    lecturer_id: "",
    notes: "",
  });

  // Get schedules for current week
  const schedules = useMemo(() => {
    let data = getSchedulesForWeek(currentWeekStart);

    // Apply filters
    if (filterCourse !== "all") {
      data = data.filter((s) => s.course_id === filterCourse);
    }
    if (filterRoom !== "all") {
      data = data.filter((s) => s.room_id === filterRoom);
    }
    if (filterLecturer !== "all") {
      data = data.filter((s) => s.lecturer_id === filterLecturer);
    }

    return data;
  }, [currentWeekStart, filterCourse, filterRoom, filterLecturer]);

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeekStart]);

  // Get lecturers for filter
  const lecturers = getAllLecturers();

  // Navigation handlers
  const goToPreviousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Get schedules for a specific cell (date + time slot)
  const getSchedulesForCell = (date: Date, slotId: string) => {
    const dateStr = formatDate(date);
    return schedules.filter(
      (s) => s.session_date === dateStr && s.time_slot_id === slotId
    );
  };

  // Handle clicking on a schedule cell
  const handleScheduleClick = (schedule: TeachingScheduleWithRelations) => {
    setSelectedSchedule(schedule);
    setIsSheetOpen(true);
  };

  // Handle form submit for new schedule
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, just close dialog
    alert("Đã tạo lịch giảng dạy mới (demo mode)");
    setIsDialogOpen(false);
    setFormData({
      course_id: "",
      room_id: "",
      time_slot_id: "",
      session_date: "",
      lecturer_id: "",
      notes: "",
    });
  };

  // Format week range for display
  const weekRangeText = useMemo(() => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(endDate.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString("vi-VN")} - ${endDate.toLocaleDateString("vi-VN")}`;
  }, [currentWeekStart]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lịch giảng dạy</h2>
          <p className="text-muted-foreground">
            Quản lý lịch thực hành theo tuần
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm buổi học
        </Button>
      </div>

      {/* Week Navigation & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToCurrentWeek}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Tuần này
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 font-medium">{weekRangeText}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn</SelectItem>
              {mockCourses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng</SelectItem>
              {mockRooms.filter((r) => r.is_active).map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLecturer} onValueChange={setFilterLecturer}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Giảng viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả GV</SelectItem>
              {lecturers.map((l) => (
                <SelectItem key={l} value={l}>
                  {l.split("@")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-24 border-b border-r bg-muted/50 p-2 text-left text-sm font-medium">
                    Slot
                  </th>
                  {weekDates.map((date, idx) => {
                    const isToday = formatDate(date) === formatDate(new Date());
                    return (
                      <th
                        key={idx}
                        className={`min-w-[140px] border-b border-r p-2 text-center text-sm font-medium ${
                          isToday ? "bg-primary/10" : "bg-muted/50"
                        }`}
                      >
                        <div className="font-semibold">{DAY_NAMES[idx]}</div>
                        <div className={`text-xs ${isToday ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {date.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {mockTimeSlots.map((slot) => (
                  <tr key={slot.id}>
                    <td className="border-b border-r bg-muted/30 p-2 text-sm">
                      <div className="font-medium">{slot.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {slot.start_time} - {slot.end_time}
                      </div>
                    </td>
                    {weekDates.map((date, idx) => {
                      const cellSchedules = getSchedulesForCell(date, slot.id);
                      const isToday = formatDate(date) === formatDate(new Date());
                      return (
                        <td
                          key={idx}
                          className={`border-b border-r p-1 align-top ${
                            isToday ? "bg-primary/5" : ""
                          }`}
                        >
                          {cellSchedules.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleScheduleClick(s)}
                              className="w-full mb-1 p-2 rounded-md bg-primary/10 hover:bg-primary/20 text-left transition-colors"
                            >
                              <div className="font-medium text-xs text-primary">
                                {s.course?.code}
                              </div>
                              <div className="text-xs truncate">
                                {s.course?.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {s.room?.code}
                              </div>
                            </button>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Chi tiết buổi học</SheetTitle>
            <SheetDescription>
              {selectedSchedule?.session_date &&
                new Date(selectedSchedule.session_date).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
            </SheetDescription>
          </SheetHeader>
          {selectedSchedule && (
            <div className="mt-6 space-y-6">
              {/* Course Info */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Môn học</Label>
                <div className="font-medium">
                  {selectedSchedule.course?.code} -{" "}
                  {selectedSchedule.course?.name}
                </div>
              </div>

              {/* Time & Room */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Khung giờ</Label>
                  <div className="font-medium">
                    {selectedSchedule.time_slot?.code} (
                    {selectedSchedule.time_slot?.start_time} -{" "}
                    {selectedSchedule.time_slot?.end_time})
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Phòng</Label>
                  <div className="font-medium">
                    {selectedSchedule.room?.code} - {selectedSchedule.room?.name}
                  </div>
                </div>
              </div>

              {/* Lecturer */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Giảng viên</Label>
                <div className="font-medium">
                  {selectedSchedule.lecturer_id?.split("@")[0] || "-"}
                </div>
              </div>

              {/* Notes */}
              {selectedSchedule.notes && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <div className="text-sm">{selectedSchedule.notes}</div>
                </div>
              )}

              {/* Session Request Status */}
              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Đăng ký thiết bị & vật tư</Label>
                {(() => {
                  const request = getRequestForSchedule(selectedSchedule.id);
                  if (!request) {
                    return (
                      <div className="mt-2">
                        <Badge variant="outline">Chưa đăng ký</Badge>
                        <Link
                          href={`/dashboard/requests?schedule=${selectedSchedule.id}`}
                          className="block mt-3"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo đăng ký
                          </Button>
                        </Link>
                      </div>
                    );
                  }
                  return (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            SESSION_REQUEST_STATUS_COLORS[request.status] as
                              | "success"
                              | "warning"
                              | "destructive"
                              | "secondary"
                          }
                        >
                          {SESSION_REQUEST_STATUS_LABELS[request.status]}
                        </Badge>
                        {request.skill_name && (
                          <span className="text-sm text-muted-foreground">
                            {request.skill_name}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/requests?id=${request.id}`}
                        className="block"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết đăng ký
                        </Button>
                      </Link>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm buổi học mới</DialogTitle>
            <DialogDescription>
              Tạo buổi học mới trong lịch giảng dạy
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Course */}
              <div className="grid gap-2">
                <Label htmlFor="course">Môn học *</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, course_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Slot */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Ngày *</Label>
                  <Input
                    type="date"
                    value={formData.session_date}
                    onChange={(e) =>
                      setFormData({ ...formData, session_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slot">Khung giờ *</Label>
                  <Select
                    value={formData.time_slot_id}
                    onValueChange={(v) =>
                      setFormData({ ...formData, time_slot_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTimeSlots.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} ({s.start_time} - {s.end_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Room */}
              <div className="grid gap-2">
                <Label htmlFor="room">Phòng *</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, room_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRooms
                      .filter((r) => r.is_active)
                      .map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.code} - {r.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lecturer */}
              <div className="grid gap-2">
                <Label htmlFor="lecturer">Giảng viên</Label>
                <Input
                  placeholder="email@truongy.edu.vn"
                  value={formData.lecturer_id}
                  onChange={(e) =>
                    setFormData({ ...formData, lecturer_id: e.target.value })
                  }
                />
              </div>

              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  placeholder="VD: Kỹ năng khám tim phổi"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Tạo buổi học</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
