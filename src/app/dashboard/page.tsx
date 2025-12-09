import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Monitor,
  Package,
  AlertTriangle,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";

// Stat card component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {trend && trendValue && (
            <span
              className={`inline-flex items-center mr-1 ${
                trend === "up" ? "text-secondary" : "text-destructive"
              }`}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {trendValue}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// Activity item component
function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string;
  description: string;
  time: string;
  type: "request" | "handover" | "maintenance" | "supply";
}) {
  const colors = {
    request: "bg-blue-100 text-blue-700",
    handover: "bg-green-100 text-green-700",
    maintenance: "bg-orange-100 text-orange-700",
    supply: "bg-purple-100 text-purple-700",
  };

  const icons = {
    request: ClipboardCheck,
    handover: Calendar,
    maintenance: AlertTriangle,
    supply: Package,
  };

  const Icon = icons[type];

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`rounded-full p-2 ${colors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        {time}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Mock data - will be replaced with real data from Supabase
  const stats = [
    {
      title: "Tổng thiết bị",
      value: 156,
      description: "trong kho",
      icon: Monitor,
      trend: "up" as const,
      trendValue: "+5",
    },
    {
      title: "Vật tư tồn kho",
      value: 2480,
      description: "đơn vị các loại",
      icon: Package,
      trend: "down" as const,
      trendValue: "-120",
    },
    {
      title: "Sắp hết hạn",
      value: 12,
      description: "vật tư cần xử lý",
      icon: AlertTriangle,
    },
    {
      title: "Đề xuất chờ duyệt",
      value: 5,
      description: "yêu cầu mua sắm",
      icon: ClipboardCheck,
    },
  ];

  const recentActivities = [
    {
      title: "Đăng ký máy siêu âm - Phòng 301",
      description: "TS. Nguyễn Văn A - Môn Chẩn đoán hình ảnh",
      time: "5 phút",
      type: "request" as const,
    },
    {
      title: "Hoàn tất giao nhận thiết bị",
      description: "Bộ nội soi tiêu hóa - Biên bản #GN-2024-0156",
      time: "1 giờ",
      type: "handover" as const,
    },
    {
      title: "Bảo trì định kỳ",
      description: "Máy chụp X-quang - Phòng 105",
      time: "2 giờ",
      type: "maintenance" as const,
    },
    {
      title: "Nhập kho vật tư",
      description: "Găng tay y tế - 500 hộp",
      time: "3 giờ",
      type: "supply" as const,
    },
    {
      title: "Đăng ký bộ mô phỏng tim mạch",
      description: "ThS. Trần Thị B - Môn Nội khoa",
      time: "5 giờ",
      type: "request" as const,
    },
  ];

  const upcomingSchedules = [
    {
      time: "08:00 - 10:00",
      course: "Giải phẫu học",
      room: "Phòng thực hành A1",
      instructor: "PGS.TS. Lê Văn C",
      equipment: 3,
    },
    {
      time: "10:30 - 12:00",
      course: "Chẩn đoán hình ảnh",
      room: "Phòng siêu âm 301",
      instructor: "TS. Nguyễn Văn A",
      equipment: 2,
    },
    {
      time: "13:30 - 15:30",
      course: "Nội khoa",
      room: "Phòng mô phỏng B2",
      instructor: "ThS. Trần Thị B",
      equipment: 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Xin chào!
        </h2>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý thiết bị và vật tư
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các thay đổi và cập nhật trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch hôm nay</CardTitle>
            <CardDescription>
              Các buổi học có đăng ký thiết bị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSchedules.map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-12 w-16 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                    <span className="text-xs font-medium">
                      {schedule.time.split(" - ")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {schedule.time.split(" - ")[1]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{schedule.course}</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.room}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {schedule.instructor}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />
                    {schedule.equipment}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts section */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Cảnh báo cần xử lý
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-warning/30 bg-white p-4">
              <p className="font-medium text-sm">Vật tư sắp hết hạn</p>
              <p className="text-2xl font-bold text-warning mt-1">12</p>
              <p className="text-xs text-muted-foreground">
                Trong 30 ngày tới
              </p>
            </div>
            <div className="rounded-lg border border-destructive/30 bg-white p-4">
              <p className="font-medium text-sm">Thiết bị cần bảo trì</p>
              <p className="text-2xl font-bold text-destructive mt-1">3</p>
              <p className="text-xs text-muted-foreground">
                Quá hạn bảo trì định kỳ
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-white p-4">
              <p className="font-medium text-sm">Vật tư dưới mức tối thiểu</p>
              <p className="text-2xl font-bold text-primary mt-1">8</p>
              <p className="text-xs text-muted-foreground">Cần đề xuất mua bổ sung</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
