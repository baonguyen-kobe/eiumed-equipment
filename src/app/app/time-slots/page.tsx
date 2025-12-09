'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import type { TimeSlot } from '@/types';

export default function TimeSlotsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  
  // Fetch time slots (include inactive)
  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ['time-slots-all'],
    queryFn: () => getTimeSlots(false),
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: createTimeSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      setIsCreateDialogOpen(false);
      toast.success('Thêm ca học thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ code: string; name: string; start_time: string; end_time: string; is_active: boolean }> }) => 
      updateTimeSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      setEditingSlot(null);
      toast.success('Cập nhật ca học thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTimeSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Xóa ca học thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  const toggleActive = (slot: TimeSlot) => {
    updateMutation.mutate({ id: slot.id, data: { is_active: !slot.is_active } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý ca học</h2>
          <p className="text-gray-600">Cấu hình các ca học trong ngày</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm ca học
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TimeSlotForm 
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
              <TableHead>Mã</TableHead>
              <TableHead>Tên ca</TableHead>
              <TableHead>Giờ bắt đầu</TableHead>
              <TableHead>Giờ kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : timeSlots?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  Chưa có ca học nào
                </TableCell>
              </TableRow>
            ) : (
              timeSlots?.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-mono font-medium">{slot.code}</TableCell>
                  <TableCell>{slot.name}</TableCell>
                  <TableCell>{slot.start_time}</TableCell>
                  <TableCell>{slot.end_time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slot.is_active}
                        onCheckedChange={() => toggleActive(slot)}
                      />
                      <span className={slot.is_active ? 'text-green-600' : 'text-gray-400'}>
                        {slot.is_active ? 'Hoạt động' : 'Tắt'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingSlot(slot)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa ca học này?')) {
                            deleteMutation.mutate(slot.id);
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
      {editingSlot && (
        <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
          <DialogContent>
            <TimeSlotForm 
              initialData={editingSlot}
              onSubmit={(data) => updateMutation.mutate({ id: editingSlot.id, data })}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function TimeSlotForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData?: TimeSlot;
  onSubmit: (data: { code: string; name: string; start_time: string; end_time: string }) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.start_time || !formData.end_time) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật ca học' : 'Thêm ca học mới'}</DialogTitle>
        <DialogDescription>
          Nhập thông tin ca học
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Mã ca *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="VD: CA1"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Tên ca *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="VD: Ca 1 (Sáng sớm)"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_time">Giờ bắt đầu *</Label>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end_time">Giờ kết thúc *</Label>
            <Input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              required
            />
          </div>
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
