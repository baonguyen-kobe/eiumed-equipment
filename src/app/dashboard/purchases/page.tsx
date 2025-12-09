"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
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

// Purchase request types
type PurchaseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PURCHASED";

const STATUS_LABELS: Record<PurchaseStatus, string> = {
  DRAFT: "Nháp",
  SUBMITTED: "Đã gửi",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  PURCHASED: "Đã mua",
};

const STATUS_COLORS: Record<PurchaseStatus, string> = {
  DRAFT: "secondary",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  PURCHASED: "default",
};

type PurchaseCategory = "DEVICE" | "SUPPLY" | "MAINTENANCE" | "OTHER";

const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  DEVICE: "Thiết bị",
  SUPPLY: "Vật tư",
  MAINTENANCE: "Bảo trì",
  OTHER: "Khác",
};

interface PurchaseItem {
  name: string;
  specification: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes: string | null;
}

interface PurchaseRequest {
  id: string;
  code: string;
  title: string;
  category: PurchaseCategory;
  requester: string;
  department: string;
  status: PurchaseStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  reason: string;
  items: PurchaseItem[];
  total_amount: number;
  created_at: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
}

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
};

const mockPurchases: PurchaseRequest[] = [
  {
    id: "pr-1",
    code: "PR-2024-001",
    title: "Bổ sung găng tay y tế Q4/2024",
    category: "SUPPLY",
    requester: "qtvt@truongy.edu.vn",
    department: "Phòng Quản trị vật tư",
    status: "APPROVED",
    priority: "MEDIUM",
    reason: "Tồn kho găng tay đang ở mức thấp, cần bổ sung cho học kỳ mới",
    items: [
      {
        name: "Găng tay Nitrile không bột",
        specification: "Hộp 100 cái, size M",
        quantity: 100,
        unit: "hộp",
        unit_price: 150000,
        total_price: 15000000,
        notes: null,
      },
      {
        name: "Găng tay Latex có bột",
        specification: "Hộp 100 cái, size M",
        quantity: 50,
        unit: "hộp",
        unit_price: 120000,
        total_price: 6000000,
        notes: null,
      },
    ],
    total_amount: 21000000,
    created_at: "2024-07-01T08:00:00Z",
    submitted_at: "2024-07-01T10:00:00Z",
    approved_by: "admin@truongy.edu.vn",
    approved_at: "2024-07-02T09:00:00Z",
    rejected_reason: null,
  },
  {
    id: "pr-2",
    code: "PR-2024-002",
    title: "Mua bổ sung máy siêu âm di động",
    category: "DEVICE",
    requester: "gv004@truongy.edu.vn",
    department: "Bộ môn Chẩn đoán hình ảnh",
    status: "SUBMITTED",
    priority: "HIGH",
    reason: "Số lượng sinh viên tăng, cần thêm máy để đảm bảo chất lượng giảng dạy",
    items: [
      {
        name: "Máy siêu âm di động Philips Lumify",
        specification: "Kết nối tablet, đầu dò Linear + Convex",
        quantity: 2,
        unit: "máy",
        unit_price: 180000000,
        total_price: 360000000,
        notes: "Ưu tiên model mới nhất",
      },
    ],
    total_amount: 360000000,
    created_at: "2024-07-05T14:00:00Z",
    submitted_at: "2024-07-05T14:30:00Z",
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
  },
  {
    id: "pr-3",
    code: "PR-2024-003",
    title: "Bảo trì máy thở định kỳ",
    category: "MAINTENANCE",
    requester: "qtvt@truongy.edu.vn",
    department: "Bộ môn Gây mê Hồi sức",
    status: "DRAFT",
    priority: "MEDIUM",
    reason: "Bảo trì định kỳ 6 tháng theo khuyến cáo nhà sản xuất",
    items: [
      {
        name: "Dịch vụ bảo trì máy thở PB840",
        specification: "Kiểm tra, thay filter, calibrate",
        quantity: 1,
        unit: "lần",
        unit_price: 15000000,
        total_price: 15000000,
        notes: null,
      },
    ],
    total_amount: 15000000,
    created_at: "2024-07-06T10:00:00Z",
    submitted_at: null,
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
  },
  {
    id: "pr-4",
    code: "PR-2024-004",
    title: "Mua thêm điện cực ECG",
    category: "SUPPLY",
    requester: "qtvt@truongy.edu.vn",
    department: "Phòng Quản trị vật tư",
    status: "REJECTED",
    priority: "LOW",
    reason: "Bổ sung dự trữ",
    items: [
      {
        name: "Điện cực ECG dùng 1 lần",
        specification: "Gói 50 miếng",
        quantity: 100,
        unit: "gói",
        unit_price: 180000,
        total_price: 18000000,
        notes: null,
      },
    ],
    total_amount: 18000000,
    created_at: "2024-06-15T08:00:00Z",
    submitted_at: "2024-06-15T09:00:00Z",
    approved_by: null,
    approved_at: null,
    rejected_reason: "Tồn kho hiện tại vẫn còn đủ dùng 3 tháng, đề xuất lại sau",
  },
];

