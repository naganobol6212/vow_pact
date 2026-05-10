import HeraldicCrest from "./HeraldicCrest"
import StarDivider from "./StarDivider"
import type { CrestRarity } from "../types/pact"

type RankInfo = {
  rarity: CrestRarity
  label: string
  en: string
  description: string
}

// 紋章の階位とその意味。レアリティ算出は `difficulty × 達成率 × 期間スコア`。
// CrestGenerator (app/services/crest_generator.rb) の閾値をユーザー向けに翻訳した。
const RANKS: RankInfo[] = [
  {
    rarity: "common",
    label: "コモン",
    en: "COMMON",
    description: "短期間や易しめの誓いを成就した者に授かる、最初の証。",
  },
  {
    rarity: "rare",
    label: "レア",
    en: "RARE",
    description: "中程度の難易度を着実に乗り越えた者に与えられる青の盾。",
  },
  {
    rarity: "epic",
    label: "エピック",
    en: "EPIC",
    description: "難関な長期の試練を貫き通した、その意志の象徴。",
  },
  {
    rarity: "legendary",
    label: "レジェンダリー",
    en: "LEGENDARY",
    description: "究極の誓いを貫いた稀代の英雄にだけ刻まれる伝説。",
  },
]

/**
 * 「授かりうる紋章」の階位カタログ。
 *
 * Hall 下部に置き、ユーザーが「次に狙えるのはどの紋章か」を視認できるようにする。
 * 紋章レアリティは `difficulty × 達成率 × 期間スコア` で決まる旨も明記。
 */
function CrestCatalog() {
  return (
    <section
      aria-labelledby="crest-catalog-title"
      className="mt-10 px-2"
    >
      <header className="text-center mb-3">
        <div
          className="font-display font-semibold mb-1"
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            color: "var(--color-gold-deep)",
            paddingLeft: "0.55em",
          }}
          aria-hidden="true"
        >
          ── CREST RANKS ──
        </div>
        <h2
          id="crest-catalog-title"
          className="font-serif font-bold m-0"
          style={{
            fontSize: 18,
            letterSpacing: "0.16em",
            color: "var(--color-ink)",
            paddingLeft: "0.16em",
          }}
        >
          授かりうる紋章
        </h2>
      </header>

      <StarDivider />

      <p
        className="text-center font-serif italic mt-3 mb-5"
        style={{
          fontSize: 12,
          color: "var(--color-gold-muted)",
          letterSpacing: "0.04em",
        }}
      >
        難易度 × 達成率 × 期間 で階位が決まる。
      </p>

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RANKS.map((rank) => (
          <li
            key={rank.rarity}
            className="text-center px-3 py-4"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "0.5px solid var(--color-border-soft)",
              outline: `1px solid var(--color-rarity-${rank.rarity}-primary)33`,
              outlineOffset: "-4px",
            }}
          >
            <div className="flex justify-center mb-2.5">
              <HeraldicCrest rarity={rank.rarity} size={72} />
            </div>
            <p
              className="font-display font-semibold mb-1"
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                color: `var(--color-rarity-${rank.rarity}-primary)`,
                paddingLeft: "0.3em",
              }}
            >
              {rank.en}
            </p>
            <p
              className="font-serif font-semibold mb-2"
              style={{
                fontSize: 13,
                color: "var(--color-ink)",
                letterSpacing: "0.05em",
              }}
            >
              {rank.label}
            </p>
            <p
              className="font-serif"
              style={{
                fontSize: 10.5,
                color: "var(--color-ink)",
                lineHeight: 1.6,
                opacity: 0.75,
              }}
            >
              {rank.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CrestCatalog
