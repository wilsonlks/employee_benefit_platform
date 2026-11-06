import type { Metadata } from "next"
import { GroupDetail } from "@/components/group-detail"

export const metadata: Metadata = { title: "團購詳情" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GroupDetail id={id} />
}
