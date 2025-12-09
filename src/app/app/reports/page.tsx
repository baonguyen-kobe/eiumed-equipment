'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, History, Users, BarChart2 } from 'lucide-react';

const reportItems = [
  {
    title: 'Thiết bị đang mượn',
    description: 'Xem danh sách thiết bị đang được mượn',
    href: '/app/reports/current-borrows',
    icon: Monitor,
  },
  {
    title: 'Lịch sử theo thiết bị',
    description: 'Tra cứu lịch sử mượn của từng thiết bị',
    href: '/app/reports/device-history',
    icon: History,
  },
  {
    title: 'Lịch sử theo người dùng',
    description: 'Tra cứu lịch sử mượn của giảng viên',
    href: '/app/reports/user-history',
    icon: Users,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Báo cáo</h2>
        <p className="text-gray-600">Các báo cáo và thống kê</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
