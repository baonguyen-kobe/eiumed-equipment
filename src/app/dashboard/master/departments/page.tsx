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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockDepartments } from "@/data/mock-master";
import type { Department, DepartmentFormData } from "@/types/master";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [formData, setFormData] = useState<DepartmentFormData>({
    code: "",
    name: "",
    description: "",
  });

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        code: department.code,
        name: department.name,
        description: department.description || "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({ code: "", name: "", description: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDepartment(null);
    setFormData({ code: "", name: "", description: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDepartment) {
      // Update existing
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartment.id
            ? {
                ...dept,
                ...formData,
                updated_at: new Date().toISOString(),
              }
            : dept
        )
      );
    } else {
      // Create new
      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setDepartments((prev) => [...prev, newDepartment]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa bộ môn này?")) {
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Khoa / Bộ môn</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách các khoa và bộ môn trong trường
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
          <CardDescription>
            Tổng cộng {filteredDepartments.length} bộ môn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Mã</th>
                  <th className="h-10 px-4 text-left font-medium">Tên</th>
                  <th className="h-10 px-4 text-left font-medium">Mô tả</th>
                  <th className="h-10 px-4 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept) => (
                    <tr key={dept.id} className="border-b">
                      <td className="h-12 px-4 font-medium">{dept.code}</td>
                      <td className="h-12 px-4">{dept.name}</td>
                      <td className="h-12 px-4 text-muted-foreground">
                        {dept.description || "-"}
                      </td>
                      <td className="h-12 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(dept)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(dept.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Chỉnh sửa bộ môn" : "Thêm bộ môn mới"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Cập nhật thông tin bộ môn"
                : "Nhập thông tin bộ môn mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã bộ môn *</Label>
                <Input
                  id="code"
                  placeholder="VD: NOI, NGOAI, SAN..."
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên bộ môn *</Label>
                <Input
                  id="name"
                  placeholder="VD: Bộ môn Nội"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về bộ môn..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Hủy
              </Button>
              <Button type="submit">
                {editingDepartment ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
