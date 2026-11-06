import type { Metadata } from "next"
import { AdminDashboard } from "@/components/admin-dashboard"

export const metadata: Metadata = { title: "管理" }

export default function Page() {
  return <AdminDashboard />
}
