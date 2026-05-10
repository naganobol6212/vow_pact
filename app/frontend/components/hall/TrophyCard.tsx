import { Link } from "react-router-dom"
import HeraldicCrest, { HERALDIC_RARITY } from "../HeraldicCrest"
import type { Pact } from "../../types/pact"

type Props = {
  pact: Pact
  /** 通し番号（リスト内の表示順、001 から）。 */
  no: string
  /** 達成率 0〜1。サマライズ済みを渡す（カードでは計算しない）。 */
  keptRate: number
}

/**
 * 殿堂の達成カード。HeraldicCrest が大きく中央に出る。
 * Design hall.jsx:253-372 を React 化。
 */
function TrophyCard({ pact, no, keptRate }: Props) {
  if (!pact.crest) return null
  const palette = HERALDIC_RARITY[pact.crest.rarity]
  const rarityLabel = palette.label
  const achievedAtLabel = pact.completed_at
    ? formatYearMonth(pact.completed_at)
    : "—"
  const keptPct = Math.round(keptRate * 100)

  return (
    <Link
      to={`/pacts/${pact.id}`}
      aria-label={`${pact.goal}（${rarityLabel}）の達成記録`}
      className="block text-center transition-all duration-200 ease-out hover:-translate-y-1"
      style={{
        background: "var(--color-parchment-card)",
        border: "0.5px solid var(--color-border-soft)",
        outline: "1px solid rgba(201,169,97,0.47)",
        outlineOffset: "-4px",
        padding: "30px 12px 14px",
        position: "relative",
        boxShadow: "var(--shadow-card)",
        color: "var(--color-ink)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card)"
      }}
    >
      {/* No. */}
      <span
        className="absolute font-display font-semibold"
        style={{
          top: 8,
          left: 10,
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "var(--color-gold-muted)",
          paddingLeft: "0.25em",
        }}
      >
        No. {no}
      </span>

      {/* tiny seal corner */}
      <span
        aria-hidden="true"
        className="absolute font-serif font-semibold"
        style={{
          top: 8,
          right: 10,
          fontSize: 9,
          color: "var(--color-seal)",
          letterSpacing: "0.2em",
        }}
      >
        ✓
      </span>

      {/* crest */}
      <div className="flex justify-center mb-2.5">
        <HeraldicCrest rarity={pact.crest.rarity} size={84} />
      </div>

      {/* divider */}
      <div
        className="mx-auto mb-2"
        style={{
          width: 60,
          height: 1,
          background: `linear-gradient(to right, transparent, ${palette.primary}55, transparent)`,
        }}
      />

      {/* goal */}
      <p
        className="font-serif font-semibold"
        style={{
          margin: "0 0 8px",
          fontSize: 12,
          lineHeight: 1.45,
          color: "var(--color-ink)",
          letterSpacing: "0.02em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 36,
        }}
      >
        {pact.goal}
      </p>

      {/* rarity pill */}
      <div
        className="inline-flex items-center mb-1.5"
        style={{
          gap: 5,
          padding: "3px 8px",
          background: "rgba(255,255,255,0.5)",
          border: `1px solid ${palette.primary}33`,
          borderRadius: 999,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: palette.primary,
          }}
        />
        <span
          className="font-serif font-semibold"
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            color: palette.primary,
          }}
        >
          {rarityLabel}
        </span>
      </div>

      {/* date + pct */}
      <div
        className="flex justify-center"
        style={{
          fontSize: 9,
          color: "var(--color-gold-muted)",
          letterSpacing: "0.08em",
          gap: 10,
        }}
      >
        <span>{achievedAtLabel}</span>
        <span aria-hidden="true">·</span>
        <span>達成率 {keptPct}%</span>
      </div>
    </Link>
  )
}

/** "2026-04-15T..." → "2026.04" */
function formatYearMonth(iso: string): string {
  const date = new Date(iso)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}.${m}`
}

export default TrophyCard
