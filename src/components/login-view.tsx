"use client"

import { BadgeCheck, ShieldCheck, UserRound } from "lucide-react"
import { roleLabel, USERS } from "@/lib/catalog"
import { useStore } from "@/lib/store"
import { Logo } from "@/components/brand"
import { Badge } from "@/components/ui/badge"

const POINTS = [
  "六大分類，可以用關鍵字搜尋及篩選",
  "每項優惠寫明使用方法、地點和期限",
  "團購由系統統計人數，到期未達標會取消",
]

export function LoginView() {
  const { login } = useStore()
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)]">
      <section className="flex flex-col justify-between bg-gradient-to-br from-[#065f46] via-[#15803d] to-[#22c55e] px-6 py-8 text-white sm:px-12 lg:py-12">
        <Logo light />
        <div className="max-w-xl py-12">
          <p className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.16em]">
            PROPOSAL · 可互動原型
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">員工內部福利平台</h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-emerald-50">
            醫食住行優惠，集中展示、方便查閱、由人力資源部把關。讓同事自己找到適合的福利。
          </p>
          <ul className="mt-8 grid gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm leading-6 text-emerald-50">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-emerald-100">內部員工專用 · 示範資料只存在這個瀏覽器</p>
      </section>
      <section className="flex items-center bg-white px-6 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#065f46]">選擇身份進入</h2>
          <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
            正式版本會連接公司帳號。這個示範可以直接進入員工、人事專員或人事主管。
          </p>
          <div className="mt-6 grid gap-3">
            {USERS.map((person) => {
              const Icon = person.role === "supervisor" ? BadgeCheck : person.role === "hr" ? ShieldCheck : UserRound
              const note =
                person.role === "supervisor"
                  ? "可批准上架，並查看哪類優惠最受歡迎。"
                  : person.role === "hr"
                    ? "可上載優惠並提交主管審核，不能直接上架。"
                    : "可瀏覽、搜尋、收藏，以及報名團購。不能自行上載。"
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => login(person.id)}
                  className="flex w-full items-start gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold">{person.name}</span>
                      <Badge variant={person.role === "employee" ? "secondary" : "default"}>{roleLabel(person.role)}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {person.dept} · {person.title}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">{note}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
