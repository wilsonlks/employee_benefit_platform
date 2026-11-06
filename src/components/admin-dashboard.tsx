"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import {
  asGroupDraft,
  asOfferDraft,
  categoryById,
  formatDay,
  formatWhen,
  GROUP_PHASE_LABEL,
  groupStatus,
  OFFER_PHASE_LABEL,
  offerPhase,
  signupQty,
  type OfferPhase,
} from "@/lib/catalog"
import { useStore } from "@/lib/store"
import type { GroupBuy, Offer } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader, StaffBlocked } from "@/components/states"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type OfferFilter = "all" | OfferPhase

const FILTERS: { id: OfferFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "live", label: "上架中" },
  { id: "upcoming", label: "即將開始" },
  { id: "draft", label: "草案" },
  { id: "expired", label: "已過期" },
]

export function AdminDashboard() {
  const { user, offers, groups, saveOffer, deleteOffer, saveGroup, deleteGroup } = useStore()
  const [filter, setFilter] = useState<OfferFilter>("all")
  const [section, setSection] = useState<"offers" | "groups">("offers")
  const [pending, setPending] = useState<{ kind: "offer" | "group"; id: string; title: string } | null>(null)
  if (!user) return null
  if (user.role !== "hr") return <StaffBlocked />

  const visibleOffers = offers.filter((offer) => filter === "all" || offerPhase(offer) === filter)
  const counts = {
    live: offers.filter((offer) => offerPhase(offer) === "live").length,
    draft: offers.filter((offer) => !offer.published).length,
    expired: offers.filter((offer) => offerPhase(offer) === "expired").length,
    groups: groups.filter((group) => group.published && ["open", "reached"].includes(groupStatus(group))).length,
  }

  function toggleOffer(offer: Offer) {
    saveOffer({ ...asOfferDraft(offer), published: !offer.published })
    toast.success(offer.published ? "已下架" : "已上架")
  }

  function toggleGroup(group: GroupBuy) {
    saveGroup({ ...asGroupDraft(group), published: !group.published })
    toast.success(group.published ? "團購已下架" : "團購已上架")
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="人事部管理"
        description="上載、審核和維護優惠及團購。一般員工不能在這裡改內容。"
        actions={
          <>
            <Link href="/admin/offers/new" className={cn(buttonVariants(), "h-10 px-4")}>
              上載優惠
            </Link>
            <Link href="/admin/groups/new" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
              上載團購
            </Link>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="上架中" value={counts.live} />
        <Stat label="草案" value={counts.draft} />
        <Stat label="已過期" value={counts.expired} />
        <Stat label="進行中團購" value={counts.groups} />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant={section === "offers" ? "default" : "outline"} onClick={() => setSection("offers")}>
          優惠
        </Button>
        <Button type="button" variant={section === "groups" ? "default" : "outline"} onClick={() => setSection("groups")}>
          團購
        </Button>
      </div>
      {section === "offers" ? (
        <div className="grid gap-3">
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium",
                  filter === item.id ? "border-primary bg-secondary text-secondary-foreground" : "bg-white text-slate-600",
                )}
                aria-pressed={filter === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="divide-y overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10">
            {visibleOffers.length === 0 ? <p className="px-4 py-8 text-sm text-muted-foreground">這個篩選沒有項目。</p> : null}
            {visibleOffers.map((offer) => {
              const phase = offerPhase(offer)
              return (
                <div key={offer.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/offers/${offer.id}`} className="font-bold hover:underline">
                        {offer.title}
                      </Link>
                      <Badge variant={phase === "expired" ? "destructive" : phase === "draft" ? "secondary" : "outline"}>
                        {OFFER_PHASE_LABEL[phase]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {offer.merchant} · {categoryById(offer.category)?.name} · {formatDay(offer.validFrom)} 至 {formatDay(offer.validUntil)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleOffer(offer)}>
                      {offer.published ? "下架" : "上架"}
                    </Button>
                    <Link href={`/admin/offers/${offer.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      編輯
                    </Link>
                    <Button type="button" variant="destructive" size="sm" onClick={() => setPending({ kind: "offer", id: offer.id, title: offer.title })}>
                      刪除
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10">
          {groups.length === 0 ? <p className="px-4 py-8 text-sm text-muted-foreground">未有團購。</p> : null}
          {groups.map((group) => {
            const phase = groupStatus(group)
            return (
              <div key={group.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/groups/${group.id}`} className="font-bold hover:underline">
                      {group.title}
                    </Link>
                    <Badge variant={group.published ? "outline" : "secondary"}>{group.published ? GROUP_PHASE_LABEL[phase] : "草案"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {signupQty(group)} / {group.threshold} {group.unitLabel} · 截止 {formatWhen(group.deadline)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleGroup(group)}>
                    {group.published ? "下架" : "上架"}
                  </Button>
                  <Link href={`/admin/groups/${group.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    編輯
                  </Link>
                  <Button type="button" variant="destructive" size="sm" onClick={() => setPending({ kind: "group", id: group.id, title: group.title })}>
                    刪除
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <ConfirmDialog
        open={pending != null}
        title={pending ? `刪除「${pending.title}」？` : "刪除？"}
        description="這個動作只影響這個瀏覽器的示範資料。"
        confirmLabel="刪除"
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        onConfirm={() => {
          if (!pending) return
          if (pending.kind === "offer") deleteOffer(pending.id)
          else deleteGroup(pending.id)
          toast.success("已刪除")
          setPending(null)
        }}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#065f46]">{value}</p>
    </Card>
  )
}
