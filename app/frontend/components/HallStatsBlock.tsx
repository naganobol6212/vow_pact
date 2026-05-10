type Props = {
  /** 達成した契約数 */
  achievedCount: number
  /** 連続チェックイン日数（current streak）*/
  streak: number
  /** これまでの最長連続日数 */
  longestStreak: number
}

/**
 * 殿堂の統計ブロック（達成 / 連続 / 最長）。
 *
 * 旧版は FlameIcon が STREAK 列にだけ付いていて行が崩れる + パディング過大、と
 * フィードバックを受けたため、3 列とも完全同一レイアウト + コンパクト化に再構築。
 *
 * 各列は 3 行構造（英字 / 数値 / 和ラベル）で baseline を揃えるため、CSS Grid の
 * `subgrid` ではなく明示的に 3 列 grid を作って各列の row-template を一致させる。
 */
function HallStatsBlock({ achievedCount, streak, longestStreak }: Props) {
  return (
    <section
      aria-label="統計"
      className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-stretch"
      style={{
        margin: "12px 0 0",
        padding: "10px 6px",
        background: "rgba(255,255,255,0.55)",
        border: "1px solid var(--color-border-soft)",
        outline: "1px solid rgba(201,169,97,0.33)",
        outlineOffset: "-4px",
      }}
    >
      <StatCol en="ACHIEVED" value={achievedCount} unit="件" label="達成" />
      <StatDivider />
      <StatCol en="STREAK" value={streak} unit="日" label="連続" />
      <StatDivider />
      <StatCol en="LONGEST" value={longestStreak} unit="日" label="最長" />
    </section>
  )
}

function StatCol({
  en,
  value,
  unit,
  label,
}: {
  en: string
  value: number
  unit: string
  label: string
}) {
  return (
    <div
      className="grid"
      style={{
        // 3 段の高さを完全に揃えるため row 1fr の固定 grid。3 列とも同じ row-template になり
        // 横軸で英字 / 数値 / 和ラベルがピタリ揃う。
        gridTemplateRows: "auto auto auto",
        rowGap: 4,
        textAlign: "center",
      }}
    >
      {/* 1: 英字ラベル */}
      <div
        className="font-display font-semibold"
        style={{
          fontSize: 9,
          letterSpacing: "0.3em",
          color: "var(--color-gold-muted)",
          paddingLeft: "0.3em",
          lineHeight: 1.2,
        }}
        aria-hidden="true"
      >
        {en}
      </div>
      {/* 2: 数値 + 単位（baseline 揃えで横軸に並ぶ） */}
      <div className="inline-flex items-baseline justify-center" style={{ gap: 2 }}>
        <span
          className="font-display font-semibold"
          style={{
            fontSize: 22,
            color: "var(--color-gold-deep)",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 10, color: "var(--color-gold-muted)" }}>{unit}</span>
      </div>
      {/* 3: 和ラベル */}
      <div
        className="font-serif"
        style={{
          fontSize: 10,
          color: "var(--color-ink)",
          letterSpacing: "0.2em",
          paddingLeft: "0.2em",
          lineHeight: 1.2,
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
