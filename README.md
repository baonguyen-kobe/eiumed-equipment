# MedEdu Equipment

Hệ thống Quản lý Thiết bị - Vật tư - Lịch Dạy Y Khoa

## Tình trạng dự án

Dự án đang được triển khai theo lộ trình 8 bước. Đến thời điểm hiện tại, hệ thống đã hoàn thiện các module chính.

### Các STEP đã hoàn thành

| STEP | Nội dung | Trạng thái |
|------|----------|------------|
| 1 | App Shell & Auth | Hoàn thành |
| 2 | Master Data (Bộ môn, Phòng, Môn học, Khung giờ) | Hoàn thành |
| 3 | Thiết bị & QR Code | Hoàn thành |
| 4 | Vật tư & Tồn kho | Hoàn thành |
| 5 | Lịch giảng dạy & Đăng ký thiết bị/vật tư | Hoàn thành |
| 6 | Giao - Nhận | Hoàn thành |
| 7 | Đề xuất mua sắm | Hoàn thành |
| 8 | Báo cáo & Dashboard | Chưa triển khai |

### Tính năng hiện có

- **Dashboard**: Tổng quan hệ thống với các thống kê
- **Quản lý Thiết bị**: CRUD, QR Code, Log bảo trì/sửa chữa
- **Quản lý Vật tư**: Tồn kho theo lô, cảnh báo HSD, nhập/xuất kho
- **Lịch giảng dạy**: View theo tuần, tạo buổi học
- **Đăng ký thiết bị/vật tư**: Flow đăng ký, kiểm tra xung đột, duyệt/từ chối
- **Giao - Nhận**: Quản lý giao nhận thiết bị cho buổi học
- **Đề xuất mua sắm**: Tạo đề xuất, duyệt, theo dõi trạng thái
- **Danh mục cơ sở**: Bộ môn, Phòng học, Môn học, Khung giờ

## Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Font**: Be Vietnam Pro
- **Icons**: Lucide React

## Cài đặt

### 1. Clone repository

```bash
git clone <repo-url>
cd mededu-equipment
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Lưu ý**: Nếu chưa có Supabase, có thể dùng placeholder URL để chạy demo mode:

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
```

### 3. Chạy database migrations (nếu có Supabase)

```bash
supabase db push
```

Hoặc chạy từng file trong thư mục `supabase/migrations/`:
- `001_master_data.sql`
- `002_devices.sql`
- `003_supplies.sql`
- `004_schedules_requests.sql`

### 4. Chạy development server

```bash
npm run dev
```

Truy cập: http://localhost:3000

## Cấu trúc thư mục

```
src/
├── app/
│   ├── dashboard/
│   │   ├── devices/          # Quản lý thiết bị
│   │   ├── supplies/         # Quản lý vật tư
│   │   ├── schedules/        # Lịch giảng dạy
│   │   ├── requests/         # Đăng ký thiết bị/vật tư
│   │   ├── handovers/        # Giao - Nhận
│   │   ├── purchases/        # Đề xuất mua sắm
│   │   └── master/           # Danh mục cơ sở
│   └── login/
├── components/
│   ├── layout/               # Sidebar, Header
│   └── ui/                   # shadcn/ui components
├── data/
│   ├── mock-master.ts        # Mock data danh mục
│   ├── mock-devices.ts       # Mock data thiết bị
│   ├── mock-supplies.ts      # Mock data vật tư
│   └── mock-schedules.ts     # Mock data lịch & đăng ký
├── lib/
│   ├── supabase/             # Supabase client
│   ├── devices/              # QR utilities
│   └── schedules/            # Queries, mutations, conflict-checker
└── types/
    ├── master.ts
    ├── devices.ts
    ├── supplies.ts
    └── schedules.ts
```

## Các trang chính

| Trang | URL | Mô tả |
|-------|-----|-------|
| Dashboard | `/dashboard` | Tổng quan hệ thống |
| Thiết bị | `/dashboard/devices` | Danh sách & CRUD thiết bị |
| Chi tiết thiết bị | `/dashboard/devices/[id]` | QR Code, logs |
| Vật tư | `/dashboard/supplies` | Tồn kho, nhập/xuất |
| Lịch giảng dạy | `/dashboard/schedules` | View tuần, tạo buổi học |
| Đăng ký | `/dashboard/requests` | Đăng ký & duyệt TB/VT |
| Giao - Nhận | `/dashboard/handovers` | Giao nhận thiết bị |
| Đề xuất mua sắm | `/dashboard/purchases` | Tạo & duyệt đề xuất |
| Phòng học | `/dashboard/master/rooms` | CRUD phòng |
| Môn học | `/dashboard/master/courses` | CRUD môn học |
| Khung giờ | `/dashboard/master/time-slots` | CRUD slot giờ |

## Demo Mode

Khi chưa cấu hình Supabase thực, hệ thống tự động chạy ở **Demo Mode**:
- Sử dụng mock data có sẵn
- Đầy đủ tính năng UI để preview
- Các thao tác CRUD hoạt động trong session (không lưu DB)

## Scripts

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run start    # Chạy production server
npm run lint     # Kiểm tra linting
```

## Lộ trình phát triển tiếp theo

1. **STEP 8**: Dashboard báo cáo tổng hợp
2. Multi-role & phân quyền nâng cao
3. Xuất báo cáo PDF/Excel
4. Quy trình kiểm kê theo đợt
5. Tích hợp Supabase Auth với Google OAuth

## License

Private - Medical Education Equipment Management System
