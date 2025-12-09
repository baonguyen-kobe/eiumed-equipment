'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBorrowRequest, getHandoverRecords } from '@/lib/api';
import { useAuth, useIsQTVT } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
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

const statusColors: Record<BorrowRequestStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  IN_USE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function BorrowRequestDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const isQTVT = useIsQTVT();
  
  // Fetch request
  const { data: request, isLoading } = useQuery({
    queryKey: ['borrow-request', id],
    queryFn: () => getBorrowRequest(id),
  });
  
  // Fetch handover records
  const { data: handoverRecords } = useQuery({
    queryKey: ['handover-records', id],
    queryFn: () => getHandoverRecords(id),
    enabled: !!request && ['IN_USE', 'COMPLETED'].includes(request.status),
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy phiếu mượn</p>
        <Button asChild className="mt-4">
          <Link href="/app/borrow-requests">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/borrow-requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết phiếu mượn</h2>
          <p className="text-gray-600 text-sm">
            Tạo lúc {format(new Date(request.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
          </p>
        </div>
        <Badge className={`${statusColors[request.status]} text-sm px-3 py-1`}>
          {statusLabels[request.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request info card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin phiếu mượn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày mượn</p>
                    <p className="font-medium">
                      {format(new Date(request.requested_date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ca học</p>
                    <p className="font-medium">
                      {request.time_slot?.name} ({request.time_slot?.start_time} - {request.time_slot?.end_time})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phòng học</p>
                    <p className="font-medium">{request.room || 'Chưa xác định'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Người mượn</p>
                    <p className="font-medium">{request.creator?.full_name || request.creator?.email}</p>
                  </div>
                </div>
              </div>
              
              {(request.purpose || request.note) && (
                <>
                  <Separator className="my-4" />
                  {request.purpose && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Mục đích sử dụng</p>
                      <p>{request.purpose}</p>
                    </div>
                  )}
                  {request.note && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                      <p>{request.note}</p>
                    </div>
                  )}
                </>
              )}
              
              {request.qtvt_note && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-1">Ghi chú từ QTVT</p>
                    <p className="text-blue-900">{request.qtvt_note}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Devices list */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách thiết bị ({request.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên thiết bị</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.device?.code}</TableCell>
                      <TableCell>{item.device?.name}</TableCell>
                      <TableCell>{item.device?.category?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.device?.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Handover history */}
          {handoverRecords && handoverRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử giao nhận</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {handoverRecords.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={record.type === 'ISSUE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                        {record.type === 'ISSUE' ? 'Giao thiết bị' : 'Nhận trả'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(record.performed_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-gray-500">Thực hiện bởi:</span>{' '}
                      <span className="font-medium">{record.performer?.full_name}</span>
                    </p>
                    {record.note && (
                      <p className="text-sm mt-2 text-gray-600">{record.note}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatusStep 
                  label="Tạo phiếu" 
                  date={request.created_at} 
                  completed={true}
                />
                <StatusStep 
                  label="Gửi duyệt" 
                  date={request.status !== 'DRAFT' ? request.created_at : undefined}
                  completed={request.status !== 'DRAFT'}
                />
                <StatusStep 
                  label={request.status === 'REJECTED' ? 'Từ chối' : 'Duyệt'}
                  date={request.approved_at || undefined}
                  completed={['APPROVED', 'REJECTED', 'IN_USE', 'COMPLETED'].includes(request.status)}
                  isRejected={request.status === 'REJECTED'}
                />
                {request.status !== 'REJECTED' && request.status !== 'CANCELLED' && (
                  <>
                    <StatusStep 
                      label="Giao thiết bị" 
                      completed={['IN_USE', 'COMPLETED'].includes(request.status)}
                    />
                    <StatusStep 
                      label="Hoàn thành" 
                      completed={request.status === 'COMPLETED'}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isQTVT && ['APPROVED', 'IN_USE'].includes(request.status) && (
            <Card>
              <CardHeader>
                <CardTitle>Thao tác</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/app/handover?request=${request.id}`}>
                    {request.status === 'APPROVED' ? 'Giao thiết bị' : 'Nhận trả'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Approval info */}
          {request.approver && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin duyệt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="text-gray-500">Người duyệt:</span>{' '}
                  <span className="font-medium">{request.approver.full_name}</span>
                </p>
                {request.approved_at && (
                  <p className="text-sm mt-1">
                    <span className="text-gray-500">Thời gian:</span>{' '}
                    <span>{format(new Date(request.approved_at), 'HH:mm dd/MM/yyyy', { locale: vi })}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusStep({ 
  label, 
  date, 
  completed, 
  isRejected = false 
}: { 
  label: string; 
  date?: string; 
  completed: boolean;
  isRejected?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${
        completed 
          ? isRejected 
            ? 'bg-red-500' 
            : 'bg-green-500'
          : 'bg-gray-200'
      }`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${completed ? '' : 'text-gray-400'}`}>{label}</p>
        {date && (
          <p className="text-xs text-gray-500">
            {format(new Date(date), 'HH:mm dd/MM', { locale: vi })}
          </p>
        )}
      </div>
    </div>
  );
}
