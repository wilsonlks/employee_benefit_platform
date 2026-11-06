import type { Metadata } from "next"
import { GroupEditor } from "@/components/group-form"

export const metadata: Metadata = { title: "上載團購" }

export default function Page() {
  return <GroupEditor />
}
