"use client"

import Link from "next/link"
import { Archive } from "lucide-react"
import { isHistoryOffer } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { OfferCard } from "@/components/offer-card"
import { EmptyState, PageHeader } from "@/components/states"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HistoryView() {
  const { user, offers } = useStore()
  if (!user) return null
  const history = offers.filter((offer) => isHistoryOffer(offer)).sort((a, b) => b.validUntil.localeCompare(a.validUntil))

  return (
    <div className="grid gap-6">
      <PageHeader
        title="歷史專區"
        description="已到期、並設定為保留查閱的優惠會放在這裡。這些優惠不能再使用。設定為直接下架的項目不會出現。"
        actions={
          <Link href="/offers" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
            返回優惠
          </Link>
        }
      />
      {history.length === 0 ? (
        <EmptyState icon={Archive} title="歷史專區未有項目" body="優惠到期後，如果沒有自動續期或直接下架，就會出現在這裡。" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {history.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
