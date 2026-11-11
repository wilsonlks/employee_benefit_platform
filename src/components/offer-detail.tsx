"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Copy, Heart, Lock, SearchX } from "lucide-react"
import { toast } from "sonner"
import { categoryById, daysUntil, formatDay, isHistoryOffer, isPeopleTeam, isStaffVisible, offerPhase, OFFER_PHASE_LABEL, queryOffers, todayHK } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { OfferCard, OfferTags, useSavedToggle } from "@/components/offer-card"
import { Poster } from "@/components/poster"
import { EmptyState } from "@/components/states"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function OfferDetail({ id }: { id: string }) {
  const { user, offers, recordView } = useStore()
  const router = useRouter()
  const offer = offers.find((item) => item.id === id)
  const { saved, toggle } = useSavedToggle(id)

  useEffect(() => {
    if (user?.role === "employee" && offer && isStaffVisible(offer)) recordView(offer.id)
  }, [user?.role, offer, recordView])

  if (!user) return null
  if (!offer) {
    return (
      <EmptyState
        icon={SearchX}
        title="找不到這項優惠"
        body="可能已經刪除。返回列表可以繼續查看其他福利。"
        action={
          <Link href="/offers" className={cn(buttonVariants(), "h-10 px-4")}>
            返回優惠
          </Link>
        }
      />
    )
  }

  const staffCanSee = isStaffVisible(offer)
  const history = isHistoryOffer(offer)
  const daysLeft = daysUntil(todayHK(), offer.validUntil)
  if (!staffCanSee && !history && !isPeopleTeam(user.role)) {
    const expired = offerPhase(offer) === "expired"
    return (
      <EmptyState
        icon={expired ? Clock : Lock}
        title={expired ? "這項優惠已過期" : "這項優惠尚未上架"}
        body={expired ? "員工列表已隱藏過期項目。如仍需要，可以請人力資源部更新有效期。" : "人力資源部仍在審核。上架之後才會出現在同事的列表。"}
        action={
          <Link href="/offers" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
            返回優惠
          </Link>
        }
      />
    )
  }

  const related = queryOffers(offers, { staffOnly: true, category: offer.category }).filter((item) => item.id !== offer.id).slice(0, 2)

  async function copyCode() {
    if (!offer?.code) return
    try {
      await navigator.clipboard.writeText(offer.code)
      toast.success("已複製優惠碼")
    } catch {
      toast.error("複製失敗，請手動選取優惠碼")
    }
  }

  return (
    <div className="grid gap-8">
      <div>
        <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="size-4" />
          返回
        </button>
        {history ? (
          <p className="mb-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">此優惠已到期，並已移到歷史專區，只供查閱。</p>
        ) : null}
        {staffCanSee && daysLeft >= 0 && daysLeft <= 3 ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {daysLeft === 0 ? "今天到期。" : `還有 ${daysLeft} 天到期。`}已收藏的同事會收到內部郵件提醒。
          </p>
        ) : null}
        {!staffCanSee && !history ? (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            同事暫時看不到這項優惠（{OFFER_PHASE_LABEL[offerPhase(offer)]}）。
          </p>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="grid gap-5">
            <div>
              <p className="text-sm font-semibold text-[#065f46]">{categoryById(offer.category)?.name}</p>
              <div className="mt-2">
                <OfferTags offer={offer} />
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">{offer.title}</h1>
              <p className="mt-2 text-base text-muted-foreground">{offer.merchant}</p>
              <p className="mt-4 text-base leading-7 text-slate-700">{offer.summary}</p>
            </div>
            <Poster src={offer.image} alt={`${offer.title}海報`} />
            <Section title="優惠內容" body={offer.detail} />
            <Section title="使用方法" body={offer.howToRedeem} />
            {offer.terms ? <Section title="注意事項" body={offer.terms} /> : null}
          </article>
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 lg:sticky lg:top-24">
            <p className="text-3xl font-bold text-[#065f46]">{offer.discount}</p>
            <dl className="mt-4 grid gap-3 text-sm">
              <Row label="有效期" value={`${formatDay(offer.validFrom)} 至 ${formatDay(offer.validUntil)}`} />
              {offer.autoRenew ? <Row label="續期" value="到期後按原期限自動續期" /> : null}
              <Row label="地點" value={offer.location} />
              <Row label="優惠碼" value={offer.code || "無須優惠碼，出示職員證即可"} />
            </dl>
            {offer.code ? (
              <Button type="button" variant="outline" className="mt-4 h-10 w-full" onClick={copyCode}>
                <Copy />
                複製優惠碼
              </Button>
            ) : null}
            <Button type="button" className="mt-3 h-11 w-full" variant={saved ? "secondary" : "default"} onClick={toggle}>
              <Heart className={cn(saved && "fill-current")} />
              {saved ? "已收藏" : "收藏這項優惠"}
            </Button>
            {isPeopleTeam(user.role) ? (
              <Link href={`/admin/offers/${offer.id}`} className={cn(buttonVariants({ variant: "outline" }), "mt-3 h-10 w-full")}>
                編輯
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
      {related.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="text-xl font-bold">同分類的其他優惠</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {related.map((item) => (
              <OfferCard key={item.id} offer={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-foreground/10">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">{body}</p>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-all">{value}</dd>
    </div>
  )
}
