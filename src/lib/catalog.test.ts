import assert from "node:assert/strict"
import {
  addDays,
  createSeed,
  groupStatus,
  maxQtyFor,
  queryOffers,
  signupQty,
  todayHK,
  validateOffer,
} from "./catalog"

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
assert.equal(visible.length, 16)
assert.equal(visible.some((offer) => offer.id === "off-draft" || offer.id === "off-expired"), false)
assert.deepEqual(
  queryOffers(seed.offers, { staffOnly: true, today, tag: "ending" }).map((offer) => offer.id).sort(),
  ["off-cinema", "off-coffee"],
)
assert.equal(queryOffers(seed.offers, { staffOnly: true, today, q: "洗牙" })[0]?.id, "off-dental")
assert.equal(queryOffers(seed.offers, { staffOnly: true, today, category: "leisure" }).length, 2)

const invalid = validateOffer({ ...seed.offers[0], title: "  ", validUntil: "2020-01-01" })
assert.equal(invalid.title, "請填寫優惠名稱")
assert.equal(invalid.validUntil, "結束日期不可早於開始日期")

console.log("catalog checks passed")
