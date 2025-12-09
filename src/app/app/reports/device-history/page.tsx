'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDevices, getDeviceBorrowHistory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { BorrowRequestStatus } from '@/types';

const statusLabels: Record<BorrowRequestStatus, string> = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  IN_USE: 'Đang mượn',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export default function DeviceHistoryPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Fetch all devices
  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getDevices(),
  });
  
  // Fetch history for selected device
  const { data: history, isLoading } = useQuery({
    queryKey: ['device-history', selectedDeviceId],
    queryFn: () => getDeviceBorrowHistory(selectedDeviceId),
    enabled: !!selectedDeviceId,
  });
  
  const selectedDevice = devices?.find(d => d.id === selectedDeviceId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử theo thiết bị</h2>
          <p className="text-gray-600">Tra cứu lịch sử mượn của từng thiết bị</p>
        </div>
      </div>

      {/* Device selector */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn thiết bị</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Chọn thiết bị để xem lịch sử..." />
            </SelectTrigger>
            <SelectContent>
              {devices?.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.code} - {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* History table */}
      {selectedDeviceId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Lịch sử mượn: {selectedDevice?.name}
            </CardTitle>
            <CardDescription>
              Mã: {selectedDevice?.code}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : history?.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                Thiết bị này chưa được mượn lần nào
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày mượn</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Người mượn</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.borrow_request?.requested_date), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {item.borrow_request?.time_slot?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {item.borrow_request?.creator?.full_name || '-'}
                      </TableCell>
                      <TableCell>
                        {item.borrow_request?.room || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {statusLabels[item.borrow_request?.status as BorrowRequestStatus] || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/borrow-requests/${item.borrow_request?.id}`}>
                            Xem
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
