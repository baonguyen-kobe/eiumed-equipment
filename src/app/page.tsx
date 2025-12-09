import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to dashboard or login based on auth status
  // For now, redirect to login
  redirect("/login");
}

// Updated email domain to @eiu.edu.vn
