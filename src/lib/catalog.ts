import type {
  CategoryId,
  GroupBuy,
  GroupDraft,
  Offer,
  OfferDraft,
  OfferTag,
  OfferView,
  Persisted,
  ReviewStatus,
  Role,
  Signup,
  User,
} from "@/lib/types"

export function asOfferDraft(offer: Offer): OfferDraft {
  return {
    id: offer.id,
    title: offer.title,
    merchant: offer.merchant,
    category: offer.category,
    summary: offer.summary,
    detail: offer.detail,
    howToRedeem: offer.howToRedeem,
    terms: offer.terms,
    discount: offer.discount,
    code: offer.code,
    location: offer.location,
    validFrom: offer.validFrom,
    validUntil: offer.validUntil,
    tags: offer.tags,
    image: offer.image,
    published: offer.published,
    reviewStatus: offer.reviewStatus,
    submittedById: offer.submittedById,
    submittedByName: offer.submittedByName,
    reviewNote: offer.reviewNote,
    reviewedAt: offer.reviewedAt,
  }
}

export function asGroupDraft(group: GroupBuy): GroupDraft {
  return {
    id: group.id,
    title: group.title,
    merchant: group.merchant,
    summary: group.summary,
    detail: group.detail,
    priceLabel: group.priceLabel,
    unitLabel: group.unitLabel,
    threshold: group.threshold,
    limit: group.limit,
    perPerson: group.perPerson,
    deadline: group.deadline,
    image: group.image,
    published: group.published,
  }
}

export const USERS: User[] = [
  {
    id: "emp-chan",
    name: "陳嘉欣",
    dept: "市場部",
    title: "主任",
    role: "employee",
    email: "chan.kayan@staff.example",
  },
  {
    id: "hr-lee",
    name: "李慧敏",
    dept: "人事部",
    title: "專員",
    role: "hr",
    email: "lee.waiman@staff.example",
  },
  {
    id: "hr-ho",
    name: "何嘉慧",
    dept: "人事部",
    title: "主管",
    role: "supervisor",
    email: "ho.kawai@staff.example",
  },
]

export const CATEGORIES: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "health", name: "醫療健康", blurb: "檢查、視光、牙科" },
  { id: "food", name: "飲食", blurb: "餐廳、咖啡、超市" },
  { id: "travel", name: "住宿／旅遊", blurb: "酒店、自助餐、本地遊" },
  { id: "transport", name: "交通出行", blurb: "渡輪、的士、泊車" },
  { id: "daily", name: "日常生活", blurb: "家居、洗衣、日用品" },
  { id: "leisure", name: "休閒娛樂", blurb: "戲院、健身、工餘" },
]

export type OfferTagFilter = "all" | "new" | "limited" | "ending"
export type OfferSort = "new" | "ending" | "merchant"
export type OfferPhase = "live" | "upcoming" | "expired" | "draft" | "pending" | "returned"
export type GroupPhase = "open" | "reached" | "success" | "cancelled"

export const OFFER_PHASE_LABEL: Record<OfferPhase, string> = {
  live: "上架中",
  upcoming: "即將開始",
  expired: "已過期",
  draft: "草案",
  pending: "待審核",
  returned: "退回修改",
}

export const GROUP_PHASE_LABEL: Record<GroupPhase, string> = {
  open: "報名中",
  reached: "已達標",
  success: "成團成功",
  cancelled: "未達標已取消",
}

export const GROUP_PHASE_NOTE: Record<GroupPhase, string> = {
  open: "截止前仍可報名。人數達標即成團，未達標會在截止後取消。",
  reached: "已過門檻。截止前仍可繼續報名，截止後視為成團成功。",
  success: "已截止並達標。人事部會按報名名單跟進，示範環境不會真正扣款。",
  cancelled: "已截止但未達門檻，這次不會成團，也不會扣款。",
}

export function categoryById(id: string) {
  return CATEGORIES.find((category) => category.id === id)
}

export function isCategoryId(id: string): id is CategoryId {
  return CATEGORIES.some((category) => category.id === id)
}

export function roleLabel(role: Role) {
  if (role === "supervisor") return "人事主管"
  if (role === "hr") return "人事專員"
  return "一般員工"
}

export function isPeopleTeam(role: Role) {
  return role === "hr" || role === "supervisor"
}

export function todayHK(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

export function hourHK(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now)
  return Number(parts.find((part) => part.type === "hour")?.value ?? "0")
}

export function greeting(now = new Date()) {
  const hour = hourHK(now)
  if (hour < 12) return "早晨"
  if (hour < 18) return "你好"
  return "晚上好"
}

