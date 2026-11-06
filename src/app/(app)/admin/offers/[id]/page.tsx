import type { Metadata } from "next"
import { OfferEditor } from "@/components/offer-form"

export const metadata: Metadata = { title: "編輯優惠" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OfferEditor id={id} />
}
