import { describe, it, expect } from "vitest"
import { buildTweetUrl } from "./share"

describe("buildTweetUrl", () => {
  it("text のみで X の intent URL を返す", () => {
    const url = buildTweetUrl({ text: "hello" })
    expect(url).toBe("https://x.com/intent/post?text=hello")
  })

  it("text を URL エンコードする（日本語・改行・記号含む）", () => {
    const url = buildTweetUrl({ text: "誓い ⚔\n目標：本を読む" })
    // encodeURIComponent の結果と一致すること
    expect(url).toContain(encodeURIComponent("誓い ⚔\n目標：本を読む"))
    expect(url.startsWith("https://x.com/intent/post?text=")).toBe(true)
  })

  it("url を渡すと url クエリも付く", () => {
    const url = buildTweetUrl({ text: "hi", url: "https://example.com/p/1" })
    expect(url).toContain("text=hi")
    expect(url).toContain(`url=${encodeURIComponent("https://example.com/p/1")}`)
  })

  it("hashtags を渡すとカンマ区切りで hashtags クエリに付く（# 不要）", () => {
    // X 公式の intent 仕様：hashtags は # を付けずカンマ区切り
    const url = buildTweetUrl({ text: "hi", hashtags: ["vow_pact", "誓約契約"] })
    expect(url).toContain(`hashtags=${encodeURIComponent("vow_pact,誓約契約")}`)
  })

  it("空の hashtags 配列はクエリに含めない", () => {
    const url = buildTweetUrl({ text: "hi", hashtags: [] })
    expect(url).not.toContain("hashtags=")
  })

  it("hashtags の要素先頭の # は剥がす（誤入力対策）", () => {
    const url = buildTweetUrl({ text: "hi", hashtags: ["#vow_pact", "誓約"] })
    expect(url).toContain(`hashtags=${encodeURIComponent("vow_pact,誓約")}`)
  })
})
