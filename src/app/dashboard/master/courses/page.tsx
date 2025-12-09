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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockDepartments, getEnrichedCourses } from "@/data/mock-master";
import type { Course, CourseFormData } from "@/types/master";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(getEnrichedCourses());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    code: "",
    name: "",
    department_id: "",
    description: "",
    credits: undefined,
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || course.department_id === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        code: course.code,
        name: course.name,
        department_id: course.department_id || "",
        description: course.description || "",
        credits: course.credits || undefined,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        code: "",
        name: "",
        department_id: "",
        description: "",
        credits: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const department = formData.department_id
      ? mockDepartments.find((d) => d.id === formData.department_id)
      : null;

    if (editingCourse) {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourse.id
            ? {
                ...course,
                ...formData,
                department_id: formData.department_id || null,
                department: department || null,
                description: formData.description || null,
                credits: formData.credits || null,
                updated_at: new Date().toISOString(),
              }
            : course
        )
      );
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        code: formData.code,
        name: formData.name,
        department_id: formData.department_id || null,
        department: department || null,
        description: formData.description || null,
        credits: formData.credits || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCourses((prev) => [...prev, newCourse]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa môn học này?")) {
      setCourses((prev) => prev.filter((course) => course.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Môn học</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách các môn học trong chương trình đào tạo
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
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[200px]">
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
          <CardTitle>Danh sách môn học</CardTitle>
          <CardDescription>
            Tổng cộng {filteredCourses.length} môn học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Mã</th>
                  <th className="h-10 px-4 text-left font-medium">Tên môn học</th>
                  <th className="h-10 px-4 text-left font-medium">Bộ môn</th>
                  <th className="h-10 px-4 text-center font-medium">
                    Số tín chỉ
                  </th>
                  <th className="h-10 px-4 text-left font-medium">Mô tả</th>
                  <th className="h-10 px-4 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b">
                      <td className="h-12 px-4 font-medium">{course.code}</td>
                      <td className="h-12 px-4">{course.name}</td>
                      <td className="h-12 px-4">
                        {course.department ? (
                          <Badge variant="outline">
                            {course.department.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="h-12 px-4 text-center">
                        {course.credits ? (
                          <Badge variant="secondary">{course.credits} TC</Badge>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="h-12 px-4 text-muted-foreground max-w-xs truncate">
                        {course.description || "-"}
                      </td>
                      <td className="h-12 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(course)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(course.id)}
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
              {editingCourse ? "Chỉnh sửa môn học" : "Thêm môn học mới"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Cập nhật thông tin môn học"
                : "Nhập thông tin môn học mới"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Mã môn học *</Label>
                  <Input
                    id="code"
                    placeholder="VD: NOI101"
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
                  <Label htmlFor="credits">Số tín chỉ</Label>
                  <Input
                    id="credits"
                    type="number"
                    placeholder="VD: 3"
                    min={1}
                    max={10}
                    value={formData.credits || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credits: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên môn học *</Label>
                <Input
                  id="name"
                  placeholder="VD: Nội khoa cơ sở"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Bộ môn phụ trách</Label>
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
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về môn học..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
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
                {editingCourse ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
