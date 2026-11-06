import type { Metadata } from "next"
import { GroupsView } from "@/components/groups-view"

export const metadata: Metadata = { title: "團購" }

export default function Page() {
  return <GroupsView />
}
