'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDevice, getDeviceEvents, createDeviceEvent, updateDevice } from '@/lib/api';
import { useIsQTVT } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft, Plus, Loader2, QrCode, Printer, Calendar, Wrench } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import type { DeviceStatus, DeviceEventType, CreateDeviceEventInput } from '@/types';

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

const eventTypeLabels: Record<DeviceEventType, string> = {
  MAINTENANCE: 'Bảo trì',
  REPAIR: 'Sửa chữa',
  NOTE: 'Ghi chú',
  LOST: 'Báo mất',
  FOUND: 'Tìm thấy',
};

export default function DeviceDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const canManage = useIsQTVT();
  const queryClient = useQueryClient();
  
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  
  // Fetch device
  const { data: device, isLoading } = useQuery({
    queryKey: ['device', id],
    queryFn: () => getDevice(id),
  });
  
  // Fetch device events
  const { data: events } = useQuery({
    queryKey: ['device-events', id],
    queryFn: () => getDeviceEvents(id),
  });
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: DeviceStatus) => updateDevice(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device', id] });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: createDeviceEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-events', id] });
      setIsEventDialogOpen(false);
      toast.success('Thêm sự kiện thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!device) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy thiết bị</p>
        <Button asChild className="mt-4">
          <Link href="/app/devices">Quay lại</Link>
        </Button>
      </div>
    );
  }
  
  const deviceUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/app/devices/${id}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/devices">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{device.name}</h2>
          <p className="text-gray-600 font-mono">{device.code}</p>
        </div>
        <Badge className={statusColors[device.status]}>
          {statusLabels[device.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thiết bị</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Danh mục</dt>
                  <dd className="font-medium">{device.category?.name || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Model</dt>
                  <dd className="font-medium">{device.model || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Nhà sản xuất</dt>
                  <dd className="font-medium">{device.vendor || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Số serial</dt>
                  <dd className="font-medium font-mono">{device.serial_number || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phòng hiện tại</dt>
                  <dd className="font-medium">{device.current_room || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Ngày mua</dt>
                  <dd className="font-medium">
                    {device.purchase_date 
                      ? new Date(device.purchase_date).toLocaleDateString('vi-VN')
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Hết bảo hành</dt>
                  <dd className="font-medium">
                    {device.warranty_expiry 
                      ? new Date(device.warranty_expiry).toLocaleDateString('vi-VN')
                      : '-'}
                  </dd>
                </div>
              </dl>
              
              {device.notes && (
                <div className="mt-4 pt-4 border-t">
                  <dt className="text-sm text-gray-500 mb-1">Ghi chú</dt>
                  <dd className="text-gray-700">{device.notes}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events Tab */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lý lịch thiết bị</CardTitle>
                <CardDescription>Lịch sử bảo trì, sửa chữa và ghi chú</CardDescription>
              </div>
              
              {canManage && (
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm sự kiện
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <EventForm 
                      deviceId={id}
                      onSubmit={(data) => createEventMutation.mutate(data)}
                      isLoading={createEventMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {events?.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Chưa có sự kiện nào</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Người thực hiện</TableHead>
                      <TableHead>Chi phí</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {new Date(event.event_date).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {eventTypeLabels[event.event_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>{event.performer?.full_name || '-'}</TableCell>
                        <TableCell>
                          {event.cost 
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(event.cost)
                            : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{event.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Mã QR
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white border rounded-lg">
                <QRCodeSVG value={deviceUrl} size={150} />
              </div>
              <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    In QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>In mã QR</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center py-6" id="qr-print-area">
                    <QRCodeSVG value={deviceUrl} size={200} />
                    <p className="mt-4 font-mono font-bold">{device.code}</p>
                    <p className="text-sm text-gray-600">{device.name}</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => window.print()}>
                      <Printer className="mr-2 h-4 w-4" />
                      In
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Select 
                  value={device.status}
                  onValueChange={(value) => updateStatusMutation.mutate(value as DeviceStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsEventDialogOpen(true)}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Ghi nhận bảo trì
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Event Form Component
function EventForm({ 
  deviceId, 
  onSubmit, 
  isLoading 
}: { 
  deviceId: string;
  onSubmit: (data: CreateDeviceEventInput) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreateDeviceEventInput>({
    device_id: deviceId,
    event_type: 'NOTE',
    event_date: new Date().toISOString().split('T')[0],
    notes: '',
    cost: undefined,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Thêm sự kiện</DialogTitle>
        <DialogDescription>
          Ghi nhận hoạt động bảo trì, sửa chữa hoặc ghi chú cho thiết bị
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Loại sự kiện</Label>
            <Select 
              value={formData.event_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value as DeviceEventType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Ngày</Label>
            <Input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Chi phí (VND)</Label>
          <Input
            type="number"
            value={formData.cost || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              cost: e.target.value ? Number(e.target.value) : undefined 
            }))}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Ghi chú</Label>
          <Textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Mô tả chi tiết..."
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Thêm sự kiện
        </Button>
      </DialogFooter>
    </form>
  );
}
