import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Shield } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#065f46] sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-white px-6 py-14 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function StaffBlocked() {
  return (
    <EmptyState
      icon={Shield}
      title="只供人事部使用"
      body="一般員工可以瀏覽、收藏和報名。專員負責上載，主管負責批准上架。"
      action={
        <Link href="/" className={cn(buttonVariants(), "h-10 px-4")}>
          返回主頁
        </Link>
      }
    />
  )
}

export function PageSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
