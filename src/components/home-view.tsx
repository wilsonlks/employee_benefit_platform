"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { CATEGORIES, greeting, groupStatus, queryOffers } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { LoginView } from "@/components/login-view"
import { GroupCard } from "@/components/group-card"
import { OfferCard } from "@/components/offer-card"
import { CATEGORY_META } from "@/components/taxonomy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HomeGate() {
  const { user } = useStore()
  if (!user) return <LoginView />
  return <HomeView />
}

export function HomeView() {
  const { user, offers, groups } = useStore()
  if (!user) return null
  const visible = queryOffers(offers, { staffOnly: true })
  const latest = visible.slice(0, 4)
  const ending = queryOffers(offers, { staffOnly: true, tag: "ending" })
  const activeGroups = groups
    .filter((group) => group.published && ["open", "reached"].includes(groupStatus(group)))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  const pendingReview = offers.filter((offer) => offer.reviewStatus === "pending").length
  const returned = offers.filter((offer) => offer.reviewStatus === "returned").length

  return (
    <div className="grid gap-8">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-foreground/10 sm:p-7">
        <p className="text-sm font-medium text-[#065f46]">
          {greeting()}，{user.name}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">今日想找哪一類優惠？</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          現有 {visible.length} 項經人事部上架的福利。分類瀏覽，或者直接搜尋商戶、地點和優惠。
        </p>
        <form action="/offers" className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="home-search" className="sr-only">
            搜尋優惠
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="home-search" name="q" placeholder="試試：洗牙、戲票、酒店、渡輪" className="h-12 pl-9 text-base md:text-base" />
          </div>
          <Button type="submit" className="h-12 px-5">
            搜尋
          </Button>
        </form>
        {user.role === "supervisor" && pendingReview > 0 ? (
          <Link href="/admin" className="mt-4 inline-flex text-sm font-medium text-[#065f46] underline-offset-4 hover:underline">
            有 {pendingReview} 項優惠待審核，批准後會出現在員工首頁
          </Link>
        ) : null}
        {user.role === "hr" && (pendingReview > 0 || returned > 0) ? (
          <Link href="/admin" className="mt-4 inline-flex text-sm font-medium text-[#065f46] underline-offset-4 hover:underline">
            {pendingReview > 0 ? `${pendingReview} 項待主管審核` : ""}
            {pendingReview > 0 && returned > 0 ? "，" : ""}
            {returned > 0 ? `${returned} 項已退回，可以修改後再交` : ""}
          </Link>
        ) : null}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold">六大分類</h2>
          <Link href="/offers" className="text-sm font-medium text-primary">
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category.id]
            const Icon = meta.icon
            const count = visible.filter((offer) => offer.category === category.id).length
            return (
              <Link
                key={category.id}
                href={`/offers?category=${category.id}`}
                className="flex flex-col gap-4 rounded-2xl border-l-8 border-l-[#22c55e] bg-white p-4 shadow-sm ring-1 ring-foreground/10 transition hover:-translate-y-0.5 hover:ring-primary/30 sm:p-5"
              >
                <span className={`grid size-12 place-items-center rounded-full ${meta.iconClass}`}>
                  <Icon className="size-6" />
                </span>
                <span>
                  <span className="block text-lg font-bold">{category.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {category.blurb} · {count} 項
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {ending.length > 0 ? (
        <section className="rounded-2xl bg-[#eaf6ee] px-5 py-4 text-sm text-[#065f46]">
          <Link href="/offers?tag=ending" className="font-semibold underline-offset-4 hover:underline">
            {ending.length} 項優惠將於兩星期內完結
          </Link>
          <span className="text-[#065f46]/80">，包括{ending.map((offer) => offer.merchant).slice(0, 3).join("、")}。</span>
        </section>
      ) : null}

      <section className="grid gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">最新上架</h2>
          <Link href="/offers?sort=new" className="text-sm font-medium text-primary">
            更多
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {latest.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">進行中的團購</h2>
          <Link href="/groups" className="text-sm font-medium text-primary">
            全部團購
          </Link>
        </div>
        {activeGroups.length === 0 ? (
          <p className="rounded-2xl bg-white px-5 py-8 text-sm text-muted-foreground ring-1 ring-foreground/10">暫時沒有進行中的團購。</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGroups.slice(0, 2).map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
