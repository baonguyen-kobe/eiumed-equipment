"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Eye,
  Check,
  X,
  AlertTriangle,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSessionRequestsByStatus,
  getSchedulesForWeek,
  enrichSchedule,
  mockTeachingSchedules,
} from "@/data/mock-schedules";
import { mockDevices, getEnrichedDevices } from "@/data/mock-devices";
import { getSuppliesWithStock } from "@/data/mock-supplies";
import { checkDeviceConflicts, formatConflictMessage } from "@/lib/schedules/conflict-checker";
import type {
  SessionRequestWithDetails,
  SessionRequestStatus,
  SessionRequestLineFormData,
  TeachingScheduleWithRelations,
  DeviceConflict,
} from "@/types/schedules";
import {
  SESSION_REQUEST_STATUS_LABELS,
  SESSION_REQUEST_STATUS_COLORS,
  LINE_TYPE_LABELS,
} from "@/types/schedules";

// Mock current user - in real app would come from auth
const CURRENT_USER = "gv001@truongy.edu.vn";
const IS_QTVT = true; // Admin role for demo

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const preSelectedScheduleId = searchParams.get("schedule");
  const preSelectedRequestId = searchParams.get("id");

  // Tab state
  const [activeTab, setActiveTab] = useState<string>(IS_QTVT ? "pending" : "my-requests");

  // Get all requests
  const allRequests = useMemo(() => getSessionRequestsByStatus(), []);
  const pendingRequests = allRequests.filter((r) => r.status === "PENDING");
  const myRequests = allRequests.filter((r) => r.requester_id === CURRENT_USER);

  // View request detail dialog
  const [selectedRequest, setSelectedRequest] = useState<SessionRequestWithDetails | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Reject dialog
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Create new request dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [selectedSchedule, setSelectedSchedule] = useState<TeachingScheduleWithRelations | null>(null);
  const [newRequestData, setNewRequestData] = useState({
    skill_name: "",
    note: "",
    selectedDeviceIds: [] as string[],
    supplyLines: [] as { supply_id: string; quantity: number }[],
  });
  const [conflicts, setConflicts] = useState<DeviceConflict[]>([]);

  // Get available schedules for creating request (future schedules without existing request)
  const availableSchedules = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return mockTeachingSchedules
      .filter((s) => {
        // Future schedules only
        if (s.session_date < today) return false;
        // No existing request
        const hasRequest = allRequests.some((r) => r.schedule_id === s.id);
        return !hasRequest;
      })
      .map(enrichSchedule)
      .sort((a, b) => a.session_date.localeCompare(b.session_date));
  }, [allRequests]);

  // Get devices and supplies for selection
  const availableDevices = getEnrichedDevices().filter(
    (d) => d.status === "AVAILABLE" || d.status === "IN_USE"
  );
  const availableSupplies = getSuppliesWithStock().filter((s) => s.current_stock > 0);

  // Open detail dialog
  const handleViewRequest = (request: SessionRequestWithDetails) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  // Handle approve
  const handleApprove = () => {
    alert(`Đã duyệt đơn đăng ký "${selectedRequest?.skill_name || selectedRequest?.id}" (demo mode)`);
    setIsDetailDialogOpen(false);
    setSelectedRequest(null);
  };

  // Handle reject
  const handleReject = () => {
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    alert(
      `Đã từ chối đơn đăng ký "${selectedRequest?.skill_name || selectedRequest?.id}"\nLý do: ${rejectReason} (demo mode)`
    );
    setIsRejectDialogOpen(false);
    setIsDetailDialogOpen(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  // Open create dialog
  const handleOpenCreate = () => {
    setCreateStep(1);
    setSelectedSchedule(null);
    setNewRequestData({
      skill_name: "",
      note: "",
      selectedDeviceIds: [],
      supplyLines: [],
    });
    setConflicts([]);

    // Check if preselected schedule
    if (preSelectedScheduleId) {
      const schedule = mockTeachingSchedules.find((s) => s.id === preSelectedScheduleId);
      if (schedule) {
        setSelectedSchedule(enrichSchedule(schedule));
        setCreateStep(2);
      }
    }

    setIsCreateDialogOpen(true);
  };

  // Select schedule in step 1
  const handleSelectSchedule = (scheduleId: string) => {
    const schedule = mockTeachingSchedules.find((s) => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(enrichSchedule(schedule));
      setCreateStep(2);
    }
  };

  // Toggle device selection
  const toggleDeviceSelection = (deviceId: string) => {
    setNewRequestData((prev) => {
      const isSelected = prev.selectedDeviceIds.includes(deviceId);
      const newDeviceIds = isSelected
        ? prev.selectedDeviceIds.filter((id) => id !== deviceId)
        : [...prev.selectedDeviceIds, deviceId];

      // Check conflicts when device selection changes
      if (selectedSchedule && newDeviceIds.length > 0) {
        const newConflicts = checkDeviceConflicts({
          deviceIds: newDeviceIds,
          sessionDate: selectedSchedule.session_date,
          timeSlotId: selectedSchedule.time_slot_id,
        });
        setConflicts(newConflicts);
      } else {
        setConflicts([]);
      }

      return { ...prev, selectedDeviceIds: newDeviceIds };
    });
  };

  // Add/update supply line
  const handleSupplyChange = (supplyId: string, quantity: number) => {
    setNewRequestData((prev) => {
      const existingIndex = prev.supplyLines.findIndex((l) => l.supply_id === supplyId);
      if (quantity <= 0) {
        // Remove
        return {
          ...prev,
          supplyLines: prev.supplyLines.filter((l) => l.supply_id !== supplyId),
        };
      }
      if (existingIndex >= 0) {
        // Update
        const newLines = [...prev.supplyLines];
        newLines[existingIndex] = { supply_id: supplyId, quantity };
        return { ...prev, supplyLines: newLines };
      }
      // Add
      return {
        ...prev,
        supplyLines: [...prev.supplyLines, { supply_id: supplyId, quantity }],
      };
    });
  };

  // Submit new request
  const handleSubmitRequest = () => {
    if (
      newRequestData.selectedDeviceIds.length === 0 &&
      newRequestData.supplyLines.length === 0
    ) {
      alert("Vui lòng chọn ít nhất một thiết bị hoặc vật tư");
      return;
    }

    alert(
      `Đã tạo đơn đăng ký cho buổi học ${selectedSchedule?.course?.code} (demo mode)\n` +
        `- ${newRequestData.selectedDeviceIds.length} thiết bị\n` +
        `- ${newRequestData.supplyLines.length} vật tư`
    );
    setIsCreateDialogOpen(false);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Stats
  const stats = {
    total: allRequests.length,
    pending: pendingRequests.length,
    approved: allRequests.filter((r) => r.status === "APPROVED").length,
    rejected: allRequests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Đăng ký thiết bị & vật tư
          </h2>
          <p className="text-muted-foreground">
            Quản lý đăng ký thiết bị và vật tư cho buổi học
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đăng ký mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {IS_QTVT && (
            <TabsTrigger value="pending">
              Chờ duyệt
              {stats.pending > 0 && (
                <Badge variant="warning" className="ml-2">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="my-requests">Đơn của tôi</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        {/* Pending Tab - QTVT Only */}
        {IS_QTVT && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Đơn đăng ký chờ duyệt</CardTitle>
                <CardDescription>
                  Duyệt hoặc từ chối các đơn đăng ký thiết bị & vật tư
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestTable
                  requests={pendingRequests}
                  onView={handleViewRequest}
                  formatDate={formatDate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* My Requests Tab */}
        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>Đơn đăng ký của tôi</CardTitle>
              <CardDescription>
                Danh sách các đơn đăng ký bạn đã tạo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestTable
                requests={myRequests}
                onView={handleViewRequest}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả đơn đăng ký</CardTitle>
              <CardDescription>
                Toàn bộ đơn đăng ký trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestTable
                requests={allRequests}
                onView={handleViewRequest}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn đăng ký</DialogTitle>
            <DialogDescription>
              {selectedRequest?.skill_name || "Đơn đăng ký thiết bị & vật tư"}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    SESSION_REQUEST_STATUS_COLORS[selectedRequest.status] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "secondary"
                  }
                >
                  {SESSION_REQUEST_STATUS_LABELS[selectedRequest.status]}
                </Badge>
                {selectedRequest.status === "REJECTED" &&
                  selectedRequest.rejected_reason && (
                    <span className="text-sm text-destructive">
                      - {selectedRequest.rejected_reason}
                    </span>
                  )}
              </div>

              {/* Schedule Info */}
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Thông tin buổi học</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Môn học:</span>{" "}
                    {selectedRequest.schedule?.course?.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày:</span>{" "}
                    {selectedRequest.schedule?.session_date &&
                      formatDate(selectedRequest.schedule.session_date)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phòng:</span>{" "}
                    {selectedRequest.schedule?.room?.code}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Khung giờ:</span>{" "}
                    {selectedRequest.schedule?.time_slot?.label}
                  </div>
                </div>
              </div>

              {/* Requester Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Người yêu cầu</Label>
                  <p>{selectedRequest.requester_id?.split("@")[0]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p>
                    {new Date(selectedRequest.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Note */}
              {selectedRequest.note && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="text-sm mt-1">{selectedRequest.note}</p>
                </div>
              )}

              {/* Lines - Devices */}
              <div>
                <h4 className="font-medium mb-2">Thiết bị yêu cầu</h4>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-left font-medium">Mã</th>
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-left font-medium">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.lines
                        ?.filter((l) => l.line_type === "DEVICE")
                        .map((line) => (
                          <tr key={line.id} className="border-b">
                            <td className="h-10 px-3 font-medium">
                              {line.device?.code}
                            </td>
                            <td className="h-10 px-3">{line.device?.name}</td>
                            <td className="h-10 px-3 text-muted-foreground">
                              {line.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      {selectedRequest.lines?.filter((l) => l.line_type === "DEVICE")
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="h-10 px-3 text-muted-foreground text-center"
                          >
                            Không có thiết bị
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lines - Supplies */}
              <div>
                <h4 className="font-medium mb-2">Vật tư yêu cầu</h4>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-left font-medium">Mã</th>
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-right font-medium">Số lượng</th>
                        <th className="h-9 px-3 text-left font-medium">ĐVT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.lines
                        ?.filter((l) => l.line_type === "SUPPLY")
                        .map((line) => (
                          <tr key={line.id} className="border-b">
                            <td className="h-10 px-3 font-medium">
                              {line.supply?.code}
                            </td>
                            <td className="h-10 px-3">{line.supply?.name}</td>
                            <td className="h-10 px-3 text-right">{line.quantity}</td>
                            <td className="h-10 px-3">{line.supply?.unit}</td>
                          </tr>
                        ))}
                      {selectedRequest.lines?.filter((l) => l.line_type === "SUPPLY")
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="h-10 px-3 text-muted-foreground text-center"
                          >
                            Không có vật tư
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === "PENDING" && IS_QTVT && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  <X className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
                <Button onClick={handleApprove}>
                  <Check className="mr-2 h-4 w-4" />
                  Duyệt
                </Button>
              </>
            )}
            {(selectedRequest?.status !== "PENDING" || !IS_QTVT) && (
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Đóng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đơn đăng ký</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối để thông báo cho người yêu cầu
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Lý do từ chối *</Label>
            <Textarea
              id="reason"
              placeholder="VD: Thiết bị đang bảo trì..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectReason.trim()}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createStep === 1 ? "Bước 1: Chọn buổi học" : "Bước 2: Chọn thiết bị & vật tư"}
            </DialogTitle>
            <DialogDescription>
              {createStep === 1
                ? "Chọn buổi học bạn muốn đăng ký thiết bị và vật tư"
                : `Buổi học: ${selectedSchedule?.course?.code} - ${formatDate(selectedSchedule?.session_date || "")}`}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Select Schedule */}
          {createStep === 1 && (
            <div className="py-4">
              <div className="rounded-md border max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b bg-muted/50">
                      <th className="h-9 px-3 text-left font-medium">Ngày</th>
                      <th className="h-9 px-3 text-left font-medium">Slot</th>
                      <th className="h-9 px-3 text-left font-medium">Môn</th>
                      <th className="h-9 px-3 text-left font-medium">Phòng</th>
                      <th className="h-9 px-3 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableSchedules.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Không có buổi học nào khả dụng
                        </td>
                      </tr>
                    ) : (
                      availableSchedules.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-muted/50">
                          <td className="h-10 px-3">
                            {formatDate(s.session_date)}
                          </td>
                          <td className="h-10 px-3">{s.time_slot?.code}</td>
                          <td className="h-10 px-3">
                            {s.course?.code} - {s.course?.name}
                          </td>
                          <td className="h-10 px-3">{s.room?.code}</td>
                          <td className="h-10 px-3 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleSelectSchedule(s.id)}
                            >
                              Chọn
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 2: Select Devices & Supplies */}
          {createStep === 2 && selectedSchedule && (
            <div className="py-4 space-y-6">
              {/* Skill Name & Note */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="skill_name">Tên kỹ năng</Label>
                  <Input
                    id="skill_name"
                    placeholder="VD: Đặt nội khí quản"
                    value={newRequestData.skill_name}
                    onChange={(e) =>
                      setNewRequestData({
                        ...newRequestData,
                        skill_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Input
                    id="note"
                    placeholder="VD: Nhóm 20 sinh viên"
                    value={newRequestData.note}
                    onChange={(e) =>
                      setNewRequestData({
                        ...newRequestData,
                        note: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Conflict Warning */}
              {conflicts.length > 0 && (
                <div className="rounded-md bg-warning/10 border border-warning p-3">
                  <div className="flex items-center gap-2 text-warning font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Cảnh báo xung đột thiết bị
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-line">
                    {formatConflictMessage(conflicts)}
                  </p>
                </div>
              )}

              {/* Devices Selection */}
              <div>
                <Label className="mb-2 block">Thiết bị</Label>
                <div className="rounded-md border max-h-[200px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-center w-10"></th>
                        <th className="h-9 px-3 text-left font-medium">Mã</th>
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-left font-medium">Loại</th>
                        <th className="h-9 px-3 text-center font-medium">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableDevices.map((d) => {
                        const isSelected =
                          newRequestData.selectedDeviceIds.includes(d.id);
                        const hasConflict = conflicts.some(
                          (c) => c.device_id === d.id
                        );
                        return (
                          <tr
                            key={d.id}
                            className={`border-b cursor-pointer hover:bg-muted/50 ${
                              isSelected ? "bg-primary/10" : ""
                            } ${hasConflict ? "bg-warning/10" : ""}`}
                            onClick={() => toggleDeviceSelection(d.id)}
                          >
                            <td className="h-10 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded"
                              />
                            </td>
                            <td className="h-10 px-3 font-medium">{d.code}</td>
                            <td className="h-10 px-3">{d.name}</td>
                            <td className="h-10 px-3 text-muted-foreground">
                              {d.category}
                            </td>
                            <td className="h-10 px-3 text-center">
                              <Badge
                                variant={
                                  d.status === "AVAILABLE"
                                    ? "success"
                                    : "warning"
                                }
                              >
                                {d.status === "AVAILABLE"
                                  ? "Sẵn sàng"
                                  : "Đang dùng"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đã chọn: {newRequestData.selectedDeviceIds.length} thiết bị
                </p>
              </div>

              {/* Supplies Selection */}
              <div>
                <Label className="mb-2 block">Vật tư</Label>
                <div className="rounded-md border max-h-[200px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-left font-medium">Mã</th>
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-right font-medium">
                          Tồn kho
                        </th>
                        <th className="h-9 px-3 text-left font-medium">ĐVT</th>
                        <th className="h-9 px-3 text-center font-medium w-24">
                          SL yêu cầu
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableSupplies.map((s) => {
                        const line = newRequestData.supplyLines.find(
                          (l) => l.supply_id === s.id
                        );
                        return (
                          <tr key={s.id} className="border-b">
                            <td className="h-10 px-3 font-medium">{s.code}</td>
                            <td className="h-10 px-3">{s.name}</td>
                            <td className="h-10 px-3 text-right">
                              {s.current_stock}
                            </td>
                            <td className="h-10 px-3">{s.unit}</td>
                            <td className="h-10 px-3">
                              <Input
                                type="number"
                                min={0}
                                max={s.current_stock}
                                value={line?.quantity || ""}
                                onChange={(e) =>
                                  handleSupplyChange(
                                    s.id,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="h-8 w-20"
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đã chọn: {newRequestData.supplyLines.length} loại vật tư
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {createStep === 2 && (
              <Button
                variant="outline"
                onClick={() => {
                  setCreateStep(1);
                  setSelectedSchedule(null);
                }}
              >
                Quay lại
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Hủy
            </Button>
            {createStep === 2 && (
              <Button onClick={handleSubmitRequest}>Gửi đăng ký</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Request Table Component
function RequestTable({
  requests,
  onView,
  formatDate,
}: {
  requests: SessionRequestWithDetails[];
  onView: (request: SessionRequestWithDetails) => void;
  formatDate: (date: string) => string;
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có đơn đăng ký nào
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-10 px-4 text-left font-medium">Ngày</th>
            <th className="h-10 px-4 text-left font-medium">Slot</th>
            <th className="h-10 px-4 text-left font-medium">Phòng</th>
            <th className="h-10 px-4 text-left font-medium">Môn học</th>
            <th className="h-10 px-4 text-left font-medium">Kỹ năng</th>
            <th className="h-10 px-4 text-left font-medium">Người yêu cầu</th>
            <th className="h-10 px-4 text-center font-medium">Trạng thái</th>
            <th className="h-10 px-4 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-b hover:bg-muted/50">
              <td className="h-12 px-4">
                {r.schedule?.session_date && formatDate(r.schedule.session_date)}
              </td>
              <td className="h-12 px-4">{r.schedule?.time_slot?.code}</td>
              <td className="h-12 px-4">{r.schedule?.room?.code}</td>
              <td className="h-12 px-4">{r.schedule?.course?.code}</td>
              <td className="h-12 px-4">{r.skill_name || "-"}</td>
              <td className="h-12 px-4 text-muted-foreground">
                {r.requester_id?.split("@")[0]}
              </td>
              <td className="h-12 px-4 text-center">
                <Badge
                  variant={
                    SESSION_REQUEST_STATUS_COLORS[r.status] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "secondary"
                  }
                >
                  {SESSION_REQUEST_STATUS_LABELS[r.status]}
                </Badge>
              </td>
              <td className="h-12 px-4 text-right">
                <Button variant="ghost" size="icon" onClick={() => onView(r)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
