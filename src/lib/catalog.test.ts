import assert from "node:assert/strict"
import {
  addDays,
  approveOffer,
  categoryPopularity,
  createSeed,
  daysUntil,
  groupStatus,
  isHistoryOffer,
  isStaffVisible,
  maxQtyFor,
  queryOffers,
  signupQty,
  todayHK,
  resolvePoster,
  validateOffer,
} from "./catalog"
import { applyExpiry, dueReminders, monthlyReport } from "./lifecycle"
import { posterSrc } from "./poster"

const now = new Date("2026-11-06T04:00:00Z").getTime()
const today = "2026-11-06"
const seed = createSeed()

assert.equal(todayHK(new Date(now)), today)
assert.equal(addDays(today, 14), "2026-11-20")

const xmas = seed.groups.find((group) => group.id === "gb-xmas")
const trip = seed.groups.find((group) => group.id === "gb-trip")
const mooncake = seed.groups.find((group) => group.id === "gb-mooncake")
const spring = seed.groups.find((group) => group.id === "gb-spring")
assert.ok(xmas && trip && mooncake && spring)
assert.equal(signupQty(xmas), 28)
assert.equal(signupQty(trip), 22)
assert.equal(signupQty(mooncake), 36)
assert.equal(signupQty(spring), 12)
assert.equal(groupStatus(xmas, now), "open")
assert.equal(groupStatus(trip, now), "reached")
assert.equal(groupStatus(mooncake, now), "success")
assert.equal(groupStatus(spring, now), "cancelled")
assert.equal(maxQtyFor(xmas, "emp-chan"), 3)
assert.equal(maxQtyFor(trip, "emp-chan"), 2)

const visible = queryOffers(seed.offers, { staffOnly: true, today })
assert.equal(visible.length, 14)
assert.equal(visible.some((offer) => offer.id === "off-draft" || offer.id === "off-expired" || offer.id === "off-fair" || offer.id === "off-gym"), false)
assert.deepEqual(
  queryOffers(seed.offers, { staffOnly: true, today, tag: "ending" }).map((offer) => offer.id).sort(),
  ["off-cinema", "off-coffee"],
)
assert.equal(queryOffers(seed.offers, { staffOnly: true, today, q: "洗牙" })[0]?.id, "off-dental")
assert.equal(queryOffers(seed.offers, { staffOnly: true, today, category: "leisure" }).length, 1)

const fair = seed.offers.find((offer) => offer.id === "off-fair")
const gym = seed.offers.find((offer) => offer.id === "off-gym")
assert.ok(fair && gym)
assert.equal(fair.reviewStatus, "pending")
assert.equal(gym.reviewStatus, "pending")
assert.equal(isStaffVisible(fair, today), false)
const publishedFair = approveOffer(fair, "2026-11-06T08:00:00+08:00")
assert.equal(publishedFair.published, true)
assert.equal(isStaffVisible(publishedFair, today), true)

const coffee = seed.offers.find((offer) => offer.id === "off-coffee")
const cinema = seed.offers.find((offer) => offer.id === "off-cinema")
const dental = seed.offers.find((offer) => offer.id === "off-dental")
assert.equal(coffee?.image, "/posters/coffee.svg")
assert.equal(cinema?.image, "/posters/cinema.svg")
assert.equal(dental?.image, "")
assert.equal(xmas.image, "/posters/xmas.svg")
assert.equal(resolvePoster({ id: "off-coffee", image: "", updatedAt: "2026-11-02T02:00:00+08:00" }), "/posters/coffee.svg")
assert.equal(resolvePoster({ id: "off-coffee", updatedAt: "2026-11-02T02:00:00+08:00" }), "/posters/coffee.svg")
assert.equal(resolvePoster({ id: "off-coffee", image: "", updatedAt: "2026-11-10T01:00:00+08:00" }), "")
assert.equal(posterSrc("javascript:alert(1)"), "")
assert.equal(posterSrc(""), "")
assert.equal(posterSrc("/posters/coffee.svg"), "/posters/coffee.svg")
assert.equal(posterSrc("/posters/../secret.svg"), "")
assert.equal(daysUntil("2026-11-10", "2026-11-13"), 3)

const reminders = dueReminders(seed.offers, seed.savedByUser, [], "2026-11-10")
assert.equal(reminders.length, 1)
assert.equal(reminders[0]?.offerId, "off-cinema")
assert.equal(dueReminders(seed.offers, seed.savedByUser, reminders, "2026-11-10").length, 0)

const expired = seed.offers.find((offer) => offer.id === "off-expired")
assert.ok(expired && isHistoryOffer(expired, "2026-11-10"))
assert.ok(coffee)
const renewed = applyExpiry([{ ...coffee, autoRenew: true, validFrom: "2026-10-01", validUntil: "2026-10-31" }], "2026-11-10")
assert.ok(renewed[0].validUntil >= "2026-11-10" && renewed[0].published)
const removed = applyExpiry([{ ...coffee, autoRenew: false, expireAction: "unpublish", validFrom: "2026-10-01", validUntil: "2026-10-31" }], "2026-11-10")
assert.equal(removed[0].takenDown, true)
assert.equal(removed[0].published, false)

const report = monthlyReport(
  seed.offers,
  [
    { offerId: "off-coffee", userId: "a", dept: "市場部", at: "2026-11-03T09:00:00+08:00" },
    { offerId: "off-coffee", userId: "b", dept: "市場部", at: "2026-11-04T09:00:00+08:00" },
    { offerId: "off-check", userId: "c", dept: "財務部", at: "2026-11-04T09:00:00+08:00" },
  ],
  "2026-11-10",
)
assert.equal(report.topOffers[0]?.id, "off-coffee")
assert.equal(report.departments[0]?.dept, "市場部")
assert.equal(report.expiring.some((offer) => offer.id === "off-cinema"), true)
assert.equal(report.expiring.some((offer) => offer.autoRenew), false)

const popularity = categoryPopularity(seed.offers, seed.views, todayHK())
assert.equal(popularity.leader?.id, "food")
assert.equal(popularity.change, 12)
assert.ok(popularity.total > popularity.byCategory[1].clicks)

const invalid = validateOffer({ ...seed.offers[0], title: "  ", validUntil: "2020-01-01" })
assert.equal(invalid.title, "請填寫優惠名稱")
assert.equal(invalid.validUntil, "結束日期不可早於開始日期")

console.log("catalog checks passed")
