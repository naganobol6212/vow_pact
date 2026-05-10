import { Link } from "react-router-dom"
import type { Pact } from "../../types/pact"

type Props = {
  pact: Pact
  no: string
}

/**
 * 殿堂の破棄カード。グレースケール + 破線で「破棄された記録」を表現。
 * カード全体は契約詳細へのリンク（過去の判断を振り返れる）。
 * Design hall.jsx:378-489 を React 化。"再挑戦する" ボタンは新規契約導線へ。
 */
function AbandonedCard({ pact, no }: Props) {
  const abandonedAt = pact.updated_at ? formatYearMonth(pact.updated_at) : "—"
  return (
    <article
      className="text-center"
      style={{
        background: "rgba(244, 232, 208, 0.45)",
        border: "0.5px dashed #b3a890",
        padding: "30px 12px 14px",
        position: "relative",
        color: "#7a7060",
        filter: "grayscale(0.85)",
      }}
    >
      <span
        className="absolute font-display font-semibold"
        style={{
          top: 8,
          left: 10,
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "var(--color-gold-muted)",
        }}
      >
        No. {no}
      </span>
      <span
        className="absolute font-display font-semibold"
        style={{
          top: 8,
          right: 10,
          fontSize: 8,
          letterSpacing: "0.3em",
          color: "var(--color-gold-muted)",
        }}
      >
        ABANDONED
      </span>

      {/* placeholder where crest would be */}
      <div
        className="mx-auto mb-2.5 flex items-center justify-center font-serif"
        aria-hidden="true"
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          border: "1.5px dashed #a89c84",
          color: "#a89c84",
          fontSize: 11,
          letterSpacing: "0.15em",
          background: "rgba(255,255,255,0.4)",
        }}
      >
        破棄
      </div>

      <div
        className="mx-auto mb-2"
        style={{
          width: 60,
          height: 1,
          background: "rgba(168, 156, 132, 0.4)",
        }}
      />

      <p
        className="font-serif"
        style={{
          margin: "0 0 8px",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.45,
          color: "#7a7060",
          letterSpacing: "0.02em",
          textDecoration: "line-through",
          textDecorationColor: "#a89c84",
          textDecorationThickness: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 36,
        }}
      >
        {pact.goal}
      </p>

      <div
        className="mb-2"
        style={{
          fontSize: 9,
          color: "var(--color-gold-muted)",
          letterSpacing: "0.08em",
        }}
      >
        {abandonedAt} 破棄
      </div>

      <Link
        to="/pacts/new/step1"
        className="inline-block font-serif transition"
        style={{
          padding: "5px 12px",
          background: "transparent",
          border: "1px solid var(--color-gold-muted)",
          color: "var(--color-gold-muted)",
          fontSize: 11,
          letterSpacing: "0.08em",
          borderRadius: 2,
        }}
      >
        再挑戦する
      </Link>
    </article>
  )
}

function formatYearMonth(iso: string): string {
  const date = new Date(iso)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}.${m}`
}

export default AbandonedCard
