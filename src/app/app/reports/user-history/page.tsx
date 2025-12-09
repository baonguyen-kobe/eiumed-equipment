'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getUserBorrowHistory } from '@/lib/api';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
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

export default function UserHistoryPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  
  // Fetch history for selected user
  const { data: history, isLoading } = useQuery({
    queryKey: ['user-history', selectedUserId],
    queryFn: () => getUserBorrowHistory(selectedUserId),
    enabled: !!selectedUserId,
  });
  
  const selectedUser = users?.find(u => u.id === selectedUserId);

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
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử theo người dùng</h2>
          <p className="text-gray-600">Tra cứu lịch sử mượn của giảng viên</p>
        </div>
      </div>

      {/* User selector */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Chọn người dùng để xem lịch sử..." />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* History table */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Lịch sử mượn: {selectedUser?.full_name || selectedUser?.email}
            </CardTitle>
            <CardDescription>
              Email: {selectedUser?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : history?.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                Người dùng này chưa mượn thiết bị nào
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày mượn</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Số thiết bị</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {format(new Date(request.requested_date), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {request.time_slot?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {request.room || '-'}
                      </TableCell>
                      <TableCell>
                        {request.items?.length || 0}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/borrow-requests/${request.id}`}>
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