export function addDays(day: string, days: number) {
  const [year, month, date] = day.split("-").map(Number)
  const value = new Date(Date.UTC(year, month - 1, date))
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function formatDay(day: string) {
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${day}T00:00:00+08:00`))
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso))
}

export function toDatetimeLocal(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`
}

export function fromDatetimeLocal(value: string) {
  return `${value}:00+08:00`
}

export function offerPhase(offer: Offer, today = todayHK()): OfferPhase {
  if (offer.reviewStatus === "pending") return "pending"
  if (offer.reviewStatus === "returned") return "returned"
  if (offer.reviewStatus !== "approved" || !offer.published) return "draft"
  if (offer.validUntil < today) return "expired"
  if (offer.validFrom > today) return "upcoming"
  return "live"
}

export function isStaffVisible(offer: Offer, today = todayHK()) {
  return offer.reviewStatus === "approved" && offer.published && offer.validUntil >= today
}

export function approveOffer(offer: Offer, at: string): Offer {
  return { ...offer, reviewStatus: "approved", published: true, reviewedAt: at, reviewNote: "", updatedAt: at }
}

export function returnOffer(offer: Offer, note: string, at: string): Offer {
  return {
    ...offer,
    reviewStatus: "returned",
    published: false,
    reviewNote: note.trim(),
    reviewedAt: at,
    updatedAt: at,
  }
}

export function categoryPopularity(offers: Offer[], views: OfferView[], today = todayHK()) {
  const recentStart = addDays(today, -29)
  const previousStart = addDays(today, -59)
  const previousEnd = addDays(today, -30)
  const offerById = new Map(offers.map((offer) => [offer.id, offer]))
  const inWindow = (view: OfferView, start: string, end: string) => {
    const day = view.at.slice(0, 10)
    return day >= start && day <= end && offerById.has(view.offerId)
  }
  const recent = views.filter((view) => inWindow(view, recentStart, today))
  const previous = views.filter((view) => inWindow(view, previousStart, previousEnd))
  const counts = new Map<CategoryId, number>()
  const offerCounts = new Map<string, number>()
  for (const view of recent) {
    const offer = offerById.get(view.offerId)
    if (!offer) continue
    counts.set(offer.category, (counts.get(offer.category) ?? 0) + 1)
    offerCounts.set(offer.id, (offerCounts.get(offer.id) ?? 0) + 1)
  }
  const total = recent.length
  const byCategory = CATEGORIES.map((category) => {
    const clicks = counts.get(category.id) ?? 0
    return {
      id: category.id,
      name: category.name,
      clicks,
      share: total === 0 ? 0 : Math.round((clicks / total) * 100),
    }
  }).sort((a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name, "zh-HK"))
  const topOffers = [...offerCounts.entries()]
    .map(([id, clicks]) => {
      const offer = offerById.get(id)
      return offer ? { id, title: offer.title, category: offer.category, clicks } : null
    })
    .filter((item): item is { id: string; title: string; category: CategoryId; clicks: number } => item != null)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
  const change = previous.length === 0 ? null : Math.round(((recent.length - previous.length) / previous.length) * 100)
  return { byCategory, total, previous: previous.length, change, leader: byCategory[0] ?? null, topOffers }
}

export function isEndingSoon(offer: Offer, today = todayHK()) {
  return offerPhase(offer, today) === "live" && offer.validUntil <= addDays(today, 14)
}

export function matchesQuery(offer: Offer, query: string) {
  const parts = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return true
  const category = categoryById(offer.category)?.name ?? ""
  const tags = [
    offer.tags.includes("new") ? "最新" : "",
    offer.tags.includes("limited") ? "限時" : "",
  ]
  const haystack = [offer.title, offer.merchant, offer.summary, offer.detail, offer.location, offer.discount, offer.code, category, ...tags]
    .join(" ")
    .toLowerCase()
  return parts.every((part) => haystack.includes(part))
}

export function queryOffers(
  offers: Offer[],
  options: {
    q?: string
    category?: string
    tag?: OfferTagFilter
    sort?: OfferSort
    staffOnly?: boolean
    today?: string
  },
) {
  const today = options.today ?? todayHK()
  const filtered = offers.filter((offer) => {
    if (options.staffOnly && !isStaffVisible(offer, today)) return false
    if (options.category && offer.category !== options.category) return false
    if (options.tag === "new" && !offer.tags.includes("new")) return false
    if (options.tag === "limited" && !offer.tags.includes("limited")) return false
    if (options.tag === "ending" && !isEndingSoon(offer, today)) return false
    if (options.q && !matchesQuery(offer, options.q)) return false
    return true
  })
  const sort = options.sort ?? "new"
  return [...filtered].sort((a, b) => {
    if (sort === "ending") return a.validUntil.localeCompare(b.validUntil) || b.updatedAt.localeCompare(a.updatedAt)
    if (sort === "merchant") return a.merchant.localeCompare(b.merchant, "zh-Hant") || a.title.localeCompare(b.title, "zh-Hant")
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function signupQty(group: GroupBuy) {
  return group.signups.reduce((sum, signup) => sum + signup.qty, 0)
}

export function groupStatus(group: GroupBuy, now = Date.now()): GroupPhase {
  const ended = new Date(group.deadline).getTime() <= now
  const quantity = signupQty(group)
  if (ended) return quantity >= group.threshold ? "success" : "cancelled"
  return quantity >= group.threshold ? "reached" : "open"
}

export function isGroupOpen(group: GroupBuy, now = Date.now()) {
  if (!group.published) return false
  const status = groupStatus(group, now)
  return status === "open" || status === "reached"
}

export function maxQtyFor(group: GroupBuy, userId: string) {
  const mine = group.signups.find((signup) => signup.userId === userId)?.qty ?? 0
  const others = signupQty(group) - mine
  let max = group.perPerson
  if (group.limit != null) max = Math.min(max, Math.max(0, group.limit - others))
  return Math.max(0, max)
}

export function deadlineHint(deadline: string, now = Date.now()) {
  const hours = (new Date(deadline).getTime() - now) / 36e5
  if (hours < 0) return null
  if (hours < 24) return "今日內截止"
  if (hours < 72) return "3 日內截止"
  return null
}

function required(value: string, message: string, errors: Record<string, string>, key: string) {
  if (!value.trim()) errors[key] = message
}

export function validateOffer(draft: OfferDraft) {
  const errors: Record<string, string> = {}
  required(draft.title, "請填寫優惠名稱", errors, "title")
  required(draft.merchant, "請填寫商戶", errors, "merchant")
  required(draft.discount, "請填寫優惠幅度", errors, "discount")
  required(draft.summary, "請用一句說話講明優惠", errors, "summary")
  required(draft.detail, "請填寫優惠內容", errors, "detail")
  required(draft.howToRedeem, "請填寫使用方法", errors, "howToRedeem")
  required(draft.location, "請填寫地點；網上優惠可寫「網上」", errors, "location")
  if (!isCategoryId(draft.category)) errors.category = "請選擇分類"
  if (!draft.validFrom) errors.validFrom = "請選擇開始日期"
  if (!draft.validUntil) errors.validUntil = "請選擇結束日期"
  if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom) {
    errors.validUntil = "結束日期不可早於開始日期"
  }
  return errors
}

export function validateGroup(draft: GroupDraft) {
  const errors: Record<string, string> = {}
  required(draft.title, "請填寫活動名稱", errors, "title")
  required(draft.merchant, "請填寫主辦或商戶", errors, "merchant")
  required(draft.priceLabel, "請填寫價格", errors, "priceLabel")
  required(draft.unitLabel, "請填寫單位，例如張、位、盒", errors, "unitLabel")
  required(draft.summary, "請填寫簡介", errors, "summary")
  required(draft.detail, "請填寫活動詳情", errors, "detail")
  if (!Number.isInteger(draft.threshold) || draft.threshold < 1) errors.threshold = "成團門檻須為 1 或以上的整數"
  if (!Number.isInteger(draft.perPerson) || draft.perPerson < 1) errors.perPerson = "每人上限須為 1 或以上的整數"
  if (draft.limit != null && (!Number.isInteger(draft.limit) || draft.limit < 1)) errors.limit = "名額上限須為整數，或不填"
  if (draft.limit != null && draft.limit < draft.threshold) errors.limit = "名額上限不可少於成團門檻"
  if (!draft.deadline || Number.isNaN(new Date(draft.deadline).getTime())) errors.deadline = "請選擇截止時間"
  return errors
}

function person(userId: string, name: string, dept: string, qty: number, at: string): Signup {
  return { userId, name, dept, qty, at }
}

type OfferSeed = Omit<Offer, "reviewStatus" | "submittedById" | "submittedByName" | "reviewNote" | "reviewedAt" | "image">

const OFFERS: OfferSeed[] = [
  {
    id: "off-check",
    title: "全身檢查員工價八折",
    merchant: "安和醫療中心",
    category: "health",
    summary: "員工及直系家屬預約基本或標準全身檢查，可享八折。",
    detail: "適用於「基本」及「標準」計劃，包括驗血及報告解說。員工可為配偶或子女各預約一次。檢查後 14 日內由護士講解報告。",
    howToRedeem: "致電 2888 0101 預約，說明公司名稱及員工編號。到診當日出示職員證。",
    terms: "專科轉介項目、公眾假期檢查不適用。",
    discount: "8 折",
    code: "",
    location: "銅鑼灣恩平道",
    validFrom: "2026-10-01",
    validUntil: "2027-03-31",
    tags: ["new"],
    published: true,
    updatedAt: "2026-11-01T02:00:00+08:00",
  },
  {
    id: "off-optical",
    title: "鏡框連鏡片七折",
    merchant: "明眸視光",
    category: "health",
    summary: "選購白色標籤鏡框，連標準鏡片享七折。",
    detail: "可補差價升級防藍光鏡片。度數以驗眼當日為準，驗眼費用已包含在員工價內。",
    howToRedeem: "到店出示職員證，店員會以員工價開單，無須優惠碼。",
    terms: "太陽眼鏡、隱形眼鏡溶液及已減價貨品除外。每人限用兩次。",
    discount: "7 折",
    code: "",
    location: "旺角西洋菜南街",
    validFrom: "2026-09-01",
    validUntil: "2026-12-31",
    tags: ["limited"],
    published: true,
    updatedAt: "2026-10-08T02:00:00+08:00",
  },
  {
    id: "off-dental",
    title: "洗牙員工價 $280",
    merchant: "皓齒牙科",
    category: "health",
    summary: "洗牙連口腔檢查由 $480 調整為 $280。",
    detail: "包括超聲波洗牙、基本口腔檢查及護理建議。如需補牙或杜牙根，醫生會另行列明報價。",
    howToRedeem: "WhatsApp 預約時報上優惠碼，到診出示職員證。",
    terms: "缺席須提前一日通知，否則該次資格作廢。",
    discount: "$280",
    code: "DENT-280",
    location: "觀塘開源道",
    validFrom: "2026-01-01",
    validUntil: "2027-06-30",
    tags: [],
    published: true,
    updatedAt: "2026-07-01T02:00:00+08:00",
  },
  {
    id: "off-greens",
    title: "堂食八五折",
    merchant: "青葉中菜",
    category: "food",
    summary: "晚市堂食全單八五折，適合小組用膳。",
    detail: "適用於食品及茶芥，不適用於酒水、加一服務費及宴會菜單。一張帳單最多 12 位。",
    howToRedeem: "入座時告知店員使用員工優惠，結帳出示職員證。",
    terms: "公眾假期及農曆年初一至初七除外，不可與店內其他推廣同時使用。",
    discount: "85 折",
    code: "",
    location: "中環、尖沙咀",
    validFrom: "2026-11-01",
    validUntil: "2027-01-31",
    tags: ["new"],
    published: true,
    updatedAt: "2026-10-25T02:00:00+08:00",
  },
  {
    id: "off-coffee",
    title: "平日下午茶買一送一",
    merchant: "午後咖啡",
    category: "food",
    summary: "平日 15:00 前，任何手調飲品買一送一。",
    detail: "第二杯須為同等或較低價格，熱飲或冰飲均可。每單限享一次。",
    howToRedeem: "點餐時出示職員證。建議避開午市繁忙時段。",
    terms: "週末、公眾假期及瓶裝飲料不適用。",
    discount: "買一送一",
    code: "",
    location: "金鐘、觀塘",
    validFrom: "2026-11-01",
    validUntil: "2026-11-18",
    tags: ["limited"],
    published: true,
    updatedAt: "2026-11-02T02:00:00+08:00",
  },
  {
    id: "off-mart",
    title: "糧油乾貨九折",
    merchant: "鮮選超市",
    category: "food",
    summary: "米、油、麵及罐頭等指定糧油乾貨九折。",
    detail: "店內綠色「員工價」標籤貨品適用。生鮮、雪糕及煙酒除外。",
    howToRedeem: "收銀前出示職員證，收銀員會掃描員工價。",
    terms: "不可疊加會員日折扣。單一貨品超過 12 件請先向分店查詢。",
    discount: "9 折",
    code: "",
    location: "各區指定分店",
    validFrom: "2026-08-01",
    validUntil: "2027-02-28",
    tags: [],
    published: true,
    updatedAt: "2026-09-30T02:00:00+08:00",
  },
  {
    id: "off-fair",
    title: "聖誕市集餐飲券減 $50",
    merchant: "海濱市集",
    category: "food",
    summary: "12 月 1 日起，市集指定攤檔每張帳單減 $50。",
    detail: "帳單滿 $150 可使用一次。攤檔門口貼有員工優惠標誌。",
    howToRedeem: "付款時出示職員證及此頁面。",
    terms: "酒類攤檔及門票不適用。活動結束後優惠同時完結。",
    discount: "減 $50",
    code: "",
    location: "中環海濱",
    validFrom: "2026-12-01",
    validUntil: "2026-12-26",
    tags: ["new"],
    published: true,
    updatedAt: "2026-11-06T01:00:00+08:00",
  },
  {
    id: "off-hotel",
    title: "員工客房 $880 起",
    merchant: "海景假期酒店",
    category: "travel",
    summary: "標準海景房員工價由 $880 起，含兩位早餐。",
    detail: "週五、週六及公眾假期前夕為 $1,180。可加床（$200）。入住前 3 日 18:00 前可免費取消。",
    howToRedeem: "以公司電郵寄到 stay@haiking.example，主題註明員工編號及入住日期，並附上優惠碼。",
    terms: "只供員工及同行親友入住，不可轉售。爆滿日期酒店可以停收。",
    discount: "$880 起",
    code: "STAY-880",
    location: "北角城市花園道",
    validFrom: "2026-11-01",
    validUntil: "2027-06-30",
    tags: ["new"],
    published: true,
    updatedAt: "2026-11-03T02:00:00+08:00",
  },
  {
    id: "off-buffet",
    title: "自助晚餐七五折",
    merchant: "港灣景酒店",
    category: "travel",
    summary: "週一至週四自助晚餐員工價七五折。",
    detail: "成人正價 $680，員工價 $510。12 歲以下小童半價。",
    howToRedeem: "至少提前一日致電餐廳預訂，報上優惠碼。",
    terms: "週五、週六、週日及平安夜不適用。座位視乎當日預訂。",
    discount: "75 折",
    code: "FEAST75",
    location: "金鐘",
    validFrom: "2026-11-06",
    validUntil: "2026-12-24",
    tags: ["limited"],
    published: true,
    updatedAt: "2026-10-18T02:00:00+08:00",
  },
  {
    id: "off-ferry",
    title: "來回船票八折",
    merchant: "跨海渡輪",
    category: "transport",
    summary: "成人普通位來回船票八折，購票當日有效。",
    detail: "適用於中環至尖沙咀普通位。豪華位維持正價。",
    howToRedeem: "碼頭售票處出示職員證，或於船公司網頁輸入優惠碼。",
    terms: "煙火夜及農曆新年假期除外。",
    discount: "8 折",
    code: "FERRY8",
    location: "中環 ↔ 尖沙咀",
    validFrom: "2026-10-01",
    validUntil: "2026-12-31",
    tags: ["limited"],
    published: true,
    updatedAt: "2026-10-12T02:00:00+08:00",
  },
  {
    id: "off-taxi",
    title: "電子禮券九折",
    merchant: "城市的士",
    category: "transport",
    summary: "$200 電子禮券以 $180 購買，可分次使用。",
    detail: "兌換後禮券會寄到公司電郵，有效期 6 個月，可用於城市的士 App 叫車。",
    howToRedeem: "在 App「禮券」頁輸入優惠碼。",
    terms: "每名員工每季限購 4 張，不設退款。",
    discount: "9 折",
    code: "TAXI200",
    location: "全港",
    validFrom: "2026-11-01",
    validUntil: "2027-01-31",
    tags: ["new"],
    published: true,
    updatedAt: "2026-10-28T02:00:00+08:00",
  },
  {
    id: "off-parking",
    title: "平日泊車首兩小時半價",
    merchant: "都會商場",
    category: "transport",
    summary: "平日 10:00–19:00 進場，首兩小時半價。",
    detail: "其後按商場標準時租計算。電單車不適用。",
    howToRedeem: "離場前到地庫服務台出示職員證及泊車票，換領半價確認。",
    terms: "週末、公眾假期及商場活動日不適用。",
    discount: "半價",
    code: "",
    location: "九龍灣",
    validFrom: "2026-07-01",
    validUntil: "2027-03-31",
    tags: [],
    published: true,
    updatedAt: "2026-09-15T02:00:00+08:00",
  },
  {
    id: "off-home",
    title: "指定家電九折",
    merchant: "家居坊",
    category: "daily",
    summary: "小家電及指定大家電員工價九折。",
    detail: "店內橙色標籤型號適用，包括煮飯煲、吸塵機及部分雪櫃。送貨費另計。",
    howToRedeem: "落單時出示職員證。如需報價單，可讓店員註明員工編號。",
    terms: "樣板機、安裝工程及延保計劃除外。",
    discount: "9 折",
    code: "",
    location: "沙田、黃竹坑",
    validFrom: "2026-11-03",
    validUntil: "2027-01-15",
    tags: ["new"],
    published: true,
    updatedAt: "2026-10-20T02:00:00+08:00",
  },
  {
    id: "off-laundry",
    title: "乾洗八折",
    merchant: "淨亮洗衣",
    category: "daily",
    summary: "衫、裙、外套乾洗八折。",
    detail: "一般成衣約 3 個工作天可取。皮草、婚紗及窗簾清洗維持正價。",
    howToRedeem: "落單時出示職員證。",
    terms: "加急服務不適用。",
    discount: "8 折",
    code: "",
    location: "全港分店",
    validFrom: "2026-04-01",
    validUntil: "2027-03-31",
    tags: [],
    published: true,
    updatedAt: "2026-08-20T02:00:00+08:00",
  },
  {
    id: "off-cinema",
    title: "2D 戲票七折",
    merchant: "星光戲院",
    category: "leisure",
    summary: "正價 2D 戲票七折，網上或戲院櫃位均可用。",
    detail: "不適用於 IMAX、4DX 及特別場。每位員工每星期限購 4 張。",
    howToRedeem: "網上購票輸入優惠碼，或櫃位出示職員證。",
    terms: "首映午夜場除外。優惠期內逢星期六 18:00 後不適用。",
    discount: "7 折",
    code: "MOVIE7",
    location: "太古、屯門、元朗",
    validFrom: "2026-11-01",
    validUntil: "2026-11-20",
    tags: ["limited"],
    published: true,
    updatedAt: "2026-11-04T02:00:00+08:00",
  },
  {
    id: "off-gym",
    title: "首三個月月費半價",
    merchant: "動感健身",
    category: "leisure",
    summary: "新加入會籍，首三個月月費半價，無須一次過預繳全年。",
    detail: "其後按所選會籍正價，包括團體課。私人教練課程另計。",
    howToRedeem: "到會所出示職員證及此頁面，會所同事會開立員工會籍。",
    terms: "現有會員續會不適用。三個月內退會須補回已享折扣。",
    discount: "半價",
    code: "",
    location: "中環、觀塘",
    validFrom: "2026-11-01",
    validUntil: "2027-02-28",
    tags: ["new"],
    published: true,
    updatedAt: "2026-11-05T02:00:00+08:00",
  },
  {
    id: "off-draft",
    title: "週六上午檢查時段",
    merchant: "盈康體檢",
    category: "health",
    summary: "擬新增週六上午基本檢查，人事部仍在核對價錢。",
    detail: "草案價錢為 $1,680。待中心回覆合約後先上架，同事暫時看不到。",
    howToRedeem: "未上架，請勿對外發放。",
    terms: "待審核。",
    discount: "待定",
    code: "",
    location: "尖沙咀",
    validFrom: "2026-12-01",
    validUntil: "2027-05-31",
    tags: ["new"],
    published: false,
    updatedAt: "2026-11-05T08:00:00+08:00",
  },
  {
    id: "off-expired",
    title: "下午茶套餐 $68",
    merchant: "夏日冰室",
    category: "food",
    summary: "季節優惠已結束，保留作下架示範。",
    detail: "下午茶套餐包括一杯凍飲及一件糕點。此優惠已過期，員工列表不會顯示。",
    howToRedeem: "已過期。",
    terms: "只在 2026 年 6 月至 8 月適用。",
    discount: "$68",
    code: "",
    location: "銅鑼灣",
    validFrom: "2026-06-01",
    validUntil: "2026-08-31",
    tags: ["limited"],
    published: true,
    updatedAt: "2026-08-01T02:00:00+08:00",
  },
]

const GROUPS: Omit<GroupBuy, "image">[] = [
  {
    id: "gb-xmas",
    title: "聖誕超市禮券",
    merchant: "鮮選超市",
    summary: "$500 禮券以 $460 團購，成團後由人事部統一購買派發。",
    detail: "每人最多 3 張。成團後費用於 12 月薪金扣除，禮券預計 12 月 18 日前經部門文員派發。未成團不會扣款。",
    priceLabel: "HK$460",
    unitLabel: "張",
    threshold: 40,
    limit: 80,
    perPerson: 3,
    deadline: "2026-12-10T18:00:00+08:00",
    published: true,
    updatedAt: "2026-11-01T02:00:00+08:00",
    signups: [
      person("emp-chan", "陳嘉欣", "市場部", 1, "2026-11-04T03:20:00+08:00"),
      person("seed-wong", "黃志明", "財務部", 2, "2026-11-02T02:00:00+08:00"),
      person("seed-lam", "林曉彤", "資訊科技部", 2, "2026-11-02T04:00:00+08:00"),
      person("seed-ho", "何家俊", "人事部", 1, "2026-11-03T01:00:00+08:00"),
      person("seed-ng", "吳佩珊", "客戶服務部", 3, "2026-11-03T03:00:00+08:00"),
      person("seed-cheung", "張偉強", "工程部", 2, "2026-11-03T06:00:00+08:00"),
      person("seed-leung", "梁詠詩", "市場部", 2, "2026-11-04T01:00:00+08:00"),
      person("seed-ma", "馬啟聰", "財務部", 1, "2026-11-04T02:00:00+08:00"),
      person("seed-chow", "周美玲", "客戶服務部", 2, "2026-11-04T05:00:00+08:00"),
      person("seed-cheng", "鄭子朗", "工程部", 3, "2026-11-05T01:00:00+08:00"),
      person("seed-hui", "許凱晴", "資訊科技部", 2, "2026-11-05T02:30:00+08:00"),
      person("seed-yuen", "袁樂怡", "市場部", 2, "2026-11-05T04:00:00+08:00"),
      person("seed-choi", "蔡穎妍", "人事部", 2, "2026-11-05T06:00:00+08:00"),
      person("seed-fung", "馮家寶", "客戶服務部", 2, "2026-11-06T01:00:00+08:00"),
      person("seed-so", "蘇文迪", "工程部", 1, "2026-11-06T02:00:00+08:00"),
    ],
  },
  {
    id: "gb-trip",
    title: "長洲員工旅行",
    merchant: "人事部活動組",
    summary: "一天船程、行山及午餐，費用由參加者分擔。",
    detail: "11 月 28 日（星期六）上午 9 時於中環 5 號碼頭集合。名額 40 人，達 20 人成團。費用含來回船票及午餐，不含個人消費。",
    priceLabel: "HK$180",
    unitLabel: "位",
    threshold: 20,
    limit: 40,
    perPerson: 2,
    deadline: "2026-11-20T17:00:00+08:00",
    published: true,
    updatedAt: "2026-11-02T02:00:00+08:00",
    signups: [
      person("seed-a", "潘俊傑", "工程部", 2, "2026-11-01T02:00:00+08:00"),
      person("seed-b", "江嘉怡", "市場部", 2, "2026-11-01T03:00:00+08:00"),
      person("seed-c", "羅美儀", "財務部", 2, "2026-11-01T04:00:00+08:00"),
      person("seed-d", "鄧梓峰", "資訊科技部", 2, "2026-11-02T02:00:00+08:00"),
      person("seed-e", "葉倩雯", "客戶服務部", 2, "2026-11-02T03:00:00+08:00"),
      person("seed-f", "鍾家朗", "工程部", 2, "2026-11-02T04:00:00+08:00"),
      person("seed-g", "尹思穎", "人事部", 2, "2026-11-03T02:00:00+08:00"),
      person("seed-h", "施柏宇", "市場部", 2, "2026-11-03T03:00:00+08:00"),
      person("seed-i", "韓樂怡", "財務部", 2, "2026-11-03T04:00:00+08:00"),
      person("seed-j", "方志成", "客戶服務部", 2, "2026-11-04T02:00:00+08:00"),
      person("seed-k", "唐詠琳", "工程部", 2, "2026-11-04T03:00:00+08:00"),
    ],
  },
  {
    id: "gb-mooncake",
    title: "中秋禮盒",
    merchant: "青葉中菜",
    summary: "雙黃白蓮蓉禮盒已成團，並已於 9 月派發。",
    detail: "保留這次紀錄，方便同事睇到成團之後的狀態。示範環境不會再扣款。",
    priceLabel: "HK$268",
    unitLabel: "盒",
    threshold: 30,
    limit: 60,
    perPerson: 2,
    deadline: "2026-09-18T18:00:00+08:00",
    published: true,
    updatedAt: "2026-09-18T12:00:00+08:00",
    signups: ["高詠詩", "呂俊賢", "程嘉欣", "伍家輝", "邵美玲", "莫子健", "容曉晴", "譚柏霖", "溫凱琳", "阮志豪", "古樂怡", "冼家俊"].map((name, index) =>
      person(`seed-m${index + 1}`, name, index % 2 === 0 ? "市場部" : "財務部", 3, `2026-09-${String((index % 9) + 1).padStart(2, "0")}T04:00:00+08:00`),
    ),
  },
  {
    id: "gb-spring",
    title: "春季保健組合",
    merchant: "安和醫療中心",
    summary: "維他命及保健組合未達 30 份，已自動取消。",
    detail: "截止時只有 12 份，系統標為未達標。不會向已報名同事扣款。",
    priceLabel: "HK$199",
    unitLabel: "份",
    threshold: 30,
    limit: 40,
    perPerson: 2,
    deadline: "2026-10-15T18:00:00+08:00",
    published: true,
    updatedAt: "2026-10-15T12:00:00+08:00",
    signups: ["謝詠琪", "鄒志明", "彭嘉寶", "黎俊傑", "歐陽倩", "孫柏宇"].map((name, index) =>
      person(`seed-s${index + 1}`, name, "客戶服務部", 2, `2026-10-0${index + 1}T02:00:00+08:00`),
    ),
  },
  {
    id: "gb-flower",
    title: "新年花卉",
    merchant: "街坊花店",
    summary: "草案：年桔及桃花，待花店確認送貨檔期。",
    detail: "人事部仍在比較兩個報價。未上架前同事看不到這項團購。",
    priceLabel: "HK$128",
    unitLabel: "盆",
    threshold: 25,
    limit: 40,
    perPerson: 1,
    deadline: "2027-01-10T18:00:00+08:00",
    published: false,
    updatedAt: "2026-11-06T02:00:00+08:00",
    signups: [],
  },
]

const PENDING_OFFERS = new Set(["off-fair", "off-gym"])

const VIEW_WEIGHTS: [string, number][] = [
  ["off-greens", 42],
  ["off-coffee", 36],
  ["off-mart", 28],
  ["off-check", 22],
  ["off-cinema", 18],
  ["off-hotel", 14],
  ["off-buffet", 11],
  ["off-dental", 10],
  ["off-optical", 8],
  ["off-ferry", 7],
  ["off-taxi", 6],
  ["off-home", 5],
  ["off-laundry", 4],
  ["off-parking", 3],
]

function finishOffer(offer: OfferSeed): Offer {
  const reviewStatus: ReviewStatus = PENDING_OFFERS.has(offer.id) ? "pending" : offer.id === "off-draft" ? "returned" : offer.published ? "approved" : "draft"
  return {
    ...offer,
    tags: [...offer.tags],
    published: reviewStatus === "approved",
    reviewStatus,
    submittedById: "hr-lee",
    submittedByName: "李慧敏",
    reviewNote: reviewStatus === "returned" ? "請先向中心確認週六價錢，再重新提交。" : "",
    reviewedAt: reviewStatus === "approved" ? offer.updatedAt : "",
    image: demoPoster(offer.id),
  }
}

export function demoPoster(id: string) {
  const posters: Record<string, { kicker: string; title: string; note: string }> = {
    "off-coffee": { kicker: "午後咖啡 · 同事專享", title: "平日下午茶買一送一", note: "平日 15:00 前 · 出示職員證" },
    "off-cinema": { kicker: "星光戲院 · 同事專享", title: "2D 戲票七折", note: "優惠碼 MOVIE7" },
    "gb-xmas": { kicker: "鮮選超市 · 團購", title: "聖誕超市禮券", note: "$500 禮券 團購價 $460" },
  }
  const poster = posters[id]
  if (!poster) return ""
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="420" viewBox="0 0 960 420"><rect width="960" height="420" fill="#065f46"/><rect x="36" y="36" width="888" height="348" rx="28" fill="#f8fafc"/><text x="76" y="130" font-family="sans-serif" font-size="24" fill="#15803d">${poster.kicker}</text><text x="76" y="220" font-family="sans-serif" font-size="52" font-weight="700" fill="#0f172a">${poster.title}</text><text x="76" y="290" font-family="sans-serif" font-size="28" fill="#334155">${poster.note}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function buildViews(today: string): OfferView[] {
  const views: OfferView[] = []
  let index = 0
  for (const [offerId, count] of VIEW_WEIGHTS) {
    for (let i = 0; i < count; i++) {
      const hour = String((i % 8) + 9).padStart(2, "0")
      views.push({
        offerId,
        userId: `viewer-${index}`,
        at: `${addDays(today, -(i % 28))}T${hour}:15:00+08:00`,
      })
      index += 1
    }
  }
  for (let i = 0; i < 191; i++) {
    views.push({
      offerId: i % 3 === 0 ? "off-ferry" : "off-check",
      userId: `earlier-${i}`,
      at: `${addDays(today, -(31 + (i % 25)))}T10:15:00+08:00`,
    })
  }
  return views
}

export function createSeed(): Persisted {
  const today = todayHK()
  return {
    version: 2,
    userId: null,
    offers: OFFERS.map(finishOffer),
    groups: GROUPS.map((group) => ({
      ...group,
      image: demoPoster(group.id),
      signups: group.signups.map((signup) => ({ ...signup })),
    })),
    views: buildViews(today),
    savedByUser: { "emp-chan": ["off-hotel", "off-cinema"] },
  }
}

export function hasErrors(errors: Record<string, string>) {
  return Object.keys(errors).length > 0
}

export function toggleTag(tags: OfferTag[], tag: OfferTag): OfferTag[] {
  return tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag]
}
