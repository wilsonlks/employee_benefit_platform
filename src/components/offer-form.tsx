"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { addDays, CATEGORIES, hasErrors, isCategoryId, todayHK, toggleTag, validateOffer } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import type { CategoryId, Offer, OfferTag } from "@/lib/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Field, PageHeader, StaffBlocked } from "@/components/states"
import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const categoryItems = Object.fromEntries(CATEGORIES.map((category) => [category.id, category.name]))

export function OfferEditor({ id }: { id?: string }) {
  const { user, offers } = useStore()
  if (!user) return null
  if (user.role !== "hr") return <StaffBlocked />
  const existing = id ? offers.find((offer) => offer.id === id) : undefined
  if (id && !existing) {
    return (
      <div className="grid gap-4">
        <PageHeader title="找不到這項優惠" description="可能已經刪除。" />
        <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "h-10 w-fit px-4")}>
          返回管理
        </Link>
      </div>
    )
  }
  return <OfferForm key={existing?.id ?? "new"} initial={existing} />
}

function OfferForm({ initial }: { initial?: Offer }) {
  const { saveOffer, deleteOffer } = useStore()
  const router = useRouter()
  const today = todayHK()
  const [title, setTitle] = useState(initial?.title ?? "")
  const [merchant, setMerchant] = useState(initial?.merchant ?? "")
  const [category, setCategory] = useState<CategoryId>(initial?.category ?? "health")
  const [discount, setDiscount] = useState(initial?.discount ?? "")
  const [summary, setSummary] = useState(initial?.summary ?? "")
  const [detail, setDetail] = useState(initial?.detail ?? "")
  const [howToRedeem, setHowToRedeem] = useState(initial?.howToRedeem ?? "")
  const [terms, setTerms] = useState(initial?.terms ?? "")
  const [code, setCode] = useState(initial?.code ?? "")
  const [location, setLocation] = useState(initial?.location ?? "")
  const [validFrom, setValidFrom] = useState(initial?.validFrom ?? today)
  const [validUntil, setValidUntil] = useState(initial?.validUntil ?? addDays(today, 90))
  const [tags, setTags] = useState<OfferTag[]>(initial?.tags ?? [])
  const [published, setPublished] = useState(initial?.published ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)

  function described(field: string) {
    return errors[field] ? `${field}-error` : undefined
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const draft = {
      id: initial?.id ?? `off-${crypto.randomUUID().slice(0, 8)}`,
      title,
      merchant,
      category,
      summary,
      detail,
      howToRedeem,
      terms,
      discount,
      code,
      location,
      validFrom,
      validUntil,
      tags,
      published,
    }
    const nextErrors = validateOffer(draft)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) {
      toast.error("請先修正標示的欄位")
      return
    }
    saveOffer(draft)
    toast.success(published ? "已上架，同事可以查看" : "已儲存為草案")
    router.push(`/offers/${draft.id}`)
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <PageHeader
        title={initial ? "編輯優惠" : "上載優惠"}
        description="同事只會看到已上架、而且未過期的項目。"
        actions={
          <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
            返回管理
          </Link>
        }
      />
      <div className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-foreground/10 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToggleRow
            id="published"
            checked={published}
            onChange={setPublished}
            title="上架給同事查看"
            body="關閉則只保留在人事部後台，作為草案。"
          />
        </div>
        <Field id="title" label="優惠名稱" error={errors.title}>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} aria-invalid={!!errors.title} aria-describedby={described("title")} className="h-11" />
        </Field>
        <Field id="merchant" label="商戶" error={errors.merchant}>
          <Input id="merchant" value={merchant} onChange={(event) => setMerchant(event.target.value)} aria-invalid={!!errors.merchant} aria-describedby={described("merchant")} className="h-11" />
        </Field>
        <Field id="category" label="分類" error={errors.category}>
          <Select
            items={categoryItems}
            value={category}
            onValueChange={(value) => {
              if (value && isCategoryId(value)) setCategory(value)
            }}
          >
            <SelectTrigger id="category" className="h-11 w-full" aria-invalid={!!errors.category}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="discount" label="優惠幅度" error={errors.discount} hint="例如 8 折、減 $50、買一送一">
          <Input id="discount" value={discount} onChange={(event) => setDiscount(event.target.value)} aria-invalid={!!errors.discount} aria-describedby={described("discount")} className="h-11" />
        </Field>
        <Field id="location" label="地點" error={errors.location}>
          <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} aria-invalid={!!errors.location} aria-describedby={described("location")} className="h-11" />
        </Field>
        <Field id="code" label="優惠碼" hint="沒有優惠碼可以留空">
          <Input id="code" value={code} onChange={(event) => setCode(event.target.value)} className="h-11" />
        </Field>
        <Field id="validFrom" label="開始日期" error={errors.validFrom}>
          <Input id="validFrom" type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} aria-invalid={!!errors.validFrom} aria-describedby={described("validFrom")} className="h-11" />
        </Field>
        <Field id="validUntil" label="結束日期" error={errors.validUntil}>
          <Input id="validUntil" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} aria-invalid={!!errors.validUntil} aria-describedby={described("validUntil")} className="h-11" />
        </Field>
        <div className="grid gap-2 sm:col-span-2">
          <p className="text-sm font-medium">標籤</p>
          <div className="flex flex-wrap gap-3">
            <ToggleRow id="tag-new" checked={tags.includes("new")} onChange={() => setTags((current) => toggleTag(current, "new"))} title="最新" />
            <ToggleRow id="tag-limited" checked={tags.includes("limited")} onChange={() => setTags((current) => toggleTag(current, "limited"))} title="限時" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <Field id="summary" label="一句簡介" error={errors.summary}>
            <Textarea id="summary" value={summary} onChange={(event) => setSummary(event.target.value)} aria-invalid={!!errors.summary} aria-describedby={described("summary")} className="min-h-20" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="detail" label="優惠內容" error={errors.detail}>
            <Textarea id="detail" value={detail} onChange={(event) => setDetail(event.target.value)} aria-invalid={!!errors.detail} aria-describedby={described("detail")} className="min-h-28" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="howToRedeem" label="使用方法" error={errors.howToRedeem}>
            <Textarea id="howToRedeem" value={howToRedeem} onChange={(event) => setHowToRedeem(event.target.value)} aria-invalid={!!errors.howToRedeem} aria-describedby={described("howToRedeem")} className="min-h-24" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="terms" label="注意事項" hint="可不填">
            <Textarea id="terms" value={terms} onChange={(event) => setTerms(event.target.value)} className="min-h-20" />
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
        title="刪除這項優惠？"
        description="刪除後同事和收藏列表都不會再看到。這個動作只影響這個瀏覽器的示範資料。"
        confirmLabel="刪除"
        onOpenChange={setConfirming}
        onConfirm={() => {
          if (!initial) return
          deleteOffer(initial.id)
          toast.success("已刪除")
          router.push("/admin")
        }}
      />
    </form>
  )
}

function ToggleRow({
  id,
  checked,
  onChange,
  title,
  body,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  title: string
  body?: string
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-3", checked && "border-primary bg-secondary")}>
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value)} className="mt-0.5" />
      <label htmlFor={id} className="grid gap-1">
        <span className="text-sm font-medium">{title}</span>
        {body ? <span className="text-sm text-muted-foreground">{body}</span> : null}
      </label>
    </div>
  )
}
