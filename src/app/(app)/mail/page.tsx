import type { Metadata } from "next"
import { MailView } from "@/components/mail-view"

export const metadata: Metadata = { title: "內部郵件" }

export default function Page() {
  return <MailView />
}
