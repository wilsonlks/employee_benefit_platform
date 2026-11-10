"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Heart, House, LayoutGrid, RotateCcw, Shield, Users } from "lucide-react"
import { toast } from "sonner"
import { isPeopleTeam, roleLabel } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { Logo } from "@/components/brand"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "主頁", icon: House },
  { href: "/offers", label: "優惠", icon: LayoutGrid },
  { href: "/groups", label: "團購", icon: Users },
  { href: "/saved", label: "收藏", icon: Heart },
]

function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout, resetDemo } = useStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ready || user || pathname === "/") return
    router.replace("/")
  }, [pathname, ready, router, user])

  if (!user) {
    if (pathname === "/") return <>{children}</>
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <Logo />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#content"
        className="absolute top-3 left-3 z-50 -translate-y-20 rounded-lg bg-white px-3 py-2 text-sm shadow focus:translate-y-0"
      >
        跳到內容
      </a>
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="shrink-0" aria-label="同事福利主頁">
            <Logo />
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="主要">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  active(pathname, item.href) && "bg-secondary text-secondary-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            {isPeopleTeam(user.role) ? (
              <Link
                href="/admin"
                aria-current={active(pathname, "/admin") ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  active(pathname, "/admin") && "bg-secondary text-secondary-foreground",
                )}
              >
                管理
              </Link>
            ) : null}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isPeopleTeam(user.role) ? (
              <Link href="/admin" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 md:hidden")}>
                <Shield className="size-4" />
                管理
              </Link>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline" }), "h-10 max-w-40")}>
                <span className="truncate">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <span className="block text-sm text-foreground">{user.name}</span>
                    <span className="mt-1 block font-normal">
                      {user.dept} · {roleLabel(user.role)}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/saved")}>我的收藏</DropdownMenuItem>
                {isPeopleTeam(user.role) ? <DropdownMenuItem onClick={() => router.push("/admin")}>人事部管理</DropdownMenuItem> : null}
                <DropdownMenuItem
                  onClick={() => {
                    resetDemo()
                    toast.success("已還原示範資料")
                  }}
                >
                  <RotateCcw />
                  還原示範資料
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    router.replace("/")
                  }}
                >
                  切換身份
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-6xl px-4 py-6 pb-28 md:py-8 md:pb-10">
        {children}
      </main>
      <footer className="mx-auto hidden max-w-6xl px-4 pb-8 text-xs leading-5 text-muted-foreground md:block">
        示範原型。商戶、價格及同事姓名均為虛構，資料只保存在這個瀏覽器。正式版本會連接公司帳號，並由人事部審核後上架。
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur md:hidden" aria-label="主要">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const Icon = item.icon
            const on = active(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cn("flex flex-col items-center gap-1 py-2 text-[11px]", on ? "text-primary" : "text-muted-foreground")}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
