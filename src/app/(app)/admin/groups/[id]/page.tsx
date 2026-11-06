import type { Metadata } from "next"
import { GroupEditor } from "@/components/group-form"

export const metadata: Metadata = { title: "編輯團購" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GroupEditor id={id} />
}
