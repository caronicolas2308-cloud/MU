import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboard from "./ui";

export default async function AdminPage() {
  const u = await getCurrentUser();
  if (u.role !== "admin") redirect("/login");
  return <AdminDashboard />;
}