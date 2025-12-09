'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeviceCategories, createDeviceCategory, updateDeviceCategory, deleteDeviceCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DeviceCategory } from '@/types';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DeviceCategory | null>(null);
  
  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['device-categories'],
    queryFn: getDeviceCategories,
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDeviceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
      setIsCreateDialogOpen(false);
      toast.success('Thêm danh mục thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; code_prefix: string; description: string }> }) => 
      updateDeviceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
      setEditingCategory(null);
      toast.success('Cập nhật danh mục thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDeviceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] });
      toast.success('Xóa danh mục thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh mục thiết bị</h2>
          <p className="text-gray-600">Quản lý các danh mục phân loại thiết bị</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CategoryForm 
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Tiền tố mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                  Chưa có danh mục nào
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono">{category.code_prefix}</TableCell>
                  <TableCell className="max-w-xs truncate">{category.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <CategoryForm 
              initialData={editingCategory}
              onSubmit={(data) => updateMutation.mutate({ id: editingCategory.id, data })}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CategoryForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData?: DeviceCategory;
  onSubmit: (data: { name: string; code_prefix: string; description?: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code_prefix: initialData?.code_prefix || '',
    description: initialData?.description || '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code_prefix) {
      toast.error('Vui lòng nhập tên và tiền tố mã');
      return;
    }
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogDescription>
          Nhập thông tin danh mục thiết bị
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên danh mục *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="VD: Máy chiếu"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code_prefix">Tiền tố mã *</Label>
          <Input
            id="code_prefix"
            value={formData.code_prefix}
            onChange={(e) => setFormData(prev => ({ ...prev, code_prefix: e.target.value.toUpperCase() }))}
            placeholder="VD: MC"
            required
          />
          <p className="text-xs text-gray-500">
            Tiền tố sẽ được dùng để tạo mã thiết bị tự động (VD: MC0001)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Mô tả về danh mục..."
            rows={3}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
