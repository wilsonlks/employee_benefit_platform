"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { addDays, fromDatetimeLocal, hasErrors, isPeopleTeam, todayHK, toDatetimeLocal, validateGroup } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import type { GroupBuy } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PosterField } from "@/components/poster"
import { Field, PageHeader, StaffBlocked } from "@/components/states"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function GroupEditor({ id }: { id?: string }) {
  const { user, groups } = useStore()
  if (!user) return null
  if (!isPeopleTeam(user.role)) return <StaffBlocked />
  const existing = id ? groups.find((group) => group.id === id) : undefined
  if (id && !existing) {
    return (
      <div className="grid gap-4">
        <PageHeader title="找不到這個團購" description="可能已經刪除。" />
        <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "h-10 w-fit px-4")}>
          返回管理
        </Link>
      </div>
    )
  }
  return <GroupForm key={existing?.id ?? "new"} initial={existing} />
}

function GroupForm({ initial }: { initial?: GroupBuy }) {
  const { saveGroup, deleteGroup } = useStore()
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? "")
  const [merchant, setMerchant] = useState(initial?.merchant ?? "")
  const [priceLabel, setPriceLabel] = useState(initial?.priceLabel ?? "")
  const [unitLabel, setUnitLabel] = useState(initial?.unitLabel ?? "位")
  const [threshold, setThreshold] = useState(String(initial?.threshold ?? 20))
  const [limit, setLimit] = useState(initial?.limit == null ? "" : String(initial.limit))
  const [perPerson, setPerPerson] = useState(String(initial?.perPerson ?? 2))
  const [deadline, setDeadline] = useState(initial ? toDatetimeLocal(initial.deadline) : `${addDays(todayHK(), 21)}T18:00`)
  const [summary, setSummary] = useState(initial?.summary ?? "")
  const [detail, setDetail] = useState(initial?.detail ?? "")
  const [published, setPublished] = useState(initial?.published ?? true)
  const [image, setImage] = useState(initial?.image ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)

  function described(field: string) {
    return errors[field] ? `${field}-error` : undefined
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const draft = {
      id: initial?.id ?? `gb-${crypto.randomUUID().slice(0, 8)}`,
      title,
      merchant,
      priceLabel,
      unitLabel,
      threshold: parseWhole(threshold),
      limit: limit.trim() ? parseWhole(limit) : null,
      perPerson: parseWhole(perPerson),
      deadline: deadline ? fromDatetimeLocal(deadline) : "",
      summary,
      detail,
      image,
      published,
    }
    const nextErrors = validateGroup(draft)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      toast.error("請先修正標示的欄位")
      return
    }
    saveGroup(draft)
    toast.success(published ? "團購已上架" : "已儲存為草案")
    router.push(`/groups/${draft.id}`)
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <PageHeader
        title={initial ? "編輯團購" : "上載團購"}
        description="設定門檻和截止時間。已有的報名會保留。"
        actions={
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
            返回管理
          </Link>
        }
      />
      <div className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-foreground/10 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className={cn("flex items-start gap-3 rounded-xl border p-3", published && "border-primary bg-secondary")}>
            <Checkbox id="group-published" checked={published} onCheckedChange={setPublished} className="mt-0.5" />
            <label htmlFor="group-published" className="grid gap-1">
              <span className="text-sm font-medium">上架給同事報名</span>
              <span className="text-sm text-muted-foreground">關閉則只保留為草案。</span>
            </label>
          </div>
        </div>
        <Field id="group-title" label="活動名稱" error={errors.title}>
          <Input id="group-title" value={title} onChange={(event) => setTitle(event.target.value)} aria-invalid={!!errors.title} aria-describedby={described("title")} className="h-11" />
        </Field>
        <Field id="group-merchant" label="主辦或商戶" error={errors.merchant}>
          <Input id="group-merchant" value={merchant} onChange={(event) => setMerchant(event.target.value)} aria-invalid={!!errors.merchant} aria-describedby={described("merchant")} className="h-11" />
        </Field>
        <Field id="group-price" label="價格" error={errors.priceLabel} hint="例如 HK$180">
          <Input id="group-price" value={priceLabel} onChange={(event) => setPriceLabel(event.target.value)} aria-invalid={!!errors.priceLabel} aria-describedby={described("priceLabel")} className="h-11" />
        </Field>
        <Field id="group-unit" label="單位" error={errors.unitLabel} hint="張、位、盒、份">
          <Input id="group-unit" value={unitLabel} onChange={(event) => setUnitLabel(event.target.value)} aria-invalid={!!errors.unitLabel} aria-describedby={described("unitLabel")} className="h-11" />
        </Field>
        <Field id="group-threshold" label="成團門檻" error={errors.threshold}>
          <Input id="group-threshold" inputMode="numeric" value={threshold} onChange={(event) => setThreshold(event.target.value)} aria-invalid={!!errors.threshold} aria-describedby={described("threshold")} className="h-11" />
        </Field>
        <Field id="group-limit" label="名額上限" error={errors.limit} hint="可不填，代表沒有硬性上限">
          <Input id="group-limit" inputMode="numeric" value={limit} onChange={(event) => setLimit(event.target.value)} aria-invalid={!!errors.limit} aria-describedby={described("limit")} className="h-11" />
        </Field>
        <Field id="group-per" label="每人上限" error={errors.perPerson}>
          <Input id="group-per" inputMode="numeric" value={perPerson} onChange={(event) => setPerPerson(event.target.value)} aria-invalid={!!errors.perPerson} aria-describedby={described("perPerson")} className="h-11" />
        </Field>
        <Field id="group-deadline" label="截止時間" error={errors.deadline} hint="以香港時間計算。截止後按人數自動成團或取消。">
          <Input id="group-deadline" type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} aria-invalid={!!errors.deadline} aria-describedby={described("deadline")} className="h-11" />
        </Field>
        <div className="sm:col-span-2">
          <PosterField id="group-image" value={image} onChange={setImage} />
        </div>
        <div className="sm:col-span-2">
          <Field id="group-summary" label="簡介" error={errors.summary}>
            <Textarea id="group-summary" value={summary} onChange={(event) => setSummary(event.target.value)} aria-invalid={!!errors.summary} aria-describedby={described("summary")} className="min-h-20" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="group-detail" label="活動詳情" error={errors.detail}>
            <Textarea id="group-detail" value={detail} onChange={(event) => setDetail(event.target.value)} aria-invalid={!!errors.detail} aria-describedby={described("detail")} className="min-h-28" />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-11 px-5">
          {published ? "儲存並上架" : "儲存草案"}
        </Button>
        {initial ? (
          <Button type="button" variant="destructive" className="h-11" onClick={() => setConfirming(true)}>
            刪除
          </Button>
        ) : null}
      </div>
      <ConfirmDialog
        open={confirming}
        title="刪除這個團購？"
        description="報名紀錄會一併在這個瀏覽器中移除。"
        confirmLabel="刪除"
        onOpenChange={setConfirming}
        onConfirm={() => {
          if (!initial) return
          deleteGroup(initial.id)
          toast.success("已刪除團購")
          router.push("/admin")
        }}
      />
    </form>
  )
}

function parseWhole(value: string) {
  if (!/^\d+$/.test(value.trim())) return Number.NaN
  return Number(value.trim())
}
