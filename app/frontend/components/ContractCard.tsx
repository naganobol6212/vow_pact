import type { ReactNode } from "react"
import CornerOrnament from "./CornerOrnament"

type Props = {
  children: ReactNode
  /** カードの追加 className（margin 等の外側調整用）。 */
  className?: string
  /** 4 隅の鉤型装飾を出すか。デフォルト true。 */
  withCorners?: boolean
  /** 内側の二重線オフセット（px）。デフォルト 10。 */
  outlineOffset?: number
}

/**
 * 契約書らしい装飾を持ったカードラッパー。
 *
 * - 羊皮紙背景 + 金の枠
 * - 4 隅の CornerOrnament
 * - 内側に薄い金の二重線（outline 1px gold + outlineOffset で実現）
 * - わずかな影で浮き出させる
 *
 * Design signed.jsx ContractCard:177-310 のスタイルを抽象化。
 * PactDetailPage / SignedPage / 公開ページで共通利用する。
 */
function ContractCard({
  children,
  className = "",
  withCorners = true,
  outlineOffset = 10,
}: Props) {
  return (
    <article
      className={`relative ${className}`}
      style={{
        background: "var(--color-parchment)",
        border: "0.5px solid var(--color-border-soft)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 28px -16px rgba(44,24,16,0.35), 0 2px 4px rgba(44,24,16,0.06)",
        padding: "36px 26px 28px",
        outline: "1px solid var(--color-gold)",
        outlineOffset: `-${outlineOffset}px`,
      }}
    >
      {withCorners && (
        <>
          <CornerOrnament position="tl" />
          <CornerOrnament position="tr" />
          <CornerOrnament position="bl" />
          <CornerOrnament position="br" />
        </>
      )}
      {children}
    </article>
  )
}

export default ContractCard
