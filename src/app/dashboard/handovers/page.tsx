"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  FileCheck,
  Clock,
  CheckCircle2,
  ArrowRightLeft,
  Search,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock handover data
type HandoverStatus = "PENDING" | "HANDED_OVER" | "RETURNED" | "ISSUE";

const STATUS_LABELS: Record<HandoverStatus, string> = {
  PENDING: "Chờ giao",
  HANDED_OVER: "Đã giao",
  RETURNED: "Đã trả",
  ISSUE: "Có vấn đề",
};

const STATUS_COLORS: Record<HandoverStatus, string> = {
  PENDING: "warning",
  HANDED_OVER: "default",
  RETURNED: "success",
  ISSUE: "destructive",
};

interface HandoverRecord {
  id: string;
  request_id: string;
  course_name: string;
  room_code: string;
  session_date: string;
  time_slot: string;
  lecturer: string;
  status: HandoverStatus;
  handed_by: string | null;
  handed_at: string | null;
  returned_at: string | null;
  devices: { code: string; name: string; checked: boolean }[];
  supplies: { code: string; name: string; quantity: number; used: number }[];
  notes: string | null;
}

const mockHandovers: HandoverRecord[] = [
  {
    id: "ho-1",
    request_id: "req-1",
    course_name: "Hồi sức cấp cứu",
    room_code: "SIM-01",
    session_date: new Date().toISOString().split("T")[0],
    time_slot: "S2 (9h15-11h15)",
    lecturer: "gv002",
    status: "HANDED_OVER",
    handed_by: "qtvt",
    handed_at: new Date().toISOString(),
    returned_at: null,
    devices: [
      { code: "DV-MAN-001", name: "Manikin hồi sức cấp cứu", checked: true },
      { code: "DV-DEF-001", name: "Máy sốc điện", checked: true },
    ],
    supplies: [
      { code: "VT-GT-NITRILE", name: "Găng tay Nitrile", quantity: 2, used: 0 },
    ],
    notes: "Đã kiểm tra tình trạng thiết bị OK",
  },
  {
    id: "ho-2",
    request_id: "req-4",
    course_name: "Hồi sức cấp cứu",
    room_code: "SIM-01",
    session_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    time_slot: "S1 (7h00-9h00)",
    lecturer: "gv002",
    status: "PENDING",
    handed_by: null,
    handed_at: null,
    returned_at: null,
    devices: [
      { code: "DV-MAN-001", name: "Manikin hồi sức cấp cứu", checked: false },
      { code: "DV-DEF-001", name: "Máy sốc điện", checked: false },
      { code: "DV-MON-001", name: "Monitor theo dõi", checked: false },
      { code: "DV-ECG-001", name: "Máy điện tim", checked: false },
    ],
    supplies: [
      { code: "VT-CON-ECG", name: "Điện cực ECG", quantity: 2, used: 0 },
    ],
    notes: null,
  },
  {
    id: "ho-3",
    request_id: "req-2",
    course_name: "Hồi sức cấp cứu",
    room_code: "SIM-01",
    session_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time_slot: "C1 (13h00-15h00)",
    lecturer: "gv002",
    status: "RETURNED",
    handed_by: "qtvt",
    handed_at: new Date(Date.now() - 86400000).toISOString(),
    returned_at: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    devices: [
      { code: "DV-MAN-001", name: "Manikin hồi sức cấp cứu", checked: true },
      { code: "DV-MON-001", name: "Monitor theo dõi", checked: true },
    ],
    supplies: [
      { code: "VT-GT-NITRILE", name: "Găng tay Nitrile", quantity: 3, used: 3 },
      { code: "VT-GEL-SA", name: "Gel siêu âm", quantity: 2, used: 1 },
    ],
    notes: "Đã sử dụng hết găng tay, còn thừa 1 chai gel",
  },
];

