export type HallFilter = "all" | "fulfilled" | "active"
export type HallSort = "recent" | "rarity"

type Props = {
  filter: HallFilter
  sort: HallSort
  onFilter: (next: HallFilter) => void
  onSort: (next: HallSort) => void
}

// 破棄した契約は表示しない方針のため "破棄" タブを削除。
// "失敗" も表示しない（今は failed 状態に遷移する経路自体ほぼ無いが、念のため見せない）。
const FILTERS: { id: HallFilter; label: string }[] = [
  { id: "all", label: "全て" },
  { id: "fulfilled", label: "達成" },
  { id: "active", label: "進行中" },
]

const SORTS: { id: HallSort; label: string; en: string }[] = [
  { id: "recent", label: "新しい順", en: "RECENT" },
  { id: "rarity", label: "レアリティ順", en: "BY RARITY" },
]

/**
 * 殿堂のフィルター + ソートバー。Design hall.jsx:174-248 を移植。
 * フィルターは「全て / 達成 / 進行中 / 破棄」の 4 種（"失敗" は意図的に省略）。
 */
function HallFilterBar({ filter, sort, onFilter, onSort }: Props) {
  return (
    <div className="px-1 pt-4 pb-2 flex flex-col gap-2.5">
      {/* filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              className="shrink-0 font-serif transition"
              style={{
                padding: "6px 14px",
                background: active ? "var(--color-ink)" : "transparent",
                color: active ? "var(--color-parchment-card)" : "var(--color-gold-muted)",
                border: `1px solid ${active ? "var(--color-ink)" : "var(--color-border-soft)"}`,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* sort */}
      <div className="flex justify-between items-center">
        <span
          className="font-display font-semibold"
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "var(--color-gold-muted)",
            paddingLeft: "0.3em",
          }}
          aria-hidden="true"
        >
          {SORTS.find((s) => s.id === sort)?.en}
        </span>
        <div
          className="inline-flex"
          style={{
            border: "1px solid var(--color-border-soft)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {SORTS.map((s) => {
            const active = sort === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSort(s.id)}
                className="font-serif transition"
                style={{
                  padding: "6px 12px",
                  background: active ? "var(--color-parchment)" : "#ffffff",
                  color: "var(--color-ink)",
                  border: "none",
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  borderLeft: active ? "1px solid rgba(201,169,97,0.33)" : "none",
                }}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HallFilterBar
