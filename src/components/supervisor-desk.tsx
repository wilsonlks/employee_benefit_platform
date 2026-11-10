"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { categoryById, categoryPopularity, daysUntil, formatDay, groupStatus, todayHK } from "@/lib/catalog"
import { monthlyReport, reportCsv } from "@/lib/lifecycle"
import { useStore } from "@/lib/store"
import type { Offer } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function SupervisorDesk() {
  const { offers, groups, views, decideOffer } = useStore()
  const [returning, setReturning] = useState<Offer | null>(null)
  const [note, setNote] = useState("")
  const popularity = useMemo(() => categoryPopularity(offers, views), [offers, views])
  const pending = offers.filter((offer) => offer.reviewStatus === "pending")
  const activeGroups = groups.filter((group) => group.published && ["open", "reached"].includes(groupStatus(group))).length
  const maxClicks = Math.max(...popularity.byCategory.map((item) => item.clicks), 1)
  const leader = popularity.leader && popularity.leader.clicks > 0 ? popularity.leader : null
  const today = todayHK()
  const report = useMemo(() => monthlyReport(offers, views, today), [offers, views, today])

  function exportReport() {
    const csv = reportCsv(offers, views, today)
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `同事福利報表-${today}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("已下載本月報表")
  }

  function approve(offer: Offer) {
    decideOffer(offer.id, "approve")
    toast.success("已批准上架，員工首頁現在可以看到")
  }

  function confirmReturn() {
    if (!returning) return
    const reason = note.trim()
    if (!reason) {
      toast.error("請寫低退回原因，專員才知道要改什麼")
      return
    }
    decideOffer(returning.id, "return", reason)
    toast.success("已退回專員修改")
    setReturning(null)
    setNote("")
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">人事部管理後台</h1>
          <p className="mt-2 text-gray-500">管理優惠上下架、查看數據與審核提案。</p>
        </div>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "h-9 px-2 text-[#15803d]")}>
          ← 返回員工首頁
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Stat
          label="近 30 日瀏覽"
          value={popularity.total.toLocaleString("zh-HK")}
          hint={
            popularity.change == null
              ? "未有上一個 30 日可以比較"
              : `${popularity.change >= 0 ? "↑" : "↓"} ${Math.abs(popularity.change)}%`
          }
          hintClass={popularity.change != null && popularity.change >= 0 ? "text-green-600" : "text-gray-400"}
        />
        <Stat label="待審核優惠" value={String(pending.length)} hint="項" hintClass="text-gray-400" valueClass="text-orange-500" />
        <Stat label="進行中團購" value={String(activeGroups)} hint="團" hintClass="text-gray-400" valueClass="text-blue-600" />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">本月報表</h2>
            <p className="mt-1 text-sm text-gray-500">一鍵匯出本月點擊最高的優惠、部門使用情況，以及 14 日內到期、需要下架的項目。</p>
          </div>
          <Button type="button" className="bg-[#15803d] hover:bg-[#065f46]" onClick={exportReport}>
            匯出本月報表
          </Button>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-gray-500">本月點擊最高</dt>
            <dd className="mt-1 font-bold text-gray-900">{report.topOffers[0] ? `${report.topOffers[0].title} · ${report.topOffers[0].clicks} 次` : "未有紀錄"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">使用最踴躍的部門</dt>
            <dd className="mt-1 font-bold text-gray-900">{report.departments[0] ? `${report.departments[0].dept} · ${report.departments[0].clicks} 次` : "未有紀錄"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">14 日內需下架</dt>
            <dd className="mt-1 font-bold text-gray-900">
              {report.expiring.length} 項
              {report.expiring[0] ? `，最近是 ${report.expiring[0].title}（${daysUntil(today, report.expiring[0].validUntil)} 天）` : ""}
            </dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="text-orange-500">●</span> 待審核提案
          </h2>
          <span className="text-sm text-gray-500">共 {pending.length} 項</span>
        </div>
        {pending.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-500">暫時沒有待審核的優惠。專員提交後會出現在這裡。</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map((offer) => (
              <div key={offer.id} className="flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-100 text-orange-800">待審核</Badge>
                    <Link href={`/offers/${offer.id}`} className="text-lg font-bold text-gray-900 hover:underline">
                      {offer.title}
                    </Link>
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                    <span>提交者：人事部專員 ({offer.submittedByName})</span>
                    <span>{offer.merchant}</span>
                    <span>分類：{categoryById(offer.category)?.name}</span>
                    <span>期限：至 {offer.validUntil}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300"
                    onClick={() => {
                      setReturning(offer)
                      setNote("")
                    }}
                  >
                    退回修改
                  </Button>
                  <Button type="button" className="bg-[#15803d] shadow-sm hover:bg-[#065f46]" onClick={() => approve(offer)}>
                    批准上架
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">哪類優惠最受歡迎</h2>
            <p className="mt-1 text-sm text-gray-500">按同事近 30 日打開優惠詳情的次數計算，方便下一輪採購福利時參考。</p>
          </div>
          <p className="text-sm text-gray-400">截至 {formatDay(todayHK())}</p>
        </div>
        {leader ? (
          <p className="mt-4 rounded-xl bg-[#f0fdf4] px-4 py-3 text-sm leading-6 text-[#065f46]">
            「{leader.name}」瀏覽最多，佔近 30 日的 {leader.share}%。採購下一輪福利時，可以優先考慮這類合作。
          </p>
        ) : (
          <p className="mt-4 text-sm text-gray-500">未有瀏覽紀錄。同事打開優惠後，這裡會按分類累計。</p>
        )}
        <ul className="mt-5 grid gap-4">
          {popularity.byCategory.map((item) => (
            <li key={item.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-gray-500">
                  {item.clicks.toLocaleString("zh-HK")} 次 · {item.share}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#15803d]" style={{ width: `${(item.clicks / maxClicks) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        {popularity.topOffers.length > 0 ? (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900">瀏覽最多的優惠</h3>
            <ol className="mt-3 grid gap-2">
              {popularity.topOffers.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">
                    <span className="mr-2 text-gray-400">{index + 1}</span>
                    <Link href={`/offers/${item.id}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                    <span className="ml-2 text-gray-400">{categoryById(item.category)?.name}</span>
                  </span>
                  <span className="shrink-0 text-gray-500">{item.clicks.toLocaleString("zh-HK")} 次</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <Dialog
        open={returning != null}
        onOpenChange={(open) => {
          if (!open) setReturning(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>退回修改</DialogTitle>
            <DialogDescription>{returning ? `「${returning.title}」會離開待審核列表，專員改完可以再交。` : ""}</DialogDescription>
          </DialogHeader>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="例如：請補充使用地點和優惠碼" className="min-h-24" />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReturning(null)}>
              取消
            </Button>
            <Button type="button" onClick={confirmReturn}>
              確認退回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  hintClass,
  valueClass = "text-[#065f46]",
}: {
  label: string
  value: string
  hint: string
  hintClass: string
  valueClass?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={cn("mt-2 text-4xl font-bold", valueClass)}>
        {value} <span className={cn("text-sm font-normal", hintClass)}>{hint}</span>
      </p>
    </div>
  )
}
