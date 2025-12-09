'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBorrowRequests, approveBorrowRequest, rejectBorrowRequest, cancelBorrowRequest } from '@/lib/api';
import { useAuth, useIsQTVT } from '@/lib/hooks';
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Eye, CheckCircle, XCircle, Loader2, Ban } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { BorrowRequestStatus } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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

export default function BorrowRequestsPage() {
  const { user } = useAuth();
  const isQTVT = useIsQTVT();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [qtvtNote, setQtvtNote] = useState('');
  
  // Fetch requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['borrow-requests', { 
      status: statusFilter, 
      created_by: isQTVT ? undefined : user?.id,
      date_from: dateFrom,
      date_to: dateTo,
    }],
    queryFn: () => getBorrowRequests({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      created_by: isQTVT ? undefined : user?.id,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    enabled: !!user,
  });
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => approveBorrowRequest(id, note),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
        setApproveDialogOpen(false);
        setQtvtNote('');
        toast.success('Duyệt phiếu mượn thành công');
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
        if (result.conflicts) {
          const conflictMessage = result.conflicts.map(c => 
            `${c.device_code} - ${c.device_name} (đã được mượn bởi ${c.conflicting_borrower})`
          ).join('\n');
          toast.error('Thiết bị bị trùng:\n' + conflictMessage, { duration: 10000 });
        }
      }
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => rejectBorrowRequest(id, note),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
        setRejectDialogOpen(false);
        setQtvtNote('');
        toast.success('Đã từ chối phiếu mượn');
      } else {
        toast.error(result.error || 'Có lỗi xảy ra');
      }
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: cancelBorrowRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrow-requests'] });
      toast.success('Đã hủy phiếu mượn');
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
          <h2 className="text-2xl font-bold text-gray-900">Phiếu mượn</h2>
          <p className="text-gray-600">
            {isQTVT ? 'Quản lý tất cả phiếu mượn' : 'Phiếu mượn của bạn'}
          </p>
        </div>
        
        <Button asChild>
          <Link href="/app/borrow-requests/new">
            <Plus className="mr-2 h-4 w-4" />
            Tạo phiếu mượn
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
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
        
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px]"
            placeholder="Từ ngày"
          />
          <span className="text-gray-500">-</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px]"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày mượn</TableHead>
              <TableHead>Ca</TableHead>
              <TableHead>Phòng</TableHead>
              {isQTVT && <TableHead>Người mượn</TableHead>}
              <TableHead>Thiết bị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isQTVT ? 7 : 6} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : requests?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isQTVT ? 7 : 6} className="text-center py-10 text-gray-500">
                  Không có phiếu mượn nào
                </TableCell>
              </TableRow>
            ) : (
              requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.requested_date), 'dd/MM/yyyy', { locale: vi })}
                  </TableCell>
                  <TableCell>{request.time_slot?.name || '-'}</TableCell>
                  <TableCell>{request.room || '-'}</TableCell>
                  {isQTVT && (
                    <TableCell>{request.creator?.full_name || request.creator?.email}</TableCell>
                  )}
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {request.items?.length || 0} thiết bị
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/app/borrow-requests/${request.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {isQTVT && request.status === 'SUBMITTED' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-green-600"
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setApproveDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'DRAFT' && request.created_by === user?.id && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn hủy phiếu này?')) {
                              cancelMutation.mutate(request.id);
                            }
                          }}
                        >
                          <Ban className="h-4 w-4 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt phiếu mượn</DialogTitle>
            <DialogDescription>
              Xác nhận duyệt phiếu mượn này. Hệ thống sẽ kiểm tra trùng lịch thiết bị.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ghi chú QTVT (tùy chọn)</Label>
              <Textarea
                value={qtvtNote}
                onChange={(e) => setQtvtNote(e.target.value)}
                placeholder="Ghi chú cho người mượn..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => {
                if (selectedRequestId) {
                  approveMutation.mutate({ id: selectedRequestId, note: qtvtNote });
                }
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối phiếu mượn</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để thông báo cho người mượn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lý do từ chối</Label>
              <Textarea
                value={qtvtNote}
                onChange={(e) => setQtvtNote(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedRequestId) {
                  rejectMutation.mutate({ id: selectedRequestId, note: qtvtNote });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
