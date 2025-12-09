'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevices, getDeviceCategories, createDevice, updateDevice, deleteDevice, generateDeviceCode } from '@/lib/api';
import { useIsQTVT } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Device, DeviceStatus, CreateDeviceInput } from '@/types';

const statusLabels: Record<DeviceStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  IN_USE: 'Đang mượn',
  UNDER_MAINTENANCE: 'Bảo trì',
  LOST: 'Mất',
  RETIRED: 'Thanh lý',
};

const statusColors: Record<DeviceStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  IN_USE: 'bg-blue-100 text-blue-700',
  UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-700',
  LOST: 'bg-red-100 text-red-700',
  RETIRED: 'bg-gray-100 text-gray-700',
};

export default function DevicesPage() {
  const canManage = useIsQTVT();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  // Fetch data
  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices', { search, category: categoryFilter, status: statusFilter }],
    queryFn: () => getDevices({
      search: search || undefined,
      category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
  });
  
  const { data: categories } = useQuery({
    queryKey: ['device-categories'],
    queryFn: getDeviceCategories,
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsCreateDialogOpen(false);
      toast.success('Thêm thiết bị thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDeviceInput> }) => 
      updateDevice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setEditingDevice(null);
      toast.success('Cập nhật thiết bị thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Xóa thiết bị thành công');
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Thiết bị</h2>
          <p className="text-gray-600">Danh sách tất cả thiết bị trong hệ thống</p>
        </div>
        
        {canManage && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thiết bị
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DeviceForm 
                categories={categories || []}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên thiết bị</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : devices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  Không có thiết bị nào
                </TableCell>
              </TableRow>
            ) : (
              devices?.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-mono font-medium">{device.code}</TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.category?.name || '-'}</TableCell>
                  <TableCell>{device.model || '-'}</TableCell>
                  <TableCell>{device.current_room || '-'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[device.status]}>
                      {statusLabels[device.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/app/devices/${device.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {canManage && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingDevice(device)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              if (confirm('Bạn có chắc muốn xóa thiết bị này?')) {
                                deleteMutation.mutate(device.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingDevice && (
        <Dialog open={!!editingDevice} onOpenChange={() => setEditingDevice(null)}>
          <DialogContent className="max-w-2xl">
            <DeviceForm 
              categories={categories || []}
              initialData={editingDevice}
              onSubmit={(data) => updateMutation.mutate({ id: editingDevice.id, data })}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Device Form Component
function DeviceForm({ 
  categories, 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  categories: { id: string; name: string; code_prefix: string }[];
  initialData?: Device;
  onSubmit: (data: CreateDeviceInput) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateDeviceInput>({
    code: initialData?.code || '',
    name: initialData?.name || '',
    category_id: initialData?.category_id || '',
    serial_number: initialData?.serial_number || '',
    model: initialData?.model || '',
    vendor: initialData?.vendor || '',
    purchase_date: initialData?.purchase_date || '',
    warranty_expiry: initialData?.warranty_expiry || '',
    current_room: initialData?.current_room || '',
    notes: initialData?.notes || '',
  });
  
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  
  const handleGenerateCode = async () => {
    if (!formData.category_id) {
      toast.error('Vui lòng chọn danh mục trước');
      return;
    }
    
    setIsGeneratingCode(true);
    try {
      const code = await generateDeviceCode(formData.category_id);
      setFormData(prev => ({ ...prev, code }));
    } catch (error) {
      toast.error('Không thể tạo mã thiết bị');
    } finally {
      setIsGeneratingCode(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Vui lòng nhập mã và tên thiết bị');
      return;
    }
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</DialogTitle>
        <DialogDescription>
          Nhập thông tin thiết bị. Các trường có dấu * là bắt buộc.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Danh mục</Label>
            <Select 
              value={formData.category_id || ''} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Mã thiết bị *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="VD: MC0001"
                required
              />
              {!initialData && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                >
                  {isGeneratingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo mã'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Tên thiết bị *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="VD: Máy chiếu Epson EB-X51"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="VD: EB-X51"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor">Nhà sản xuất</Label>
            <Input
              id="vendor"
              value={formData.vendor || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
              placeholder="VD: Epson"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serial_number">Số serial</Label>
            <Input
              id="serial_number"
              value={formData.serial_number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="current_room">Phòng hiện tại</Label>
            <Input
              id="current_room"
              value={formData.current_room || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, current_room: e.target.value }))}
              placeholder="VD: A101"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_date">Ngày mua</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="warranty_expiry">Hết bảo hành</Label>
            <Input
              id="warranty_expiry"
              type="date"
              value={formData.warranty_expiry || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Ghi chú</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
