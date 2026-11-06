"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchX } from "lucide-react"
import {
  CATEGORIES,
  isCategoryId,
  queryOffers,
  type OfferSort,
  type OfferTagFilter,
} from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { OfferCard } from "@/components/offer-card"
import { EmptyState, PageHeader } from "@/components/states"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const TAGS: { id: OfferTagFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "new", label: "最新" },
  { id: "limited", label: "限時" },
  { id: "ending", label: "即將完結" },
]

const SORTS = [
  { value: "new", label: "最新上架" },
  { value: "ending", label: "即將完結" },
  { value: "merchant", label: "商戶名稱" },
]

export function OffersBrowser() {
  const { user, offers } = useStore()
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get("q") ?? ""
  const categoryParam = params.get("category") ?? ""
  const category = isCategoryId(categoryParam) ? categoryParam : ""
  const tagParam = params.get("tag")
  const tag: OfferTagFilter = tagParam === "new" || tagParam === "limited" || tagParam === "ending" ? tagParam : "all"
  const sortParam = params.get("sort")
  const sort: OfferSort = sortParam === "ending" || sortParam === "merchant" ? sortParam : "new"
  const [text, setText] = useState(q)
  const paramsRef = useRef(params)
  paramsRef.current = params

  useEffect(() => {
    setText(q)
  }, [q])

  function update(partial: Record<string, string | null>) {
    const next = new URLSearchParams(paramsRef.current.toString())
    for (const [key, value] of Object.entries(partial)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    const query = next.toString()
    router.replace(query ? `/offers?${query}` : "/offers", { scroll: false })
  }

  useEffect(() => {
    if (text === (paramsRef.current.get("q") ?? "")) return
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(paramsRef.current.toString())
      const value = text.trim()
      if (value) next.set("q", value)
      else next.delete("q")
      const query = next.toString()
      router.replace(query ? `/offers?${query}` : "/offers", { scroll: false })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [router, text])

  if (!user) return null

  const results = queryOffers(offers, { q, category, tag, sort, staffOnly: true })
  const categoryName = CATEGORIES.find((item) => item.id === category)?.name
  const title = categoryName ?? (q ? `搜尋「${q}」` : "全部優惠")

  return (
    <div className="grid gap-6">
      <PageHeader title={title} description="只顯示已上架、而且未過期的項目。人事部會定期下架過期優惠。" />
      <div className="grid gap-3">
        <label htmlFor="offer-search" className="sr-only">
          搜尋優惠
        </label>
        <Input
          id="offer-search"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="商戶、地點、優惠或分類"
          className="h-11 text-base md:text-base"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={!category} onClick={() => update({ category: null })}>
            全部
          </FilterChip>
          {CATEGORIES.map((item) => (
            <FilterChip key={item.id} active={category === item.id} onClick={() => update({ category: item.id })}>
              {item.name}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {TAGS.map((item) => (
              <FilterChip key={item.id} active={tag === item.id} onClick={() => update({ tag: item.id === "all" ? null : item.id })}>
                {item.label}
              </FilterChip>
            ))}
          </div>
          <Select
            items={Object.fromEntries(SORTS.map((item) => [item.value, item.label]))}
            value={sort}
            onValueChange={(value) => {
              if (value === "new" || value === "ending" || value === "merchant") update({ sort: value === "new" ? null : value })
            }}
          >
            <SelectTrigger className="h-10 w-full sm:w-40" aria-label="排序">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">共 {results.length} 項</p>
      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="找不到相關優惠"
          body="可以改關鍵字，或者清除篩選，查看全部已上架項目。"
          action={
            <Button variant="outline" onClick={() => router.replace("/offers")}>
              清除篩選
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium",
        active ? "border-primary bg-secondary text-secondary-foreground" : "bg-white text-slate-600 hover:bg-muted",
      )}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}
