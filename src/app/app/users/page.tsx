'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserRole } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, ShieldCheck, ShieldAlert, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { User as UserType, UserRole } from '@/types';

const roleConfig: Record<UserRole, { label: string; color: string; icon: typeof ShieldCheck }> = {
  ADMIN: { label: 'Quản trị viên', color: 'bg-red-500', icon: ShieldAlert },
  QTVT: { label: 'QT Vật tư', color: 'bg-blue-500', icon: ShieldCheck },
  GIANGVIEN: { label: 'Giảng viên', color: 'bg-green-500', icon: User },
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  
  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Cập nhật quyền thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi: ' + error.message);
    },
  });
  
  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Stats
  const stats = {
    total: users?.length || 0,
    admin: users?.filter(u => u.role === 'ADMIN').length || 0,
    qtvt: users?.filter(u => u.role === 'QTVT').length || 0,
    giangvien: users?.filter(u => u.role === 'GIANGVIEN').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
        <p className="text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Tổng số</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Quản trị viên</p>
          <p className="text-2xl font-bold text-red-600">{stats.admin}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">QT Vật tư</p>
          <p className="text-2xl font-bold text-blue-600">{stats.qtvt}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Giảng viên</p>
          <p className="text-2xl font-bold text-green-600">{stats.giangvien}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo quyền" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            <SelectItem value="QTVT">QT Vật tư</SelectItem>
            <SelectItem value="GIANGVIEN">Giảng viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Quyền</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Phân quyền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                  Không tìm thấy người dùng
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => {
                const config = roleConfig[user.role];
                const Icon = config.icon;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Chưa đặt tên'}</p>
                          <p className="text-sm text-gray-500">{user.department || 'Chưa có khoa'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${config.color} text-white`}>
                        <Icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role}
                        onValueChange={(value: UserRole) => {
                          if (value !== user.role) {
                            updateRoleMutation.mutate({ id: user.id, role: value });
                          }
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4 text-red-500" />
                              Quản trị viên
                            </div>
                          </SelectItem>
                          <SelectItem value="QTVT">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-blue-500" />
                              QT Vật tư
                            </div>
                          </SelectItem>
                          <SelectItem value="GIANGVIEN">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-500" />
                              Giảng viên
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Phân quyền hệ thống</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Quản trị viên (ADMIN):</strong> Toàn quyền hệ thống, quản lý người dùng, cấu hình</li>
          <li><strong>QT Vật tư (QTVT):</strong> Quản lý thiết bị, duyệt phiếu mượn, giao-nhận</li>
          <li><strong>Giảng viên:</strong> Tạo phiếu mượn, xem lịch sử cá nhân</li>
        </ul>
      </div>
    </div>
  );
}
