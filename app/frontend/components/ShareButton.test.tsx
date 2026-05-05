import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import ShareButton from "./ShareButton"

describe("ShareButton", () => {
  it("X の intent URL を href に持つ a タグを描画する", () => {
    render(<ShareButton text="hello" label="シェアする" />)
    const link = screen.getByRole("link", { name: /シェアする/ })
    expect(link).toHaveAttribute("href")
    expect(link.getAttribute("href")).toContain("https://x.com/intent/post?text=hello")
  })

  it("target=_blank と rel=noopener noreferrer を必ず付与する（セキュリティ）", () => {
    render(<ShareButton text="hi" label="シェア" />)
    const link = screen.getByRole("link", { name: /シェア/ })
    expect(link).toHaveAttribute("target", "_blank")
    // rel に noopener と noreferrer の両方を含む
    const rel = link.getAttribute("rel") ?? ""
    expect(rel).toContain("noopener")
    expect(rel).toContain("noreferrer")
  })

  it("hashtags / url を渡すと href に反映する", () => {
    render(
      <ShareButton text="hi" url="https://example.com/p/1" hashtags={["vow_pact"]} label="シェア" />
    )
    const link = screen.getByRole("link", { name: /シェア/ })
    const href = link.getAttribute("href") ?? ""
    expect(href).toContain("hashtags=vow_pact")
    expect(href).toContain(`url=${encodeURIComponent("https://example.com/p/1")}`)
  })
})
