import type { Metadata } from "next"
import { Suspense } from "react"
import { OffersBrowser } from "@/components/offers-browser"
import { PageSkeleton } from "@/components/states"

export const metadata: Metadata = { title: "優惠" }

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OffersBrowser />
    </Suspense>
  )
}
