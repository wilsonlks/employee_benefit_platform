import type { Metadata } from "next"
import { HomeGate } from "@/components/home-view"

export const metadata: Metadata = { title: "主頁" }

export default function Page() {
  return <HomeGate />
}
