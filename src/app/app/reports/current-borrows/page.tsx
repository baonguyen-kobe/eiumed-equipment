'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentBorrows } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CurrentBorrowsPage() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ['current-borrows'],
    queryFn: getCurrentBorrows,
  });

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
          <h2 className="text-2xl font-bold text-gray-900">Thiết bị đang mượn</h2>
          <p className="text-gray-600">Danh sách tất cả thiết bị đang được mượn</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tổng số: {devices?.length || 0} thiết bị</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : devices?.length === 0 ? (
            <p className="text-center py-10 text-gray-500">
              Không có thiết bị nào đang được mượn
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên thiết bị</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Người mượn</TableHead>
                  <TableHead>Ngày mượn</TableHead>
                  <TableHead>Ca</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices?.map((device) => {
                  const currentReservation = device.reservations?.find(
                    (r: { borrow_request: { status: string } }) => 
                      r.borrow_request?.status === 'IN_USE'
                  );
                  const borrowRequest = currentReservation?.borrow_request;
                  
                  return (
                    <TableRow key={device.id}>
                      <TableCell className="font-mono">{device.code}</TableCell>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.category?.name || '-'}</TableCell>
                      <TableCell>
                        {borrowRequest?.creator?.full_name || '-'}
                      </TableCell>
                      <TableCell>
                        {currentReservation?.date 
                          ? format(new Date(currentReservation.date), 'dd/MM/yyyy', { locale: vi })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {currentReservation?.borrow_request?.time_slot?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/app/devices/${device.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
