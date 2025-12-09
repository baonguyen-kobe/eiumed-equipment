export type UserRole = "admin" | "qtvt" | "giangvien" | "lanhdao";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
}