export default function HandoversPage() {
  const [handovers] = useState<HandoverRecord[]>(mockHandovers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("pending");

  // Detail dialog
  const [selectedHandover, setSelectedHandover] = useState<HandoverRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Handover action dialog
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"handover" | "return">("handover");

  const pendingHandovers = handovers.filter((h) => h.status === "PENDING");
  const activeHandovers = handovers.filter((h) => h.status === "HANDED_OVER");
  const completedHandovers = handovers.filter(
    (h) => h.status === "RETURNED" || h.status === "ISSUE"
  );

  const filteredHandovers = handovers.filter((h) => {
    const matchesSearch =
      h.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || h.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleView = (handover: HandoverRecord) => {
    setSelectedHandover(handover);
    setIsDetailOpen(true);
  };

  const handleAction = (handover: HandoverRecord, type: "handover" | "return") => {
    setSelectedHandover(handover);
    setActionType(type);
    setIsActionOpen(true);
  };

  const confirmAction = () => {
    if (actionType === "handover") {
      alert(`Đã xác nhận giao thiết bị cho buổi học "${selectedHandover?.course_name}" (demo mode)`);
    } else {
      alert(`Đã xác nhận nhận lại thiết bị từ buổi học "${selectedHandover?.course_name}" (demo mode)`);
    }
    setIsActionOpen(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  // Stats
  const stats = {
    total: handovers.length,
    pending: pendingHandovers.length,
    active: activeHandovers.length,
    completed: completedHandovers.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Giao - Nhận</h2>
          <p className="text-muted-foreground">
            Quản lý giao nhận thiết bị & vật tư cho buổi học
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phiếu</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ giao</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Chờ giao
            {stats.pending > 0 && (
              <Badge variant="warning" className="ml-2">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Đang mượn
            {stats.active > 0 && (
              <Badge variant="default" className="ml-2">
                {stats.active}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu chờ giao</CardTitle>
              <CardDescription>
                Các buổi học đã được duyệt, chờ giao thiết bị
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HandoverTable
                handovers={pendingHandovers}
                onView={handleView}
                onAction={handleAction}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Đang mượn</CardTitle>
              <CardDescription>
                Thiết bị đang được sử dụng, chờ trả lại
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HandoverTable
                handovers={activeHandovers}
                onView={handleView}
                onAction={handleAction}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Đã hoàn thành</CardTitle>
              <CardDescription>Lịch sử giao nhận</CardDescription>
            </CardHeader>
            <CardContent>
              <HandoverTable
                handovers={completedHandovers}
                onView={handleView}
                onAction={handleAction}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả phiếu giao nhận</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HandoverTable
                handovers={filteredHandovers}
                onView={handleView}
                onAction={handleAction}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu giao nhận</DialogTitle>
            <DialogDescription>
              {selectedHandover?.course_name} - {selectedHandover?.room_code}
            </DialogDescription>
          </DialogHeader>
          {selectedHandover && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    STATUS_COLORS[selectedHandover.status] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "default"
                  }
                >
                  {STATUS_LABELS[selectedHandover.status]}
                </Badge>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Ngày</Label>
                  <p>{formatDate(selectedHandover.session_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Khung giờ</Label>
                  <p>{selectedHandover.time_slot}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Giảng viên</Label>
                  <p>{selectedHandover.lecturer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Người giao</Label>
                  <p>{selectedHandover.handed_by || "-"}</p>
                </div>
                {selectedHandover.handed_at && (
                  <div>
                    <Label className="text-muted-foreground">Thời gian giao</Label>
                    <p>{formatDateTime(selectedHandover.handed_at)}</p>
                  </div>
                )}
                {selectedHandover.returned_at && (
                  <div>
                    <Label className="text-muted-foreground">Thời gian trả</Label>
                    <p>{formatDateTime(selectedHandover.returned_at)}</p>
                  </div>
                )}
              </div>

              {/* Devices */}
              <div>
                <h4 className="font-medium mb-2">Thiết bị</h4>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-left font-medium">Mã</th>
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-center font-medium">Đã kiểm tra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHandover.devices.map((d, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="h-10 px-3 font-medium">{d.code}</td>
                          <td className="h-10 px-3">{d.name}</td>
                          <td className="h-10 px-3 text-center">
                            {d.checked ? (
                              <Badge variant="success">OK</Badge>
                            ) : (
                              <Badge variant="outline">Chưa</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supplies */}
              <div>
                <h4 className="font-medium mb-2">Vật tư</h4>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-left font-medium">Mã</th>
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-right font-medium">SL giao</th>
                        <th className="h-9 px-3 text-right font-medium">SL dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHandover.supplies.map((s, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="h-10 px-3 font-medium">{s.code}</td>
                          <td className="h-10 px-3">{s.name}</td>
                          <td className="h-10 px-3 text-right">{s.quantity}</td>
                          <td className="h-10 px-3 text-right">{s.used}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedHandover.notes && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="text-sm mt-1">{selectedHandover.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "handover" ? "Xác nhận giao thiết bị" : "Xác nhận nhận lại"}
            </DialogTitle>
            <DialogDescription>
              {selectedHandover?.course_name} - {selectedHandover?.room_code} -{" "}
              {selectedHandover && formatDate(selectedHandover.session_date)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-4">
              {actionType === "handover"
                ? `Xác nhận giao ${selectedHandover?.devices.length} thiết bị và ${selectedHandover?.supplies.length} loại vật tư cho giảng viên ${selectedHandover?.lecturer}?`
                : `Xác nhận đã nhận lại thiết bị và vật tư từ giảng viên ${selectedHandover?.lecturer}?`}
            </p>
            <div className="grid gap-2">
              <Label>Ghi chú</Label>
              <Textarea placeholder="Nhập ghi chú nếu có..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmAction}>
              {actionType === "handover" ? "Xác nhận giao" : "Xác nhận nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Handover Table Component
function HandoverTable({
  handovers,
  onView,
  onAction,
  formatDate,
}: {
  handovers: HandoverRecord[];
  onView: (h: HandoverRecord) => void;
  onAction: (h: HandoverRecord, type: "handover" | "return") => void;
  formatDate: (date: string) => string;
}) {
  if (handovers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có phiếu giao nhận nào
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
            <th className="h-10 px-4 text-left font-medium">Giảng viên</th>
            <th className="h-10 px-4 text-center font-medium">TB/VT</th>
            <th className="h-10 px-4 text-center font-medium">Trạng thái</th>
            <th className="h-10 px-4 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {handovers.map((h) => (
            <tr key={h.id} className="border-b hover:bg-muted/50">
              <td className="h-12 px-4">{formatDate(h.session_date)}</td>
              <td className="h-12 px-4">{h.time_slot.split(" ")[0]}</td>
              <td className="h-12 px-4">{h.room_code}</td>
              <td className="h-12 px-4">{h.course_name}</td>
              <td className="h-12 px-4 text-muted-foreground">{h.lecturer}</td>
              <td className="h-12 px-4 text-center">
                <span className="text-xs">
                  {h.devices.length} TB / {h.supplies.length} VT
                </span>
              </td>
              <td className="h-12 px-4 text-center">
                <Badge
                  variant={
                    STATUS_COLORS[h.status] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "default"
                  }
                >
                  {STATUS_LABELS[h.status]}
                </Badge>
              </td>
              <td className="h-12 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(h)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {h.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction(h, "handover")}
                    >
                      Giao
                    </Button>
                  )}
                  {h.status === "HANDED_OVER" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAction(h, "return")}
                    >
                      Nhận lại
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
