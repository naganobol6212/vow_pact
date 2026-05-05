import { describe, it, expect } from "vitest"
import {
  SHARE_LABELS,
  SHARE_HASHTAGS,
  buildSignedShareText,
  buildCheckInShareText,
  buildFulfilledShareText,
} from "./share"

describe("SHARE_LABELS", () => {
  it("3 タイミング分のボタン文言が定義されている", () => {
    expect(SHARE_LABELS.signed).toBe("𝕏で天下に宣する")
    expect(SHARE_LABELS.checkIn).toBe("𝕏で歩みを刻む")
    expect(SHARE_LABELS.fulfilled).toBe("𝕏で栄光を示す")
  })
})

describe("SHARE_HASHTAGS", () => {
  it("vow_pact 共通ハッシュタグを持つ", () => {
    expect(SHARE_HASHTAGS).toContain("vow_pact")
  })
})

describe("buildSignedShareText", () => {
  it("目標・制約・期日を含む契約締結文を返す", () => {
    const text = buildSignedShareText({
      goal: "毎日30分読書する",
      constraintText: "夜22時以降スマホを触らない",
      deadline: "2026-06-30",
    })
    expect(text).toContain("毎日30分読書する")
    expect(text).toContain("夜22時以降スマホを触らない")
    expect(text).toContain("2026-06-30")
    // 世界観風の締めくくりを含む
    expect(text).toMatch(/誓|宣|約/)
  })
})

describe("buildCheckInShareText", () => {
  it("kept は誓いを守った文言を返す", () => {
    const text = buildCheckInShareText({ dayCount: 5, status: "kept" })
    expect(text).toContain("5")
    expect(text).toContain("守")
  })

  it("broken は誓いに揺れた文言を返す", () => {
    const text = buildCheckInShareText({ dayCount: 3, status: "broken" })
    expect(text).toContain("3")
    expect(text).toMatch(/揺|破/)
  })

  it("skipped は休戦の文言を返す", () => {
    const text = buildCheckInShareText({ dayCount: 7, status: "skipped" })
    expect(text).toContain("7")
    expect(text).toMatch(/休|戻/)
  })
})

describe("buildFulfilledShareText", () => {
  it("目標・期間・レアリティを含む達成文を返す", () => {
    const text = buildFulfilledShareText({
      goal: "毎日30分読書する",
      periodDays: 30,
      rarity: "rare",
    })
    expect(text).toContain("毎日30分読書する")
    expect(text).toContain("30")
    expect(text).toContain("rare")
    expect(text).toMatch(/成就|栄|達成/)
  })
})
