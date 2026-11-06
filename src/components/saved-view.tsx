"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { isStaffVisible } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { OfferCard } from "@/components/offer-card"
import { EmptyState, PageHeader } from "@/components/states"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SavedView() {
  const { user, offers, savedIds } = useStore()
  if (!user) return null
  const saved = savedIds
    .map((id) => offers.find((offer) => offer.id === id))
    .filter((offer) => offer && (user.role === "hr" || isStaffVisible(offer)))
  const hidden = savedIds.length - saved.length

  return (
    <div className="grid gap-6">
      <PageHeader title="收藏" description="常用優惠會留在這裡，只屬於你現在這個示範身份。" />
      {saved.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="未有收藏"
          body="在優惠頁按心形，之後可以在這裡快速打開。"
          action={
            <Link href="/offers" className={cn(buttonVariants(), "h-10 px-4")}>
              去看看優惠
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {saved.map((offer) => (
            <OfferCard key={offer!.id} offer={offer!} />
          ))}
        </div>
      )}
      {hidden > 0 ? <p className="text-sm text-muted-foreground">另外 {hidden} 項已下架或過期，所以沒有顯示。</p> : null}
    </div>
  )
}
