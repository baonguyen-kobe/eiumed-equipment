"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Monitor,
  Package,
  Calendar,
  ClipboardList,
  FileCheck,
  ShoppingCart,
  BarChart3,
  Settings,
  Stethoscope,
  Building2,
  BookOpen,
  Clock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const mainNavItems = [
  {
    title: "Trang chủ",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
];

const managementNavItems = [
  {
    title: "Thiết bị",
    href: "/dashboard/devices",
    icon: Monitor,
  },
  {
    title: "Vật tư",
    href: "/dashboard/supplies",
    icon: Package,
  },
];

const operationNavItems = [
  {
    title: "Lịch giảng dạy",
    href: "/dashboard/schedules",
    icon: Calendar,
  },
  {
    title: "Đăng ký thiết bị",
    href: "/dashboard/requests",
    icon: ClipboardList,
  },
  {
    title: "Giao - Nhận",
    href: "/dashboard/handovers",
    icon: FileCheck,
  },
];

const adminNavItems = [
  {
    title: "Đề xuất mua sắm",
    href: "/dashboard/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Báo cáo",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
];

const masterNavItems = [
  {
    title: "Phòng học",
    href: "/dashboard/master/rooms",
    icon: Building2,
  },
  {
    title: "Môn học",
    href: "/dashboard/master/courses",
    icon: BookOpen,
  },
  {
    title: "Slot giờ",
    href: "/dashboard/master/time-slots",
    icon: Clock,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({
    item,
  }: {
    item: { title: string; href: string; icon: React.ComponentType<{ className?: string }> };
  }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {item.title}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-card",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">MedEdu</span>
          <span className="text-xs text-muted-foreground">Equipment</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {/* Main */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Quản lý */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quản lý
          </p>
          <div className="mt-2 space-y-1">
            {managementNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Vận hành */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Vận hành
          </p>
          <div className="mt-2 space-y-1">
            {operationNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Hành chính */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Hành chính
          </p>
          <div className="mt-2 space-y-1">
            {adminNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Danh mục */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Danh mục
          </p>
          <div className="mt-2 space-y-1">
            {masterNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Settings */}
      <div className="border-t p-4">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Cài đặt
        </Link>
      </div>
    </aside>
  );
}
