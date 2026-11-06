import type { Metadata } from "next"
import { OfferEditor } from "@/components/offer-form"

export const metadata: Metadata = { title: "上載優惠" }

export default function Page() {
  return <OfferEditor />
}
