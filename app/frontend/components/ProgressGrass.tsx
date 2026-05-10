import { useMemo, useState } from "react"
import type { CheckIn, CheckInStatus } from "../types/check_in"
import type { Pact } from "../types/pact"

type Props = {
  pact: Pact
  checkIns: CheckIn[]
  /** Hall の進行中カードなど狭い場所用。月ラベル省略 + セル小。 */
  compact?: boolean
  /** タップで日付ツールチップを表示する（PactDetail ではフル機能、Hall では省略可）。 */
  interactive?: boolean
  className?: string
}

type CellStatus =
  | { kind: "out_of_period" }
  | { kind: "future" }
  | { kind: "missing" }
  | { kind: "checked"; status: CheckInStatus }

const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"]

/**
 * GitHub 草式の進捗グリッド。契約期間（signed_at 〜 deadline）の各日に、
 * チェックイン状態をマス目で表現する。
 *
 * - 縦軸: 月-日（7 行）
 * - 横軸: 週（N 列、契約期間で決まる）
 * - 月ラベル（フル版のみ）: 各月の最初の週の上に「2 月」「3 月」のように表示
 * - 凡例（フル版のみ）: 達成 / 破り / スキップ / 未 のサマリー
 * - 今日マーカー: 該当セルに gold-deep の枠
 *
 * 「日付がわかるようにしたい」要望のため、各セルは button + title 属性で
 * 「2026-03-15 達成」のような情報を持つ。フル版ではタップで下部に固定表示する。
 */
