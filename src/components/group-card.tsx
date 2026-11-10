"use client"

import Link from "next/link"
import { deadlineHint, formatWhen, GROUP_PHASE_LABEL, groupStatus, signupQty } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import type { GroupBuy } from "@/lib/types"
import { PosterThumb } from "@/components/poster"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function GroupCard({ group }: { group: GroupBuy }) {
  const { user } = useStore()
  const phase = groupStatus(group)
  const quantity = signupQty(group)
  const percent = group.threshold > 0 ? Math.min(100, (quantity / group.threshold) * 100) : 0
  const mine = group.signups.find((signup) => signup.userId === user?.id)
  const hint = deadlineHint(group.deadline)
  return (
    <Link
      href={`/groups/${group.id}`}
      className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {group.image ? <PosterThumb src={group.image} /> : null}
      <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold leading-snug">{group.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{group.merchant}</p>
        </div>
        <Badge variant={phase === "cancelled" ? "outline" : "default"}>{GROUP_PHASE_LABEL[phase]}</Badge>
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-slate-600">{group.summary}</p>
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            {quantity} / {group.threshold} {group.unitLabel}
          </span>
          <span className="text-muted-foreground">{group.priceLabel}</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={group.threshold}
          aria-valuenow={Math.min(quantity, group.threshold)}
          aria-label="報名進度"
        >
          <div className={cn("h-full rounded-full", phase === "cancelled" ? "bg-slate-300" : "bg-primary")} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>截止 {formatWhen(group.deadline)}</span>
        {hint ? <span className="font-semibold text-amber-700">{hint}</span> : null}
        {mine ? (
          <span className="font-semibold text-primary">
            你已報名 {mine.qty} {group.unitLabel}
          </span>
        ) : null}
      </div>
      </div>
    </Link>
  )
}
