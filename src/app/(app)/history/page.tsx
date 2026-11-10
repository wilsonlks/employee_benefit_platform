import type { Metadata } from "next"
import { HistoryView } from "@/components/history-view"

export const metadata: Metadata = { title: "歷史專區" }

export default function Page() {
  return <HistoryView />
}
