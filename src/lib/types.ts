export type CategoryId =
  | "health"
  | "food"
  | "travel"
  | "transport"
  | "daily"
  | "leisure"

export type OfferTag = "new" | "limited"
export type Role = "employee" | "hr" | "supervisor"
export type ReviewStatus = "draft" | "pending" | "returned" | "approved"

export type User = {
  id: string
  name: string
  dept: string
  title: string
  role: Role
  email: string
}

export type Offer = {
  id: string
  title: string
  merchant: string
  category: CategoryId
  summary: string
  detail: string
  howToRedeem: string
  terms: string
  discount: string
  code: string
  location: string
  validFrom: string
  validUntil: string
  tags: OfferTag[]
  published: boolean
  reviewStatus: ReviewStatus
  submittedById: string
  submittedByName: string
  reviewNote: string
  reviewedAt: string
  updatedAt: string
}

export type OfferView = {
  offerId: string
  userId: string
  at: string
}

export type Signup = {
  userId: string
  name: string
  dept: string
  qty: number
  at: string
}

export type GroupBuy = {
  id: string
  title: string
  merchant: string
  summary: string
  detail: string
  priceLabel: string
  unitLabel: string
  threshold: number
  limit: number | null
  perPerson: number
  deadline: string
  signups: Signup[]
  published: boolean
  updatedAt: string
}

export type Persisted = {
  version: 2
  userId: string | null
  offers: Offer[]
  groups: GroupBuy[]
  views: OfferView[]
  savedByUser: Record<string, string[]>
}

export type OfferDraft = Omit<Offer, "updatedAt">
export type GroupDraft = Omit<GroupBuy, "updatedAt" | "signups">