export default function PurchasesPage() {
  const [purchases] = useState<PurchaseRequest[]>(mockPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("submitted");

  // Detail dialog
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Reject dialog
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const draftPurchases = purchases.filter((p) => p.status === "DRAFT");
  const submittedPurchases = purchases.filter((p) => p.status === "SUBMITTED");
  const processedPurchases = purchases.filter(
    (p) => p.status === "APPROVED" || p.status === "REJECTED" || p.status === "PURCHASED"
  );

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleView = (purchase: PurchaseRequest) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  };

  const handleApprove = () => {
    alert(`Đã duyệt đề xuất "${selectedPurchase?.code}" (demo mode)`);
    setIsDetailOpen(false);
  };

  const handleReject = () => {
    setIsRejectOpen(true);
  };

  const confirmReject = () => {
    alert(`Đã từ chối đề xuất "${selectedPurchase?.code}"\nLý do: ${rejectReason} (demo mode)`);
    setIsRejectOpen(false);
    setIsDetailOpen(false);
    setRejectReason("");
  };

  const handleSubmit = (purchase: PurchaseRequest) => {
    alert(`Đã gửi đề xuất "${purchase.code}" để duyệt (demo mode)`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Stats
  const stats = {
    total: purchases.length,
    draft: draftPurchases.length,
    submitted: submittedPurchases.length,
    approved: purchases.filter((p) => p.status === "APPROVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Đề xuất mua sắm</h2>
          <p className="text-muted-foreground">
            Quản lý đề xuất mua sắm thiết bị, vật tư, bảo trì
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đề xuất
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đề xuất</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.submitted}</div>
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
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="draft">
            Bản nháp
            {stats.draft > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.draft}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Chờ duyệt
            {stats.submitted > 0 && (
              <Badge variant="warning" className="ml-2">
                {stats.submitted}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="processed">Đã xử lý</TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        {/* Draft Tab */}
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Bản nháp</CardTitle>
              <CardDescription>Các đề xuất chưa gửi duyệt</CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseTable
                purchases={draftPurchases}
                onView={handleView}
                onSubmit={handleSubmit}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submitted Tab */}
        <TabsContent value="submitted">
          <Card>
            <CardHeader>
              <CardTitle>Chờ duyệt</CardTitle>
              <CardDescription>Các đề xuất đang chờ phê duyệt</CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseTable
                purchases={submittedPurchases}
                onView={handleView}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processed Tab */}
        <TabsContent value="processed">
          <Card>
            <CardHeader>
              <CardTitle>Đã xử lý</CardTitle>
              <CardDescription>Các đề xuất đã được duyệt hoặc từ chối</CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseTable
                purchases={processedPurchases}
                onView={handleView}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả đề xuất</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo mã, tiêu đề..."
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
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
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
              <PurchaseTable
                purchases={filteredPurchases}
                onView={handleView}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPurchase?.code}</DialogTitle>
            <DialogDescription>{selectedPurchase?.title}</DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-6 py-4">
              {/* Status & Priority */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    STATUS_COLORS[selectedPurchase.status] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "secondary"
                      | "default"
                  }
                >
                  {STATUS_LABELS[selectedPurchase.status]}
                </Badge>
                <Badge
                  variant={
                    PRIORITY_COLORS[selectedPurchase.priority] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "secondary"
                      | "default"
                  }
                >
                  Ưu tiên: {PRIORITY_LABELS[selectedPurchase.priority]}
                </Badge>
                <Badge variant="outline">
                  {CATEGORY_LABELS[selectedPurchase.category]}
                </Badge>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Người đề xuất</Label>
                  <p>{selectedPurchase.requester.split("@")[0]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bộ phận</Label>
                  <p>{selectedPurchase.department}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p>{formatDate(selectedPurchase.created_at)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tổng giá trị</Label>
                  <p className="font-semibold text-lg">
                    {formatCurrency(selectedPurchase.total_amount)}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-muted-foreground">Lý do đề xuất</Label>
                <p className="text-sm mt-1">{selectedPurchase.reason}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Danh sách hàng hóa</h4>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-9 px-3 text-left font-medium">Tên</th>
                        <th className="h-9 px-3 text-left font-medium">Quy cách</th>
                        <th className="h-9 px-3 text-right font-medium">SL</th>
                        <th className="h-9 px-3 text-left font-medium">ĐVT</th>
                        <th className="h-9 px-3 text-right font-medium">Đơn giá</th>
                        <th className="h-9 px-3 text-right font-medium">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPurchase.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="h-10 px-3">{item.name}</td>
                          <td className="h-10 px-3 text-muted-foreground text-xs">
                            {item.specification}
                          </td>
                          <td className="h-10 px-3 text-right">{item.quantity}</td>
                          <td className="h-10 px-3">{item.unit}</td>
                          <td className="h-10 px-3 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="h-10 px-3 text-right font-medium">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="h-10 px-3 text-right font-medium">
                          Tổng cộng:
                        </td>
                        <td className="h-10 px-3 text-right font-bold">
                          {formatCurrency(selectedPurchase.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rejected reason */}
              {selectedPurchase.status === "REJECTED" &&
                selectedPurchase.rejected_reason && (
                  <div className="rounded-md bg-destructive/10 border border-destructive p-3">
                    <Label className="text-destructive">Lý do từ chối</Label>
                    <p className="text-sm mt-1">{selectedPurchase.rejected_reason}</p>
                  </div>
                )}

              {/* Approval info */}
              {selectedPurchase.status === "APPROVED" && (
                <div className="rounded-md bg-green-50 border border-green-200 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Đã duyệt bởi {selectedPurchase.approved_by?.split("@")[0]} vào{" "}
                      {selectedPurchase.approved_at &&
                        formatDate(selectedPurchase.approved_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedPurchase?.status === "SUBMITTED" && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Duyệt
                </Button>
              </>
            )}
            {selectedPurchase?.status !== "SUBMITTED" && (
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đề xuất</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối đề xuất {selectedPurchase?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Lý do từ chối *</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo đề xuất mua sắm</DialogTitle>
            <DialogDescription>
              Tạo đề xuất mua sắm thiết bị, vật tư hoặc bảo trì
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tiêu đề *</Label>
                <Input placeholder="VD: Bổ sung găng tay Q4/2024" />
              </div>
              <div className="grid gap-2">
                <Label>Loại đề xuất *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Mức độ ưu tiên</Label>
              <Select defaultValue="MEDIUM">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Lý do đề xuất *</Label>
              <Textarea placeholder="Nhập lý do cần mua sắm..." rows={3} />
            </div>
            <div className="text-sm text-muted-foreground">
              Sau khi tạo, bạn có thể thêm danh sách hàng hóa chi tiết
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                alert("Đã tạo đề xuất mới (demo mode)");
                setIsCreateOpen(false);
              }}
            >
              Tạo đề xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Purchase Table Component
function PurchaseTable({
  purchases,
  onView,
  onSubmit,
  formatCurrency,
  formatDate,
}: {
  purchases: PurchaseRequest[];
  onView: (p: PurchaseRequest) => void;
  onSubmit?: (p: PurchaseRequest) => void;
  formatCurrency: (v: number) => string;
  formatDate: (d: string) => string;
}) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có đề xuất nào
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-10 px-4 text-left font-medium">Mã</th>
            <th className="h-10 px-4 text-left font-medium">Tiêu đề</th>
            <th className="h-10 px-4 text-left font-medium">Loại</th>
            <th className="h-10 px-4 text-left font-medium">Người đề xuất</th>
            <th className="h-10 px-4 text-right font-medium">Giá trị</th>
            <th className="h-10 px-4 text-center font-medium">Ưu tiên</th>
            <th className="h-10 px-4 text-center font-medium">Trạng thái</th>
            <th className="h-10 px-4 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id} className="border-b hover:bg-muted/50">
              <td className="h-12 px-4 font-medium">{p.code}</td>
              <td className="h-12 px-4 max-w-[200px] truncate">{p.title}</td>
              <td className="h-12 px-4">
                <Badge variant="outline">{CATEGORY_LABELS[p.category]}</Badge>
              </td>
              <td className="h-12 px-4 text-muted-foreground">
                {p.requester.split("@")[0]}
              </td>
              <td className="h-12 px-4 text-right">{formatCurrency(p.total_amount)}</td>
              <td className="h-12 px-4 text-center">
                <Badge
                  variant={
                    PRIORITY_COLORS[p.priority] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "secondary"
                      | "default"
                  }
                >
                  {PRIORITY_LABELS[p.priority]}
                </Badge>
              </td>
              <td className="h-12 px-4 text-center">
                <Badge
                  variant={
                    STATUS_COLORS[p.status] as
                      | "success"
                      | "warning"
                      | "destructive"
                      | "secondary"
                      | "default"
                  }
                >
                  {STATUS_LABELS[p.status]}
                </Badge>
              </td>
              <td className="h-12 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(p)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {p.status === "DRAFT" && onSubmit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSubmit(p)}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      Gửi
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