function ProgressGrass({
  pact,
  checkIns,
  compact = false,
  interactive = false,
  className = "",
}: Props) {
  const [activeCell, setActiveCell] = useState<{ date: string; status: CellStatus } | null>(
    null
  )

  // 期間計算とセル組み立てを useMemo で 1 回だけ実行。
  const grid = useMemo(() => buildGrid(pact, checkIns), [pact, checkIns])

  const cellSize = compact ? 7 : 14
  const cellGap = compact ? 2 : 3

  // 凡例の数値（達成 / 破り / スキップ）
  const summary = useMemo(() => summarize(checkIns, pact), [checkIns, pact])

  const ariaLabel = `${pact.goal} の進捗（${summary.totalDays}日中 ${summary.kept}日達成、${summary.broken}日破り、${summary.skipped}日スキップ）`

  return (
    <div className={`inline-block ${className}`} aria-label={ariaLabel} role="figure">
      {/* 月ラベル（フル版のみ） */}
      {!compact && (
        <div
          className="flex"
          style={{ marginLeft: cellSize + cellGap + 2, marginBottom: 4, gap: cellGap }}
        >
          {grid.weeks.map((week, weekIdx) => {
            const monthLabel = grid.monthLabels[weekIdx]
            return (
              <div
                key={`m-${weekIdx}`}
                style={{
                  width: cellSize,
                  fontSize: 10,
                  color: "var(--color-gold-muted)",
                  fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
                  letterSpacing: "0.05em",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  visibility: monthLabel ? "visible" : "hidden",
                }}
                aria-hidden="true"
              >
                {monthLabel}
              </div>
            )
          })}
        </div>
      )}

      {/* 本体グリッド：左端の曜日ラベル + 7×N のマス目 */}
      <div className="flex" style={{ gap: cellGap }}>
        {/* 曜日ラベル（フル版のみ） */}
        {!compact && (
          <div className="flex flex-col" style={{ gap: cellGap, marginRight: 2 }}>
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={label}
                style={{
                  height: cellSize,
                  width: cellSize,
                  fontSize: 9,
                  color: "var(--color-gold-muted)",
                  fontFamily: "'Noto Serif JP', serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // 偶数行だけラベルを出すと密度が落ち着く（GitHub 風）
                  visibility: i % 2 === 0 ? "visible" : "hidden",
                }}
                aria-hidden="true"
              >
                {label}
              </div>
            ))}
          </div>
        )}

        {/* マス目 */}
        {grid.weeks.map((week, weekIdx) => (
          <div
            key={`w-${weekIdx}`}
            className="flex flex-col"
            style={{ gap: cellGap }}
          >
            {week.map((cell, dayIdx) => {
              const colors = cellColors(cell.status)
              const isToday = cell.dateIso === grid.todayIso
              const tooltipText = cell.dateIso
                ? `${cell.dateIso} ${statusLabel(cell.status)}`
                : ""
              const cellStyle: React.CSSProperties = {
                width: cellSize,
                height: cellSize,
                backgroundColor: colors.bg,
                border: isToday
                  ? `1.5px solid var(--color-gold-deep)`
                  : colors.border
                    ? `0.5px solid ${colors.border}`
                    : "0.5px solid rgba(212, 200, 176, 0.6)",
                borderRadius: 1,
              }

              if (cell.status.kind === "out_of_period") {
                // 期間外は空白で詰める（クリックさせない）
                return (
                  <span
                    key={`d-${weekIdx}-${dayIdx}`}
                    style={{ ...cellStyle, visibility: "hidden" }}
                    aria-hidden="true"
                  />
                )
              }

              if (interactive) {
                return (
                  <button
                    key={`d-${weekIdx}-${dayIdx}`}
                    type="button"
                    aria-label={tooltipText}
                    title={tooltipText}
                    onClick={() => setActiveCell({ date: cell.dateIso, status: cell.status })}
                    style={{
                      ...cellStyle,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                )
              }

              return (
                <span
                  key={`d-${weekIdx}-${dayIdx}`}
                  title={tooltipText}
                  aria-label={tooltipText}
                  style={cellStyle}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* 凡例 + アクティブセルのツールチップ（フル版のみ） */}
      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <Legend label="達成" count={summary.kept} bg="var(--color-gold)" />
          <Legend label="破り" count={summary.broken} bg="var(--color-seal)" />
          <Legend label="スキップ" count={summary.skipped} bg="#9ca3af" />
          <Legend label="未" count={summary.missing} bg="rgba(244, 232, 208, 0.5)" />
        </div>
      )}

      {interactive && activeCell && (
        <p
          className="mt-2 text-xs font-serif text-ink/80"
          role="status"
          aria-live="polite"
        >
          {activeCell.date} {statusLabel(activeCell.status)}
        </p>
      )}
    </div>
  )
}

function Legend({ label, count, bg }: { label: string; count: number; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          backgroundColor: bg,
          border: "0.5px solid rgba(212, 200, 176, 0.6)",
          borderRadius: 1,
          display: "inline-block",
        }}
      />
      <span className="text-ink/70">
        {label} {count}
      </span>
    </span>
  )
}

// =====================================================================
// 内部ロジック
// =====================================================================

type Cell = { dateIso: string; status: CellStatus }

type Grid = {
  weeks: Cell[][]
  monthLabels: (string | null)[]
  todayIso: string
}

/**
 * 契約期間 + チェックイン履歴から、7×N のマス目データを組み立てる。
 *
 * - 契約期間の開始日（signed_at の日）を含む「月曜始まり」の週を起点とする
 * - 各セルに dateIso と status（out_of_period / future / missing / checked）を持たせる
 * - 月ラベル: 各週の最初の "月の 1 日" を含む週にだけ「N 月」を立てる
 */
function buildGrid(pact: Pact, checkIns: CheckIn[]): Grid {
  const startDate = parseIsoDate(pact.signed_at.slice(0, 10))
  const endDate = parseIsoDate(pact.deadline)
  const today = startOfToday()
  const todayIso = toIsoDate(today)

  // チェックイン履歴を Map にして O(1) 引き
  const checkInByDate = new Map<string, CheckInStatus>()
  for (const ci of checkIns) {
    checkInByDate.set(ci.checked_on, ci.status)
  }

  // 月曜始まりの週を計算（getDay は 0=日）
  const gridStart = mondayOfWeek(startDate)
  // 終端も月曜始まりに合わせて週末まで広げる
  const gridEnd = mondayOfWeek(endDate)
  gridEnd.setDate(gridEnd.getDate() + 6)

  // 週単位でループ
  const weeks: Cell[][] = []
  const monthLabels: (string | null)[] = []
  const cursor = new Date(gridStart)
  while (cursor.getTime() <= gridEnd.getTime()) {
    const week: Cell[] = []
    let labelForThisWeek: string | null = null
    for (let i = 0; i < 7; i++) {
      const dateIso = toIsoDate(cursor)
      const inPeriod =
        cursor.getTime() >= startDate.getTime() &&
        cursor.getTime() <= endDate.getTime()
      let status: CellStatus
      if (!inPeriod) {
        status = { kind: "out_of_period" }
      } else if (cursor.getTime() > today.getTime()) {
        status = { kind: "future" }
      } else if (checkInByDate.has(dateIso)) {
        status = { kind: "checked", status: checkInByDate.get(dateIso)! }
      } else {
        status = { kind: "missing" }
      }
      week.push({ dateIso, status })

      // この週に月初の日（1 日）が来たら、その月をラベルにする
      if (cursor.getDate() === 1 && inPeriod && !labelForThisWeek) {
        labelForThisWeek = `${cursor.getMonth() + 1}月`
      }

      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    monthLabels.push(labelForThisWeek)
  }

  return { weeks, monthLabels, todayIso }
}

function summarize(checkIns: CheckIn[], pact: Pact) {
  const startDate = parseIsoDate(pact.signed_at.slice(0, 10))
  const endDate = parseIsoDate(pact.deadline)
  const today = startOfToday()
  const periodEnd = today.getTime() < endDate.getTime() ? today : endDate

  // 期間内（開始 〜 今日 or 期日 のうち早い方）の日数
  const totalDays = Math.max(
    0,
    Math.floor((periodEnd.getTime() - startDate.getTime()) / 86400000) + 1
  )
  let kept = 0
  let broken = 0
  let skipped = 0
  for (const ci of checkIns) {
    const d = parseIsoDate(ci.checked_on)
    if (d.getTime() < startDate.getTime() || d.getTime() > endDate.getTime()) continue
    if (ci.status === "kept") kept++
    else if (ci.status === "broken") broken++
    else if (ci.status === "skipped") skipped++
  }
  const missing = Math.max(0, totalDays - (kept + broken + skipped))
  return { totalDays, kept, broken, skipped, missing }
}

function cellColors(status: CellStatus): { bg: string; border?: string } {
  switch (status.kind) {
    case "out_of_period":
      return { bg: "transparent" }
    case "future":
      return { bg: "var(--color-parchment-card)" }
    case "missing":
      return { bg: "rgba(244, 232, 208, 0.5)" } // very faint parchment
    case "checked":
      switch (status.status) {
        case "kept":
          return { bg: "var(--color-gold)", border: "var(--color-gold-deep)" }
        case "broken":
          return { bg: "var(--color-seal)", border: "var(--color-seal)" }
        case "skipped":
          return { bg: "#9ca3af", border: "#6b7280" }
      }
  }
}

function statusLabel(status: CellStatus): string {
  switch (status.kind) {
    case "out_of_period":
      return ""
    case "future":
      return "未来の日"
    case "missing":
      return "未記録"
    case "checked":
      return status.status === "kept"
        ? "達成"
        : status.status === "broken"
          ? "破り"
          : "スキップ"
  }
}

// =====================================================================
// 日付ユーティリティ（ローカルタイムゾーンで扱う）
// =====================================================================

/** "YYYY-MM-DD" 文字列をローカルタイムゾーンの Date に変換。 */
function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** Date をローカル "YYYY-MM-DD" 文字列に変換。 */
function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** 月曜始まりの週の最初の日を返す（Mon=0 ではなく実 Date を返す）。 */
function mondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  // Sun(0) → -6 戻る、Mon(1) → 0、Tue(2) → -1、...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export default ProgressGrass
