'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useIsAdmin, useIsQTVT } from '@/lib/hooks';
import {
  LayoutDashboard,
  Monitor,
  FileText,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Users,
  Clock,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('ADMIN' | 'QTVT' | 'GIANGVIEN')[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: LayoutDashboard,
  },
  {
    title: 'Thiết bị',
    href: '/app/devices',
    icon: Monitor,
  },
  {
    title: 'Phiếu mượn',
    href: '/app/borrow-requests',
    icon: FileText,
  },
  {
    title: 'Giao - Nhận',
    href: '/app/handover',
    icon: ArrowLeftRight,
    roles: ['ADMIN', 'QTVT'],
  },
  {
    title: 'Báo cáo',
    href: '/app/reports',
    icon: BarChart3,
  },
  {
    title: 'Ca học',
    href: '/app/time-slots',
    icon: Clock,
    roles: ['ADMIN'],
  },
  {
    title: 'Người dùng',
    href: '/app/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Danh mục',
    href: '/app/categories',
    icon: Settings,
    roles: ['ADMIN', 'QTVT'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isQTVT = useIsQTVT();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/app" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              Y
            </div>
            <span className="font-semibold text-gray-900">Quản lý TB</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/app' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User role indicator */}
        <div className="border-t p-4">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">Vai trò</p>
            <p className="font-medium text-gray-900">
              {user?.role === 'ADMIN' && 'Quản trị viên'}
              {user?.role === 'QTVT' && 'Quản trị vật tư'}
              {user?.role === 'GIANGVIEN' && 'Giảng viên'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
