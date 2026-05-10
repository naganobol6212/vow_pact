import { Link } from "react-router-dom"
import HeraldicCrest from "../HeraldicCrest"
import ProgressGrass from "../ProgressGrass"
import StarDivider from "../StarDivider"
import type { Pact, CrestRarity } from "../../types/pact"
import type { CheckIn } from "../../types/check_in"

type Props = {
  pact: Pact
  no: string
  checkIns: CheckIn[]
  /** 期日まで残り日数（負ならオーバー） */
  daysLeft: number
  /** 仮想 rarity（達成前の "もし達成すればこの色" 表示用） */
  predictedRarity?: CrestRarity
}

/**
 * 殿堂の進行中カード（フル幅）。
 *
 * Hall ページの 2 列グリッド内で `col-span-2` を当てて、草式と期日を
 * 主役にできる横長レイアウトにしている。Design hall.jsx:494-569 をベースに、
 * 「契約ごとの進捗を日付ベースで横長 GitHub 風に見せたい」要望に合わせて拡大。
 *
 * - 左: 薄い HeraldicCrest プレビュー
 * - 右上: No / ACTIVE バッジ + 目標
 * - 右中: ProgressGrass のフル版（月ラベル + 凡例 + タップで日付）
 * - 右下: 「期日まで N 日」を大きく
 */
function ActiveCard({ pact, no, checkIns, daysLeft, predictedRarity = "common" }: Props) {
  return (
    <Link
      to={`/pacts/${pact.id}`}
      aria-label={`${pact.goal}（進行中）の詳細を見る`}
      className="block transition-all duration-200 ease-out hover:-translate-y-1"
      style={{
        background: "#ffffff",
        border: `0.5px solid var(--color-rarity-${predictedRarity}-primary)55`,
        padding: "20px 18px 18px",
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
      <div className="flex items-start justify-between mb-3">
        <span
          className="font-display font-semibold"
          style={{
            fontSize: 10,
            letterSpacing: "0.25em",
            color: "var(--color-gold-muted)",
          }}
        >
          No. {no}
        </span>
        <span
          className="font-display font-bold"
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "var(--color-seal)",
          }}
        >
          ACTIVE
        </span>
      </div>

      {/* 目標を最上段に大きく */}
      <p
        className="font-serif font-semibold mb-3"
        style={{
          fontSize: 16,
          lineHeight: 1.45,
          color: "var(--color-ink)",
          letterSpacing: "0.02em",
        }}
      >
        {pact.goal}
      </p>

      <StarDivider />

      <div className="flex gap-4 mt-4 items-start">
        {/* 左: 薄い紋章プレビュー */}
        <div className="shrink-0 hidden sm:block">
          <HeraldicCrest rarity={predictedRarity} size={84} dimmed />
        </div>

        {/* 右: 草式（横長フル版）。カード全体が Link なのでセル自体はボタン化せず
            title 属性で日付ヒントだけ出す（HTML の入れ子制約回避）。 */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <ProgressGrass pact={pact} checkIns={checkIns} />
        </div>
      </div>

      {/* 期日まで N 日を大きく */}
      <div
        className="mt-5 pt-4 flex items-baseline justify-center gap-2"
        style={{ borderTop: "1px solid var(--color-border-soft)" }}
      >
        <span
          className="font-serif"
          style={{
            fontSize: 13,
            color: "var(--color-ink)",
            letterSpacing: "0.05em",
          }}
        >
          期日まで
        </span>
        <span
          className="font-display font-bold"
          style={{
            color: daysLeft <= 7 ? "var(--color-seal)" : "var(--color-gold-deep)",
            fontSize: 38,
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {Math.max(0, daysLeft)}
        </span>
        <span
          className="font-serif"
          style={{
            fontSize: 14,
            color: "var(--color-ink)",
            letterSpacing: "0.05em",
          }}
        >
          日
        </span>
      </div>
    </Link>
  )
}

export default ActiveCard
