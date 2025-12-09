'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createBorrowRequest, getAvailableDevices, getDeviceCategories } from '@/lib/api';
import { getTimeSlots } from '@/lib/api/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Device, CreateBorrowRequestInput } from '@/types';

export default function NewBorrowRequestPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    requested_date: '',
    time_slot_id: '',
    room: '',
    purpose: '',
    note: '',
  });
  
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch time slots
  const { data: timeSlots } = useQuery({
    queryKey: ['time-slots'],
    queryFn: () => getTimeSlots(true),
  });
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['device-categories'],
    queryFn: getDeviceCategories,
  });
  
  // Fetch available devices based on date and time slot
  const { data: availableDevices, isLoading: devicesLoading } = useQuery({
    queryKey: ['available-devices', formData.requested_date, formData.time_slot_id],
    queryFn: () => getAvailableDevices(formData.requested_date, formData.time_slot_id),
    enabled: !!formData.requested_date && !!formData.time_slot_id,
  });
  
  // Filter devices
  const filteredDevices = availableDevices?.filter(device => {
    const matchesCategory = categoryFilter === 'all' || device.category_id === categoryFilter;
    const matchesSearch = !searchTerm || 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: createBorrowRequest,
    onSuccess: () => {
      toast.success('Tạo phiếu mượn thành công');
      router.push('/app/borrow-requests');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.requested_date) {
      toast.error('Vui lòng chọn ngày mượn');
      return;
    }
    
    if (!formData.time_slot_id) {
      toast.error('Vui lòng chọn ca học');
      return;
    }
    
    if (selectedDevices.length === 0) {
      toast.error('Vui lòng chọn ít nhất một thiết bị');
      return;
    }
    
    const input: CreateBorrowRequestInput = {
      ...formData,
      device_ids: selectedDevices,
    };
    
    createMutation.mutate(input);
  };
  
  const toggleDevice = (deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/borrow-requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tạo phiếu mượn</h2>
          <p className="text-gray-600">Đăng ký mượn thiết bị cho buổi học</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Left: Form info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phiếu mượn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requested_date">Ngày mượn *</Label>
                <Input
                  id="requested_date"
                  type="date"
                  value={formData.requested_date}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, requested_date: e.target.value }));
                    setSelectedDevices([]); // Reset selection when date changes
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time_slot_id">Ca học *</Label>
                <Select 
                  value={formData.time_slot_id}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, time_slot_id: value }));
                    setSelectedDevices([]); // Reset selection when time slot changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca học" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots?.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.name} ({slot.start_time} - {slot.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="room">Phòng học</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="VD: A101"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Mục đích sử dụng</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Mô tả mục đích sử dụng thiết bị..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Ghi chú thêm..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected devices summary */}
          <Card>
            <CardHeader>
              <CardTitle>Thiết bị đã chọn ({selectedDevices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDevices.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa chọn thiết bị nào</p>
              ) : (
                <ul className="space-y-2">
                  {selectedDevices.map(deviceId => {
                    const device = availableDevices?.find(d => d.id === deviceId);
                    return device ? (
                      <li key={deviceId} className="flex items-center justify-between text-sm">
                        <span>{device.name}</span>
                        <span className="font-mono text-gray-500">{device.code}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
              
              <Button 
                type="submit" 
                className="w-full mt-4"
                disabled={createMutation.isPending || selectedDevices.length === 0}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo phiếu mượn
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Device selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Chọn thiết bị</CardTitle>
              <CardDescription>
                {formData.requested_date && formData.time_slot_id
                  ? 'Danh sách thiết bị còn trống trong thời gian đã chọn'
                  : 'Vui lòng chọn ngày và ca học để xem thiết bị còn trống'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formData.requested_date && formData.time_slot_id ? (
                <>
                  {/* Filters */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
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
                  </div>
                  
                  {/* Device list */}
                  {devicesLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredDevices?.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">
                      Không có thiết bị nào còn trống
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredDevices?.map((device) => (
                        <DeviceItem
                          key={device.id}
                          device={device}
                          selected={selectedDevices.includes(device.id)}
                          onToggle={() => toggleDevice(device.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-500">
                  <p>Vui lòng chọn ngày và ca học trước</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

function DeviceItem({ 
  device, 
  selected, 
  onToggle 
}: { 
  device: Device; 
  selected: boolean; 
  onToggle: () => void;
}) {
  return (
    <div 
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
      }`}
      onClick={onToggle}
    >
      <Checkbox checked={selected} onChange={onToggle} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{device.name}</p>
        <p className="text-sm text-gray-500">
          {device.code} • {device.category?.name || 'Chưa phân loại'}
        </p>
      </div>
      {device.current_room && (
        <span className="text-sm text-gray-500">Phòng {device.current_room}</span>
      )}
    </div>
  );
}
