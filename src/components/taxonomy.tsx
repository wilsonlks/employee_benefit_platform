import { BedDouble, Bus, Clapperboard, ShoppingBag, Stethoscope, UtensilsCrossed, type LucideIcon } from "lucide-react"
import type { CategoryId } from "@/lib/types"

export const CATEGORY_META: Record<CategoryId, { icon: LucideIcon; iconClass: string; bar: string }> = {
  health: { icon: Stethoscope, iconClass: "bg-sky-100 text-sky-700", bar: "bg-sky-500" },
  food: { icon: UtensilsCrossed, iconClass: "bg-amber-100 text-amber-800", bar: "bg-amber-500" },
  travel: { icon: BedDouble, iconClass: "bg-teal-100 text-teal-800", bar: "bg-teal-600" },
  transport: { icon: Bus, iconClass: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500" },
  daily: { icon: ShoppingBag, iconClass: "bg-orange-100 text-orange-700", bar: "bg-orange-500" },
  leisure: { icon: Clapperboard, iconClass: "bg-rose-100 text-rose-700", bar: "bg-rose-500" },
}
