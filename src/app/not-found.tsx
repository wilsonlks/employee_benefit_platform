import Link from "next/link"
import { Logo } from "@/components/brand"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[#065f46]">這頁不在平台裡</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">連結可能已過期。返回主頁可以繼續查優惠。</p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 h-10 px-4")}>
          返回主頁
        </Link>
      </div>
    </main>
  )
}
