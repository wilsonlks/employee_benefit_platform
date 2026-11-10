"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { approveOffer, createSeed, isGroupOpen, maxQtyFor, resolvePoster, returnOffer, todayHK, USERS } from "@/lib/catalog"
import { posterSrc } from "@/lib/poster"
import type { GroupDraft, OfferDraft, OfferView, Persisted } from "@/lib/types"

const STORAGE_KEY = "staff-benefits-demo-v2"

type Store = {
  ready: boolean
  user: (typeof USERS)[number] | null
  offers: Persisted["offers"]
  groups: Persisted["groups"]
  views: Persisted["views"]
  savedIds: string[]
  login: (id: string) => void
  logout: () => void
  toggleSaved: (offerId: string) => void
  setSignup: (groupId: string, qty: number) => { ok: boolean; message: string }
  saveOffer: (draft: OfferDraft) => void
  decideOffer: (id: string, decision: "approve" | "return", note?: string) => void
  recordView: (offerId: string) => void
  deleteOffer: (id: string) => void
  saveGroup: (draft: GroupDraft) => void
  deleteGroup: (id: string) => void
  resetDemo: () => void
}

const StoreContext = createContext<Store | null>(null)

function sanitize(value: unknown): Persisted | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Partial<Persisted>
  if (raw.version !== 2 || !Array.isArray(raw.offers) || !Array.isArray(raw.groups) || !Array.isArray(raw.views)) return null
  const offersOk = raw.offers.every((offer) => offer && typeof offer.reviewStatus === "string" && typeof offer.id === "string")
  if (!offersOk) return null
  const userId = typeof raw.userId === "string" && USERS.some((user) => user.id === raw.userId) ? raw.userId : null
  const savedByUser =
    raw.savedByUser && typeof raw.savedByUser === "object" ? (raw.savedByUser as Record<string, string[]>) : {}
  return {
    version: 2,
    userId,
    offers: raw.offers.map((offer) => ({ ...offer, image: resolvePoster(offer) })),
    groups: raw.groups.map((group) => ({ ...group, image: resolvePoster(group) })),
    views: raw.views.filter((view): view is OfferView => !!view && typeof view.offerId === "string" && typeof view.at === "string"),
    savedByUser,
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(createSeed)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const parsed = sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? ""))
      if (parsed) setState(parsed)
    } catch {
      // Keep the bundled sample if this browser has no saved demo yet.
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [ready, state])

  const api = useMemo<Store>(() => {
    const user = USERS.find((item) => item.id === state.userId) ?? null
    return {
      ready,
      user,
      offers: state.offers,
      groups: state.groups,
      views: state.views,
      savedIds: user ? state.savedByUser[user.id] ?? [] : [],
      login: (id) => {
        if (!USERS.some((item) => item.id === id)) return
        setState((current) => ({ ...current, userId: id }))
      },
      logout: () => setState((current) => ({ ...current, userId: null })),
      toggleSaved: (offerId) =>
        setState((current) => {
          if (!current.userId) return current
          const existing = current.savedByUser[current.userId] ?? []
          const next = existing.includes(offerId) ? existing.filter((id) => id !== offerId) : [...existing, offerId]
          return { ...current, savedByUser: { ...current.savedByUser, [current.userId]: next } }
        }),
      setSignup: (groupId, qty) => {
        const group = state.groups.find((item) => item.id === groupId)
        if (!user || !group) return { ok: false, message: "找不到這個團購" }
        if (!isGroupOpen(group)) return { ok: false, message: "報名已截止" }
        if (!Number.isInteger(qty) || qty < 0) return { ok: false, message: "數量不正確" }
        const max = maxQtyFor(group, user.id)
        if (qty > max) return { ok: false, message: max === 0 ? "名額已滿" : `每人最多 ${max} ${group.unitLabel}` }
        setState((current) => ({
          ...current,
          groups: current.groups.map((item) => {
            if (item.id !== groupId) return item
            const others = item.signups.filter((signup) => signup.userId !== user.id)
            if (qty === 0) return { ...item, signups: others }
            const previous = item.signups.find((signup) => signup.userId === user.id)
            return {
              ...item,
              signups: [
                ...others,
                { userId: user.id, name: user.name, dept: user.dept, qty, at: previous?.at ?? new Date().toISOString() },
              ],
            }
          }),
        }))
        return { ok: true, message: qty === 0 ? "已取消報名" : "已更新報名" }
      },
      saveOffer: (draft) =>
        setState((current) => {
          const next = { ...draft, tags: [...draft.tags], image: posterSrc(draft.image), updatedAt: new Date().toISOString() }
          const exists = current.offers.some((offer) => offer.id === draft.id)
          return {
            ...current,
            offers: exists ? current.offers.map((offer) => (offer.id === draft.id ? next : offer)) : [next, ...current.offers],
          }
        }),
      decideOffer: (id, decision, note) =>
        setState((current) => {
          const at = new Date().toISOString()
          return {
            ...current,
            offers: current.offers.map((offer) => {
              if (offer.id !== id) return offer
              return decision === "approve" ? approveOffer(offer, at) : returnOffer(offer, note ?? "", at)
            }),
          }
        }),
      recordView: (offerId) =>
        setState((current) => {
          const viewer = USERS.find((item) => item.id === current.userId)
          if (!viewer || viewer.role !== "employee") return current
          if (!current.offers.some((offer) => offer.id === offerId)) return current
          const day = todayHK()
          const seen = current.views.some((view) => view.offerId === offerId && view.userId === viewer.id && view.at.slice(0, 10) === day)
          if (seen) return current
          return { ...current, views: [...current.views, { offerId, userId: viewer.id, at: new Date().toISOString() }] }
        }),
      deleteOffer: (id) =>
        setState((current) => ({
          ...current,
          offers: current.offers.filter((offer) => offer.id !== id),
          savedByUser: Object.fromEntries(
            Object.entries(current.savedByUser).map(([userId, ids]) => [userId, ids.filter((offerId) => offerId !== id)]),
          ),
        })),
      saveGroup: (draft) =>
        setState((current) => {
          const previous = current.groups.find((group) => group.id === draft.id)
          const next = {
            ...draft,
            image: posterSrc(draft.image),
            signups: previous ? previous.signups.map((signup) => ({ ...signup })) : [],
            updatedAt: new Date().toISOString(),
          }
          return {
            ...current,
            groups: previous ? current.groups.map((group) => (group.id === draft.id ? next : group)) : [next, ...current.groups],
          }
        }),
      deleteGroup: (id) => setState((current) => ({ ...current, groups: current.groups.filter((group) => group.id !== id) })),
      resetDemo: () => setState((current) => ({ ...createSeed(), userId: current.userId })),
    }
  }, [ready, state])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error("Store missing")
  return store
}
