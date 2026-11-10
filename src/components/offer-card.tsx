"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { categoryById, formatDay, isEndingSoon, offerPhase } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import type { Offer } from "@/lib/types"
import { PosterThumb } from "@/components/poster"
import { CATEGORY_META } from "@/components/taxonomy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function useSavedToggle(offerId: string) {
  const { savedIds, toggleSaved } = useStore()
  const saved = savedIds.includes(offerId)
  function toggle() {
    toggleSaved(offerId)
    toast.success(saved ? "已取消收藏" : "已加入收藏")
  }
  return { saved, toggle }
}

export function OfferTags({ offer }: { offer: Offer }) {
  const phase = offerPhase(offer)
  return (
    <div className="flex flex-wrap gap-1.5">
      {offer.tags.includes("new") ? <Badge className="bg-secondary text-secondary-foreground">最新</Badge> : null}
      {offer.tags.includes("limited") ? <Badge className="bg-amber-100 text-amber-900">限時</Badge> : null}
      {phase === "upcoming" ? <Badge variant="outline">即將開始</Badge> : null}
      {phase === "live" && isEndingSoon(offer) ? <Badge variant="outline">即將完結</Badge> : null}
      {phase === "expired" ? <Badge variant="destructive">已過期</Badge> : null}
      {phase === "draft" ? <Badge variant="secondary">草案</Badge> : null}
    </div>
  )
}

export function OfferCard({ offer }: { offer: Offer }) {
  const meta = CATEGORY_META[offer.category]
  const { saved, toggle } = useSavedToggle(offer.id)
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-foreground/10">
      {offer.image ? <PosterThumb src={offer.image} /> : <div className={cn("h-1.5", meta.bar)} />}
      <div className="absolute top-4 right-4 z-10">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-pressed={saved}
          aria-label={saved ? "取消收藏" : "收藏"}
          className="size-10 rounded-full bg-white"
          onClick={toggle}
        >
          <Heart className={cn("size-4", saved && "fill-[#15803d] text-[#15803d]")} />
        </Button>
      </div>
      <Link
        href={`/offers/${offer.id}`}
        className="flex flex-1 flex-col gap-3 p-5 pr-16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <p className="text-xs font-semibold text-[#065f46]">{categoryById(offer.category)?.name}</p>
        <OfferTags offer={offer} />
        <div>
          <h3 className="text-lg font-bold leading-snug">{offer.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{offer.merchant}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{offer.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <span className="text-lg font-bold text-[#065f46]">{offer.discount}</span>
          <span className="text-right text-xs leading-5 text-muted-foreground">
            {offer.location}
            <br />至 {formatDay(offer.validUntil)}
          </span>
        </div>
      </Link>
    </article>
  )
}
