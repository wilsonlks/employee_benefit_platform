"use client"

import { Users } from "lucide-react"
import { groupStatus } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { GroupCard } from "@/components/group-card"
import { EmptyState, PageHeader } from "@/components/states"

export function GroupsView() {
  const { user, groups } = useStore()
  if (!user) return null
  const published = groups.filter((group) => group.published)
  const active = published
    .filter((group) => ["open", "reached"].includes(groupStatus(group)))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  const closed = published
    .filter((group) => ["success", "cancelled"].includes(groupStatus(group)))
    .sort((a, b) => b.deadline.localeCompare(a.deadline))

  return (
    <div className="grid gap-8">
      <PageHeader
        title="團購"
        description="人事部設定人數門檻和截止時間。系統會統計報名：達標就成團，截止仍未達標則自動取消。"
      />
      {published.length === 0 ? (
        <EmptyState icon={Users} title="暫時沒有團購" body="新的團購上架之後會出現在這裡。" />
      ) : (
        <>
          <section className="grid gap-4">
            <h2 className="text-xl font-bold">進行中</h2>
            {active.length === 0 ? (
              <p className="rounded-2xl bg-white px-5 py-8 text-sm text-muted-foreground ring-1 ring-foreground/10">暫時沒有進行中的團購。</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {active.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </section>
          {closed.length > 0 ? (
            <section className="grid gap-4">
              <h2 className="text-xl font-bold">已結束</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {closed.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
