'use client';

import { useAuth } from '@/lib/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, FileText, Clock, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const supabase = createClient();

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        { count: totalDevices },
        { count: availableDevices },
        { count: inUseDevices },
        { count: pendingRequests },
      ] = await Promise.all([
        supabase.from('devices').select('*', { count: 'exact', head: true }),
        supabase.from('devices').select('*', { count: 'exact', head: true }).eq('status', 'AVAILABLE'),
        supabase.from('devices').select('*', { count: 'exact', head: true }).eq('status', 'IN_USE'),
        supabase.from('borrow_requests').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),
      ]);

      return {
        totalDevices: totalDevices || 0,
        availableDevices: availableDevices || 0,
        inUseDevices: inUseDevices || 0,
        pendingRequests: pendingRequests || 0,
      };
    },
  });

  // Fetch recent requests for current user (if GIANGVIEN)
  const { data: myRecentRequests } = useQuery({
    queryKey: ['my-recent-requests', user?.id],
    queryFn: async () => {
      if (!user || user.role !== 'GIANGVIEN') return [];
      
      const { data } = await supabase
        .from('borrow_requests')
        .select('*, time_slot:time_slots(*)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Xin chào, {user?.full_name || 'Người dùng'}!</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thiết bị</CardTitle>
            <Monitor className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDevices || 0}</div>
            <p className="text-xs text-gray-500">thiết bị trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sẵn sàng</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.availableDevices || 0}</div>
            <p className="text-xs text-gray-500">thiết bị có thể mượn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang mượn</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.inUseDevices || 0}</div>
            <p className="text-xs text-gray-500">thiết bị đang được sử dụng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingRequests || 0}</div>
            <p className="text-xs text-gray-500">phiếu mượn cần xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent requests for GIANGVIEN */}
      {user?.role === 'GIANGVIEN' && myRecentRequests && myRecentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phiếu mượn gần đây của bạn</CardTitle>
            <CardDescription>5 phiếu mượn gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myRecentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">Ngày {new Date(request.requested_date).toLocaleDateString('vi-VN')}</p>
                    <p className="text-sm text-gray-500">
                      {request.time_slot?.name} - Phòng {request.room || 'Chưa xác định'}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    request.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    request.status === 'IN_USE' ? 'bg-blue-100 text-blue-700' :
                    request.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {request.status === 'DRAFT' && 'Nháp'}
                    {request.status === 'SUBMITTED' && 'Chờ duyệt'}
                    {request.status === 'APPROVED' && 'Đã duyệt'}
                    {request.status === 'REJECTED' && 'Từ chối'}
                    {request.status === 'IN_USE' && 'Đang mượn'}
                    {request.status === 'COMPLETED' && 'Hoàn thành'}
                    {request.status === 'CANCELLED' && 'Đã hủy'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
