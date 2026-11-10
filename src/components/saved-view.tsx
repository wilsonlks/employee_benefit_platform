"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { daysUntil, isPeopleTeam, isStaffVisible, todayHK } from "@/lib/catalog"
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
    .filter((offer) => offer && (isPeopleTeam(user.role) || isStaffVisible(offer)))
  const hidden = savedIds.length - saved.length

  return (
    <div className="grid gap-6">
      <PageHeader title="收藏" description="常用優惠會留在這裡。到期前 3 天，內部系統會寄一封提醒郵件給你。" />
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
        <div className="grid gap-4">
          {saved.some((offer) => {
            const left = daysUntil(todayHK(), offer!.validUntil)
            return left >= 0 && left <= 3
          }) ? (
            <Link href="/mail" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950">
              有收藏將於 3 天內到期，提醒已送到內部郵件。
            </Link>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {saved.map((offer) => (
              <OfferCard key={offer!.id} offer={offer!} />
            ))}
          </div>
        </div>
      )}
      {hidden > 0 ? <p className="text-sm text-muted-foreground">另外 {hidden} 項已下架或過期，所以沒有顯示。</p> : null}
    </div>
  )
}
