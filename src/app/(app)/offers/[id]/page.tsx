import type { Metadata } from "next"
import { OfferDetail } from "@/components/offer-detail"

export const metadata: Metadata = { title: "優惠詳情" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <OfferDetail id={id} />
}
