"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Lock, SearchX } from "lucide-react"
import { toast } from "sonner"
import {
  formatWhen,
  GROUP_PHASE_LABEL,
  GROUP_PHASE_NOTE,
  groupStatus,
  isGroupOpen,
  isPeopleTeam,
  maxQtyFor,
  signupQty,
} from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { Poster } from "@/components/poster"
import { EmptyState } from "@/components/states"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function GroupDetail({ id }: { id: string }) {
  const { user, groups, setSignup } = useStore()
  const router = useRouter()
  const group = groups.find((item) => item.id === id)
  const mine = group?.signups.find((signup) => signup.userId === user?.id)
  const [qty, setQty] = useState(mine?.qty ?? 1)

  useEffect(() => {
    setQty(mine?.qty || 1)
  }, [mine?.qty])

  if (!user) return null
  if (!group) {
    return (
      <EmptyState
        icon={SearchX}
        title="找不到這個團購"
        body="可能已經刪除。返回列表可以查看其他活動。"
        action={
          <Link href="/groups" className={cn(buttonVariants(), "h-10 px-4")}>
            返回團購
          </Link>
        }
      />
    )
  }
  if (!group.published && !isPeopleTeam(user.role)) {
    return (
      <EmptyState
        icon={Lock}
        title="這個團購尚未上架"
        body="人力資源部仍在準備。上架之後同事才可以報名。"
        action={
          <Link href="/groups" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
            返回團購
          </Link>
        }
      />
    )
  }

  const phase = groupStatus(group)
  const open = isGroupOpen(group)
  const quantity = signupQty(group)
  const people = group.signups.length
  const max = maxQtyFor(group, user.id)
  const percent = group.threshold > 0 ? Math.min(100, (quantity / group.threshold) * 100) : 0

  function submit(next: number) {
    const result = setSignup(group!.id, next)
    toast[result.ok ? "success" : "error"](result.message)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="grid gap-5">
        <div>
          <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            <ArrowLeft className="size-4" />
            返回
          </button>
          {!group.published ? (
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">同事暫時看不到這個團購。</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={phase === "cancelled" ? "outline" : "default"}>{GROUP_PHASE_LABEL[phase]}</Badge>
            <span className="text-sm text-muted-foreground">{group.merchant}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{group.title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-700">{group.summary}</p>
        </div>
        <Poster src={group.image} alt={`${group.title}海報`} />
        <section className="rounded-2xl bg-white p-5 ring-1 ring-foreground/10">
          <h2 className="text-lg font-bold">活動詳情</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">{group.detail}</p>
          <p className="mt-4 text-sm text-muted-foreground">{GROUP_PHASE_NOTE[phase]}</p>
        </section>
        {isPeopleTeam(user.role) ? (
          <section className="rounded-2xl bg-white p-5 ring-1 ring-foreground/10">
            <h2 className="text-lg font-bold">報名名單</h2>
            <p className="mt-1 text-sm text-muted-foreground">同事只看到總數，看不到個別姓名。</p>
            {group.signups.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">未有人報名。</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="border-b text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-3 font-medium">同事</th>
                      <th className="py-2 pr-3 font-medium">部門</th>
                      <th className="py-2 pr-3 font-medium">數量</th>
                      <th className="py-2 font-medium">報名時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...group.signups]
                      .sort((a, b) => a.at.localeCompare(b.at))
                      .map((signup) => (
                        <tr key={signup.userId} className="border-b last:border-0">
                          <td className="py-2 pr-3 font-medium">{signup.name}</td>
                          <td className="py-2 pr-3">{signup.dept}</td>
                          <td className="py-2 pr-3">
                            {signup.qty} {group.unitLabel}
                          </td>
                          <td className="py-2">{formatWhen(signup.at)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </article>
      <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 lg:sticky lg:top-24">
        <p className="text-3xl font-bold text-[#065f46]">{group.priceLabel}</p>
        <p className="text-sm text-muted-foreground">每 {group.unitLabel}</p>
        <p className="mt-4 text-sm font-medium">
          已報 {quantity} / {group.threshold} {group.unitLabel}
          {people > 0 ? `（${people} 位同事）` : ""}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={group.threshold} aria-valuenow={Math.min(quantity, group.threshold)} aria-label="報名進度">
          <div className={cn("h-full rounded-full", phase === "cancelled" ? "bg-slate-300" : "bg-primary")} style={{ width: `${percent}%` }} />
        </div>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">截止</dt>
            <dd className="text-right font-medium">{formatWhen(group.deadline)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">每人上限</dt>
            <dd className="font-medium">
              {group.perPerson} {group.unitLabel}
            </dd>
          </div>
          {group.limit != null ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">名額上限</dt>
              <dd className="font-medium">
                {group.limit} {group.unitLabel}
              </dd>
            </div>
          ) : null}
        </dl>
        {open ? (
          <div className="mt-5 grid gap-3">
            {mine ? (
              <p className="text-sm font-medium text-primary">
                你已報名 {mine.qty} {group.unitLabel}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">你還沒有報名。</p>
            )}
            {max < 1 && !mine ? (
              <p className="text-sm text-muted-foreground">名額已滿。</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">報名數量</span>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" aria-label="減少" onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={qty <= 1}>
                      −
                    </Button>
                    <span className="w-8 text-center text-lg font-bold">{qty}</span>
                    <Button type="button" variant="outline" size="icon" aria-label="增加" onClick={() => setQty((value) => Math.min(max, value + 1))} disabled={qty >= max}>
                      +
                    </Button>
                  </div>
                </div>
                <Button type="button" className="h-11" onClick={() => submit(qty)} disabled={max < 1}>
                  {mine ? "更新報名" : "確認報名"}
                </Button>
              </>
            )}
            {mine ? (
              <Button type="button" variant="ghost" onClick={() => submit(0)}>
                取消報名
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            {mine ? `你曾報名 ${mine.qty} ${group.unitLabel}。` : "現在不能再改報名。"}
            {GROUP_PHASE_NOTE[phase]}
          </p>
        )}
        {isPeopleTeam(user.role) ? (
          <Link href={`/admin/groups/${group.id}`} className={cn(buttonVariants({ variant: "outline" }), "mt-4 h-10 w-full")}>
            編輯團購
          </Link>
        ) : null}
      </aside>
    </div>
  )
}
