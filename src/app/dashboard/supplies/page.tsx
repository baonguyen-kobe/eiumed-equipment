"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Package,
  AlertTriangle,
  Clock,
  PackagePlus,
  PackageMinus,
  ArrowRightLeft,
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
import {
  getSuppliesWithStock,
  getSupplyBatches,
  mockSupplies,
  mockSupplyBatches,
  mockStockMovements,
  getBatchesNearExpiry,
} from "@/data/mock-supplies";
import type {
  Supply,
  SupplyFormData,
  SupplyWithStock,
  SupplyBatch,
  StockMovement,
  MovementType,
} from "@/types/supplies";
import {
  SUPPLY_CATEGORIES,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_COLORS,
  RELATED_MODULE_LABELS,
} from "@/types/supplies";

const STOCK_STATUS_LABELS: Record<string, string> = {
  ok: "Đủ hàng",
  low: "Sắp hết",
  critical: "Hết hàng",
  over: "Vượt tồn",
};

const STOCK_STATUS_COLORS: Record<string, string> = {
  ok: "success",
  low: "warning",
  critical: "destructive",
  over: "secondary",
};

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<SupplyWithStock[]>(
    getSuppliesWithStock()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStockStatus, setFilterStockStatus] = useState<string>("all");

  // Supply dialog state
  const [isSupplyDialogOpen, setIsSupplyDialogOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState<SupplyWithStock | null>(
    null
  );
  const [supplyFormData, setSupplyFormData] = useState<SupplyFormData>({
    code: "",
    name: "",
    unit: "",
    category: "",
    main_supplier: "",
    min_stock: undefined,
    max_stock: undefined,
    notes: "",
  });

  // Batch view dialog state
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedSupplyForBatch, setSelectedSupplyForBatch] =
    useState<SupplyWithStock | null>(null);

  // Stock movement dialog state
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [selectedSupplyForMovement, setSelectedSupplyForMovement] =
    useState<SupplyWithStock | null>(null);
  const [movementType, setMovementType] = useState<MovementType>("IN");
  const [movementFormData, setMovementFormData] = useState({
    batch_id: "",
    quantity: 0,
    reason: "",
    batch_code: "",
    expiry_date: "",
    supplier: "",
    unit_price: undefined as number | undefined,
  });

  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch =
      supply.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supply.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || supply.category === filterCategory;
    const matchesStockStatus =
      filterStockStatus === "all" || supply.stock_status === filterStockStatus;
    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const categories = Array.from(
    new Set(supplies.map((s) => s.category).filter(Boolean))
  );

  // Stats
  const totalSupplies = supplies.length;
  const lowStockCount = supplies.filter(
    (s) => s.stock_status === "low" || s.stock_status === "critical"
  ).length;
  const nearExpiryBatches = getBatchesNearExpiry();
  const expiredBatches = supplies.reduce(
    (sum, s) => sum + s.expired_count,
    0
  );

  // Supply form handlers
  const handleOpenSupplyDialog = (supply?: SupplyWithStock) => {
    if (supply) {
      setEditingSupply(supply);
      setSupplyFormData({
        code: supply.code,
        name: supply.name,
        unit: supply.unit,
        category: supply.category || "",
        main_supplier: supply.main_supplier || "",
        min_stock: supply.min_stock || undefined,
        max_stock: supply.max_stock || undefined,
        notes: supply.notes || "",
      });
    } else {
      setEditingSupply(null);
      setSupplyFormData({
        code: "",
        name: "",
        unit: "",
        category: "",
        main_supplier: "",
        min_stock: undefined,
        max_stock: undefined,
        notes: "",
      });
    }
    setIsSupplyDialogOpen(true);
  };

  const handleSubmitSupply = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSupply) {
      setSupplies((prev) =>
        prev.map((supply) =>
          supply.id === editingSupply.id
            ? {
                ...supply,
                ...supplyFormData,
                category: supplyFormData.category || null,
                main_supplier: supplyFormData.main_supplier || null,
                min_stock: supplyFormData.min_stock || null,
                max_stock: supplyFormData.max_stock || null,
                notes: supplyFormData.notes || null,
                updated_at: new Date().toISOString(),
              }
            : supply
        )
      );
    } else {
      const newSupply: SupplyWithStock = {
        id: `sup-${Date.now()}`,
        code: supplyFormData.code,
        name: supplyFormData.name,
        unit: supplyFormData.unit,
        category: supplyFormData.category || null,
        main_supplier: supplyFormData.main_supplier || null,
        min_stock: supplyFormData.min_stock || null,
        max_stock: supplyFormData.max_stock || null,
        notes: supplyFormData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_stock: 0,
        batches: [],
        stock_status: "critical",
        near_expiry_count: 0,
        expired_count: 0,
      };
      setSupplies((prev) => [...prev, newSupply]);
    }

    setIsSupplyDialogOpen(false);
    setEditingSupply(null);
  };

  const handleDeleteSupply = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa vật tư này?")) {
      setSupplies((prev) => prev.filter((supply) => supply.id !== id));
    }
  };

  // Batch view handlers
  const handleViewBatches = (supply: SupplyWithStock) => {
    setSelectedSupplyForBatch(supply);
    setIsBatchDialogOpen(true);
  };

  // Stock movement handlers
  const handleOpenMovementDialog = (
    supply: SupplyWithStock,
    type: MovementType
  ) => {
    setSelectedSupplyForMovement(supply);
    setMovementType(type);
    setMovementFormData({
      batch_id: "",
      quantity: 0,
      reason: "",
      batch_code: "",
      expiry_date: "",
      supplier: "",
      unit_price: undefined,
    });
    setIsMovementDialogOpen(true);
  };

  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo mode, just close the dialog
    // Real implementation would update batches and create movement record
    alert(
      `${MOVEMENT_TYPE_LABELS[movementType]}: ${movementFormData.quantity} ${selectedSupplyForMovement?.unit}`
    );
    setIsMovementDialogOpen(false);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vật tư tiêu hao</h2>
          <p className="text-muted-foreground">
            Quản lý vật tư và theo dõi tồn kho
          </p>
        </div>
        <Button onClick={() => handleOpenSupplyDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm vật tư
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng vật tư</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSupplies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần đặt hàng</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Tồn kho thấp / hết hàng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp hết hạn</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {nearExpiryBatches.length}
            </div>
            <p className="text-xs text-muted-foreground">Lô trong 60 ngày tới</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hết hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {expiredBatches}
            </div>
            <p className="text-xs text-muted-foreground">Cần xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã, tên vật tư..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat!}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStockStatus} onValueChange={setFilterStockStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(STOCK_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách vật tư</CardTitle>
          <CardDescription>
            Hiển thị {filteredSupplies.length} / {supplies.length} vật tư
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Mã</th>
                  <th className="h-10 px-4 text-left font-medium">Tên vật tư</th>
                  <th className="h-10 px-4 text-left font-medium">ĐVT</th>
                  <th className="h-10 px-4 text-left font-medium">Danh mục</th>
                  <th className="h-10 px-4 text-right font-medium">Tồn kho</th>
                  <th className="h-10 px-4 text-right font-medium">
                    Min / Max
                  </th>
                  <th className="h-10 px-4 text-center font-medium">
                    Trạng thái
                  </th>
                  <th className="h-10 px-4 text-center font-medium">HSD</th>
                  <th className="h-10 px-4 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredSupplies.map((supply) => (
                    <tr key={supply.id} className="border-b hover:bg-muted/50">
                      <td className="h-12 px-4 font-medium">
                        <button
                          onClick={() => handleViewBatches(supply)}
                          className="text-primary hover:underline"
                        >
                          {supply.code}
                        </button>
                      </td>
                      <td className="h-12 px-4">{supply.name}</td>
                      <td className="h-12 px-4 text-muted-foreground">
                        {supply.unit}
                      </td>
                      <td className="h-12 px-4">
                        {supply.category ? (
                          <Badge variant="outline">{supply.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="h-12 px-4 text-right font-medium">
                        {supply.current_stock}
                      </td>
                      <td className="h-12 px-4 text-right text-muted-foreground">
                        {supply.min_stock ?? "-"} / {supply.max_stock ?? "-"}
                      </td>
                      <td className="h-12 px-4 text-center">
                        <Badge
                          variant={
                            STOCK_STATUS_COLORS[supply.stock_status] as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                              | "success"
                              | "warning"
                          }
                        >
                          {STOCK_STATUS_LABELS[supply.stock_status]}
                        </Badge>
                      </td>
                      <td className="h-12 px-4 text-center">
                        {supply.expired_count > 0 ? (
                          <Badge variant="destructive">
                            {supply.expired_count} hết hạn
                          </Badge>
                        ) : supply.near_expiry_count > 0 ? (
                          <Badge variant="warning">
                            {supply.near_expiry_count} sắp hạn
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="h-12 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Nhập kho"
                            onClick={() => handleOpenMovementDialog(supply, "IN")}
                          >
                            <PackagePlus className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xuất kho"
                            onClick={() => handleOpenMovementDialog(supply, "OUT")}
                          >
                            <PackageMinus className="h-4 w-4 text-yellow-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xem lô hàng"
                            onClick={() => handleViewBatches(supply)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenSupplyDialog(supply)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSupply(supply.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Supply Form Dialog */}
      <Dialog open={isSupplyDialogOpen} onOpenChange={setIsSupplyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupply ? "Chỉnh sửa vật tư" : "Thêm vật tư mới"}
            </DialogTitle>
            <DialogDescription>
              {editingSupply
                ? "Cập nhật thông tin vật tư"
                : "Nhập thông tin vật tư mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSupply}>
            <div className="grid gap-4 py-4">
              {/* Row 1: Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã vật tư *</Label>
                  <Input
                    id="code"
                    placeholder="VD: VT-GT-001"
                    value={supplyFormData.code}
                    onChange={(e) =>
                      setSupplyFormData({
                        ...supplyFormData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên vật tư *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Găng tay Nitrile"
                    value={supplyFormData.name}
                    onChange={(e) =>
                      setSupplyFormData({
                        ...supplyFormData,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 2: Unit & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="unit">Đơn vị tính *</Label>
                  <Input
                    id="unit"
                    placeholder="VD: hộp, chai, gói..."
                    value={supplyFormData.unit}
                    onChange={(e) =>
                      setSupplyFormData({
                        ...supplyFormData,
                        unit: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Select
                    value={supplyFormData.category || "none"}
                    onValueChange={(value) =>
                      setSupplyFormData({
                        ...supplyFormData,
                        category: value === "none" ? "" : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không chọn --</SelectItem>
                      {SUPPLY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Supplier */}
              <div className="grid gap-2">
                <Label htmlFor="main_supplier">Nhà cung cấp chính</Label>
                <Input
                  id="main_supplier"
                  placeholder="VD: Công ty ABC"
                  value={supplyFormData.main_supplier}
                  onChange={(e) =>
                    setSupplyFormData({
                      ...supplyFormData,
                      main_supplier: e.target.value,
                    })
                  }
                />
              </div>

              {/* Row 4: Min/Max Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="min_stock">Tồn kho tối thiểu</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    placeholder="VD: 50"
                    value={supplyFormData.min_stock || ""}
                    onChange={(e) =>
                      setSupplyFormData({
                        ...supplyFormData,
                        min_stock: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_stock">Tồn kho tối đa</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    placeholder="VD: 200"
                    value={supplyFormData.max_stock || ""}
                    onChange={(e) =>
                      setSupplyFormData({
                        ...supplyFormData,
                        max_stock: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 5: Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  placeholder="Ghi chú thêm về vật tư..."
                  value={supplyFormData.notes}
                  onChange={(e) =>
                    setSupplyFormData({
                      ...supplyFormData,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSupplyDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {editingSupply ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch View Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết lô hàng</DialogTitle>
            <DialogDescription>
              {selectedSupplyForBatch?.code} - {selectedSupplyForBatch?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedSupplyForBatch && (
              <>
                {/* Summary */}
                <div className="flex items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
                    <p className="text-2xl font-bold">
                      {selectedSupplyForBatch.current_stock}{" "}
                      {selectedSupplyForBatch.unit}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge
                      variant={
                        STOCK_STATUS_COLORS[
                          selectedSupplyForBatch.stock_status
                        ] as "success" | "warning" | "destructive" | "secondary"
                      }
                    >
                      {STOCK_STATUS_LABELS[selectedSupplyForBatch.stock_status]}
                    </Badge>
                  </div>
                </div>

                {/* Batches Table */}
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium">
                          Mã lô
                        </th>
                        <th className="h-10 px-4 text-left font-medium">
                          Hạn sử dụng
                        </th>
                        <th className="h-10 px-4 text-right font-medium">
                          SL ban đầu
                        </th>
                        <th className="h-10 px-4 text-right font-medium">
                          SL còn lại
                        </th>
                        <th className="h-10 px-4 text-left font-medium">
                          Nhà cung cấp
                        </th>
                        <th className="h-10 px-4 text-right font-medium">
                          Đơn giá
                        </th>
                        <th className="h-10 px-4 text-center font-medium">
                          Tình trạng
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSupplyForBatch.batches.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
                          >
                            Chưa có lô hàng nào
                          </td>
                        </tr>
                      ) : (
                        selectedSupplyForBatch.batches.map((batch) => (
                          <tr
                            key={batch.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="h-12 px-4 font-medium">
                              {batch.batch_code || "-"}
                            </td>
                            <td className="h-12 px-4">
                              {formatDate(batch.expiry_date)}
                              {batch.days_until_expiry != null && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({batch.days_until_expiry > 0 ? `còn ${batch.days_until_expiry} ngày` : "đã hết hạn"})
                                </span>
                              )}
                            </td>
                            <td className="h-12 px-4 text-right">
                              {batch.initial_quantity}
                            </td>
                            <td className="h-12 px-4 text-right font-medium">
                              {batch.remaining_quantity}
                            </td>
                            <td className="h-12 px-4 text-muted-foreground">
                              {batch.supplier || "-"}
                            </td>
                            <td className="h-12 px-4 text-right">
                              {formatCurrency(batch.unit_price)}
                            </td>
                            <td className="h-12 px-4 text-center">
                              {batch.is_expired ? (
                                <Badge variant="destructive">Hết hạn</Badge>
                              ) : batch.is_near_expiry ? (
                                <Badge variant="warning">Sắp hạn</Badge>
                              ) : batch.remaining_quantity === 0 ? (
                                <Badge variant="secondary">Đã dùng hết</Badge>
                              ) : (
                                <Badge variant="success">Còn hàng</Badge>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBatchDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {movementType === "IN"
                ? "Nhập kho"
                : movementType === "OUT"
                ? "Xuất kho"
                : "Điều chỉnh tồn kho"}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplyForMovement?.code} -{" "}
              {selectedSupplyForMovement?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitMovement}>
            <div className="grid gap-4 py-4">
              {movementType === "IN" && (
                <>
                  {/* New batch info for IN */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="batch_code">Mã lô</Label>
                      <Input
                        id="batch_code"
                        placeholder="VD: LOT-2024-001"
                        value={movementFormData.batch_code}
                        onChange={(e) =>
                          setMovementFormData({
                            ...movementFormData,
                            batch_code: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expiry_date">Hạn sử dụng</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={movementFormData.expiry_date}
                        onChange={(e) =>
                          setMovementFormData({
                            ...movementFormData,
                            expiry_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="supplier">Nhà cung cấp</Label>
                      <Input
                        id="supplier"
                        placeholder="VD: Công ty ABC"
                        value={movementFormData.supplier}
                        onChange={(e) =>
                          setMovementFormData({
                            ...movementFormData,
                            supplier: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit_price">Đơn giá (VND)</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        placeholder="VD: 150000"
                        value={movementFormData.unit_price || ""}
                        onChange={(e) =>
                          setMovementFormData({
                            ...movementFormData,
                            unit_price: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {movementType === "OUT" && selectedSupplyForMovement && (
                <div className="grid gap-2">
                  <Label htmlFor="batch_id">Chọn lô xuất *</Label>
                  <Select
                    value={movementFormData.batch_id}
                    onValueChange={(value) =>
                      setMovementFormData({
                        ...movementFormData,
                        batch_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lô hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedSupplyForMovement.batches
                        .filter((b) => b.remaining_quantity > 0 && !b.is_expired)
                        .map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batch_code || "Không có mã"} - Còn{" "}
                            {batch.remaining_quantity} - HSD:{" "}
                            {formatDate(batch.expiry_date)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="quantity">
                  Số lượng ({selectedSupplyForMovement?.unit}) *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="VD: 50"
                  value={movementFormData.quantity || ""}
                  onChange={(e) =>
                    setMovementFormData({
                      ...movementFormData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min={1}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Lý do</Label>
                <Textarea
                  id="reason"
                  placeholder={
                    movementType === "IN"
                      ? "VD: Nhập kho đợt 1/2024"
                      : movementType === "OUT"
                      ? "VD: Xuất cho buổi thực hành"
                      : "VD: Kiểm kê điều chỉnh"
                  }
                  value={movementFormData.reason}
                  onChange={(e) =>
                    setMovementFormData({
                      ...movementFormData,
                      reason: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMovementDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {movementType === "IN" ? "Nhập kho" : "Xuất kho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
