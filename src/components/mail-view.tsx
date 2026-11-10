"use client"

import Link from "next/link"
import { Mail } from "lucide-react"
import { formatWhen } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { EmptyState, PageHeader } from "@/components/states"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MailView() {
  const { user, mails, markMailRead } = useStore()
  if (!user) return null
  const inbox = mails.filter((mail) => mail.toUserId === user.id).sort((a, b) => b.sentAt.localeCompare(a.sentAt))

  return (
    <div className="grid gap-6">
      <PageHeader title="內部郵件" description="收藏的優惠若在 3 天內到期，系統會寄一封提醒到這個信箱。示範環境不會真的寄出公司電郵。" />
      {inbox.length === 0 ? (
        <EmptyState icon={Mail} title="未有郵件" body="收藏一項即將到期的優惠後，到期前 3 天會在這裡收到提醒。" />
      ) : (
        <div className="divide-y overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10">
          {inbox.map((mail) => (
            <article key={mail.id} className="grid gap-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={cn("text-base", mail.read ? "font-medium" : "font-bold")}>{mail.subject}</h2>
                <time className="text-xs text-muted-foreground">{formatWhen(mail.sentAt)}</time>
              </div>
              <p className="text-sm leading-6 text-slate-700">{mail.body}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/offers/${mail.offerId}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))} onClick={() => markMailRead(mail.id)}>
                  查看優惠
                </Link>
                {mail.read ? null : (
                  <button type="button" className="text-sm font-medium text-[#065f46]" onClick={() => markMailRead(mail.id)}>
                    標為已讀
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
