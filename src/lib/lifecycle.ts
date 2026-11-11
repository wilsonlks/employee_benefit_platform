import { addDays, categoryById, daysUntil, formatDay, USERS } from "@/lib/catalog"
import type { MailMessage, Offer, OfferView } from "@/lib/types"

const VIEW_DEPTS = ["市場部", "市場部", "市場部", "財務部", "財務部", "客戶服務部", "工程部", "資訊科技部", "人力資源部"]

export function deptFromUser(userId: string) {
  const known = USERS.find((user) => user.id === userId)
  if (known) return known.dept
  let hash = 0
  for (const char of userId) hash = (hash + char.charCodeAt(0)) % VIEW_DEPTS.length
  return VIEW_DEPTS[hash]
}

export function applyExpiry(offers: Offer[], today: string) {
  let changed = false
  const next = offers.map((offer) => {
    const updated = advanceOffer(offer, today)
    if (updated !== offer) changed = true
    return updated
  })
  return changed ? next : offers
}

function advanceOffer(offer: Offer, today: string): Offer {
  if (offer.reviewStatus !== "approved" || !offer.published || offer.takenDown) return offer
  if (offer.validUntil >= today) return offer
  if (offer.autoRenew) {
    let from = offer.validFrom
    let until = offer.validUntil
    let guard = 0
    while (until < today && guard < 48) {
      const span = Math.max(0, daysUntil(from, until))
      from = addDays(until, 1)
      until = addDays(from, span)
      guard += 1
    }
    return { ...offer, validFrom: from, validUntil: until, updatedAt: `${today}T01:00:00+08:00` }
  }
  if (offer.expireAction === "unpublish") {
    return { ...offer, published: false, takenDown: true, updatedAt: `${today}T01:00:00+08:00` }
  }
  return offer
}

export function dueReminders(offers: Offer[], savedByUser: Record<string, string[]>, existing: MailMessage[], today: string) {
  const seen = new Set(existing.map((mail) => mail.id))
  const created: MailMessage[] = []
  for (const [userId, ids] of Object.entries(savedByUser)) {
    if (!USERS.some((user) => user.id === userId)) continue
    for (const offerId of ids) {
      const offer = offers.find((item) => item.id === offerId)
      if (!offer || offer.reviewStatus !== "approved" || !offer.published || offer.takenDown) continue
      const left = daysUntil(today, offer.validUntil)
      if (left < 0 || left > 3) continue
      const id = `remind-${userId}-${offer.id}-${offer.validUntil}`
      if (seen.has(id)) continue
      const when = left === 0 ? "今天到期" : `${left} 天後到期`
      created.push({
        id,
        toUserId: userId,
        offerId: offer.id,
        subject: `收藏提醒：${offer.title}，${when}`,
        body: `你收藏的「${offer.title}」（${offer.merchant}）將於 ${formatDay(offer.validUntil)} 到期。請在到期前使用。這封郵件由內部系統自動發送，只會在到期前 3 天內寄出一次。`,
        sentAt: `${today}T09:00:00+08:00`,
        read: false,
      })
    }
  }
  return created
}

export function monthlyReport(offers: Offer[], views: OfferView[], today: string) {
  const month = today.slice(0, 7)
  const monthViews = views.filter((view) => view.at.slice(0, 7) === month)
  const offerCounts = new Map<string, number>()
  const deptCounts = new Map<string, number>()
  for (const view of monthViews) {
    offerCounts.set(view.offerId, (offerCounts.get(view.offerId) ?? 0) + 1)
    const dept = view.dept || "未分類"
    deptCounts.set(dept, (deptCounts.get(dept) ?? 0) + 1)
  }
  const topOffers = [...offerCounts.entries()]
    .map(([id, clicks]) => {
      const offer = offers.find((item) => item.id === id)
      return offer ? { id, title: offer.title, merchant: offer.merchant, category: categoryById(offer.category)?.name ?? offer.category, clicks } : null
    })
    .filter((item): item is { id: string; title: string; merchant: string; category: string; clicks: number } => item != null)
    .sort((a, b) => b.clicks - a.clicks || a.title.localeCompare(b.title, "zh-HK"))
    .slice(0, 10)
  const departments = [...deptCounts.entries()]
    .map(([dept, clicks]) => ({ dept, clicks }))
    .sort((a, b) => b.clicks - a.clicks || a.dept.localeCompare(b.dept, "zh-HK"))
  const expiring = offers
    .filter((offer) => offer.reviewStatus === "approved" && offer.published && !offer.takenDown && !offer.autoRenew && offer.validUntil >= today && daysUntil(today, offer.validUntil) <= 14)
    .sort((a, b) => a.validUntil.localeCompare(b.validUntil))
  return { month, topOffers, departments, expiring }
}

function cell(value: string | number) {
  const text = String(value)
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

export function reportCsv(offers: Offer[], views: OfferView[], today: string) {
  const report = monthlyReport(offers, views, today)
  const lines = [
    "同事福利月報",
    `月份,${report.month}`,
    "",
    "本月點擊最高的優惠",
    "排名,優惠,商戶,分類,點擊次數",
  ]
  if (report.topOffers.length === 0) lines.push("本月未有點擊紀錄")
  report.topOffers.forEach((item, index) => {
    lines.push([index + 1, item.title, item.merchant, item.category, item.clicks].map(cell).join(","))
  })
  lines.push("", "部門使用情況", "排名,部門,點擊次數")
  if (report.departments.length === 0) lines.push("本月未有部門點擊紀錄")
  report.departments.forEach((item, index) => {
    lines.push([index + 1, item.dept, item.clicks].map(cell).join(","))
  })
  lines.push("", "即將到期需要下架（14 日內，不包括自動續期）", "優惠,商戶,到期日,剩餘日數")
  if (report.expiring.length === 0) lines.push("未來 14 日沒有需要下架的優惠")
  for (const offer of report.expiring) {
    lines.push([offer.title, offer.merchant, offer.validUntil, daysUntil(today, offer.validUntil)].map(cell).join(","))
  }
  return lines.join("\r\n")
}
