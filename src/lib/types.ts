export type CategoryId =
  | "health"
  | "food"
  | "travel"
  | "transport"
  | "daily"
  | "leisure"

export type OfferTag = "new" | "limited"
export type Role = "employee" | "hr"

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
  updatedAt: string
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
  version: 1
  userId: string | null
  offers: Offer[]
  groups: GroupBuy[]
  savedByUser: Record<string, string[]>
}

export type OfferDraft = Omit<Offer, "updatedAt">
export type GroupDraft = Omit<GroupBuy, "updatedAt" | "signups">
