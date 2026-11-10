"use client"

import { useState } from "react"
import { toast } from "sonner"
import { readPoster } from "@/lib/poster"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function Poster({ src, alt, framed = true }: { src: string; alt: string; framed?: boolean }) {
  if (!src) return null
  return (
    <figure className={cn(framed && "overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-foreground/10")}>
      {/* Posters are data URLs kept in this browser, so the image optimizer cannot fetch them. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-[32rem] w-full object-contain" />
    </figure>
  )
}

export function PosterThumb({ src }: { src: string }) {
  if (!src) return null
  return (
    // User posters are data URLs kept in this browser, so the image optimizer cannot fetch them.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-40 w-full bg-slate-50 object-cover" />
  )
}

export function PosterField({ id, value, onChange }: { id: string; value: string; onChange: (next: string) => void }) {
  const [busy, setBusy] = useState(false)

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    try {
      onChange(await readPoster(file))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "未能讀取圖片")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>圖片（可不填）</Label>
      <p className="text-sm text-muted-foreground">有海報或宣傳圖才上傳。留空時，同事仍然可以查看文字資料。</p>
      {value ? <Poster src={value} alt="已選圖片預覽" /> : null}
      <div className="flex flex-wrap gap-2">
        <label className={cn(buttonVariants({ variant: "outline" }), "h-10 cursor-pointer px-4")}>
          {busy ? "處理中…" : value ? "更換圖片" : "上傳圖片"}
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              void onFile(file)
            }}
          />
        </label>
        {value ? (
          <Button type="button" variant="ghost" className="h-10" onClick={() => onChange("")}>
            移除圖片
          </Button>
        ) : null}
      </div>
    </div>
  )
}
