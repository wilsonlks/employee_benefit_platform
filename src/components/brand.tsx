import { cn } from "@/lib/utils"

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl text-sm font-bold",
          light ? "bg-white text-[#065f46]" : "bg-primary text-primary-foreground",
        )}
      >
        福
      </span>
      <span className="leading-none">
        <span className={cn("block text-[15px] font-bold tracking-wide", light && "text-white")}>同事福利</span>
        <span className={cn("mt-1 block text-[11px]", light ? "text-emerald-100" : "text-muted-foreground")}>內部專用</span>
      </span>
    </span>
  )
}
