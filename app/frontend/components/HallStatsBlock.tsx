import FlameIcon from "./icons/FlameIcon"

type Props = {
  /** 達成した契約数 */
  achievedCount: number
  /** 連続チェックイン日数（current streak）*/
  streak: number
  /** これまでの最長連続日数 */
  longestStreak: number
}

/**
 * 殿堂の統計ブロック。Design hall.jsx:117-168 を移植 + ユーザー向けに分かりやすく調整。
 *
 * 旧版は「達成 / スコア / 連続」だったが、「スコア」が何を意味するか不明という
 * フィードバックを受け、「達成 / 連続 / 最長」に変更。3 つとも具体的な日数 / 件数で
 * 何の数字か直感的に分かる。フォント・サイズも 3 列で完全に揃えた。
 */
function HallStatsBlock({ achievedCount, streak, longestStreak }: Props) {
  return (
    <section
      aria-label="統計"
      className="grid grid-cols-3 gap-1.5"
      style={{
        margin: "16px 0 0",
        padding: "14px 8px",
        background: "rgba(255,255,255,0.55)",
        border: "1px solid var(--color-border-soft)",
        outline: "1px solid rgba(201,169,97,0.33)",
        outlineOffset: "-5px",
      }}
    >
      <StatCol label="達成" en="ACHIEVED" value={achievedCount} unit="件" />
      <StatDivider />
      <StatCol
        label="連続"
        en="STREAK"
        value={streak}
        unit="日"
        icon={<FlameIcon size={11} />}
      />
      <StatDivider />
      <StatCol label="最長" en="LONGEST" value={longestStreak} unit="日" />
    </section>
  )
}

function StatCol({
  label,
  en,
  value,
  unit,
  icon,
}: {
  label: string
  en: string
  value: number
  unit: string
  icon?: React.ReactNode
}) {
  return (
    <div className="text-center">
      <div
        className="font-display font-semibold flex items-center justify-center gap-1"
        style={{
          fontSize: 9,
          letterSpacing: "0.35em",
          color: "var(--color-gold-muted)",
          paddingLeft: "0.35em",
          marginBottom: 6,
        }}
        aria-hidden="true"
      >
        {icon}
        <span>{en}</span>
      </div>
      <div className="inline-flex items-baseline" style={{ gap: 3 }}>
        <span
          className="font-display font-semibold"
          style={{
            fontSize: 24,
            color: "var(--color-gold-deep)",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 11, color: "var(--color-gold-muted)" }}>{unit}</span>
      </div>
      <div
        className="font-serif"
        style={{
          fontSize: 10,
          color: "var(--color-ink)",
          letterSpacing: "0.25em",
          marginTop: 4,
          paddingLeft: "0.25em",
        }}
      >
        {label}
      </div>
    </div>
  )
}

function StatDivider() {
  return (
    <span
      aria-hidden="true"
      style={{
        background: "rgba(201,169,97,0.35)",
        width: 1,
        alignSelf: "stretch",
      }}
    />
  )
}

export default HallStatsBlock
