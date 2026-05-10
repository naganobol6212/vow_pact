import { useMemo } from "react"
import { motion } from "framer-motion"

type Props = {
  /** 描画サイズ（px）。デフォルト 88。 */
  size?: number
  /** 押印の傾き（度）。デフォルト -8。 */
  rotate?: number
  /** 「斜めに落ちる」押印アニメーションを実行する。 */
  animate?: boolean
  className?: string
}

let sealIdCounter = 0

/**
 * 蝋印風の朱印（はんこ）。
 *
 * - 赤の radial gradient で「溶けた蝋」の深みを表現
 * - 上半分の円弧に「VOW · PACT · {ROMAN_YEAR}」（年は動的）
 * - 中央に大きな「誓」字（金色で押し上げられたエンボス感）
 * - 下部に控えめなドット装飾
 * - 外周に低周波のたゆたい（feTurbulence baseFrequency 0.05）で
 *   蝋が冷えて固まったような有機的な縁を出す
 *
 * 旧版は篆刻風のかすれ + 円周文字 + 中央剣交差まで詰め込んでおり、
 * 88px サイズで読み取れず文字も滲んでいたため、蝋印として「誓」一字を
 * 主役に据えたデザインに整理した。
 */
function PactSeal({ size = 88, rotate = -8, animate = false, className = "" }: Props) {
  const uid = useMemo(() => `seal-${++sealIdCounter}`, [])
  const romanYear = useMemo(() => toRomanNumerals(new Date().getFullYear()), [])

  // 押印アニメ：上から斜めに落ちて「ドン」と着地。spring で軽く跳ねる。
  const animationProps = animate
    ? {
        initial: { y: -120, rotate: rotate - 25, scale: 0.6, opacity: 0 },
        animate: { y: 0, rotate, scale: 1, opacity: 1 },
        transition: {
          type: "spring" as const,
          stiffness: 240,
          damping: 14,
          delay: 0.15,
        },
      }
    : { style: { transform: `rotate(${rotate}deg)` } }

  return (
    <motion.div
      aria-label="朱印 誓約"
      role="img"
      className={className}
      style={{
        // 蝋の立体感: 朱の発色 + 微かな影で押印された質感
        filter:
          "drop-shadow(0 3px 4px rgba(90,13,18,0.35)) drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
        flexShrink: 0,
        display: "inline-block",
      }}
      {...animationProps}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          {/* 蝋本体のラジアルグラデ：左上が明るく、右下が深い */}
          <radialGradient id={`${uid}-wax`} cx="0.38" cy="0.32" r="0.75">
            <stop offset="0%" stopColor="#c8323a" />
            <stop offset="55%" stopColor="#8b1a1a" />
            <stop offset="100%" stopColor="#5a0d12" />
          </radialGradient>
          {/* 中央エンボス字の影で立体感 */}
          <filter
            id={`${uid}-emboss`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" result="b" />
            <feOffset in="b" dx="0" dy="0.6" result="ob" />
            <feMerge>
              <feMergeNode in="ob" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* 外縁のたゆたい（低周波で大ぶり、蝋が冷えて固まった感） */}
          <filter
            id={`${uid}-edge`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="2"
              seed="9"
            />
            <feDisplacementMap in="SourceGraphic" scale="2.4" />
          </filter>
          {/* 円周文字パス（上半分のみ使う：startOffset 50% で 12 時方向） */}
          <path
            id={`${uid}-arc`}
            d="M 50 50 m -36 0 a 36 36 0 1 1 72 0"
          />
        </defs>

        {/* 蝋本体 + 内側ハイライト（外縁にだけ歪みを適用） */}
        <g filter={`url(#${uid}-edge)`}>
          <circle cx="50" cy="50" r="44" fill={`url(#${uid}-wax)`} />
          {/* 内側の薄いハイライト（蝋の盛り上がり感） */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.6"
          />
        </g>

        {/* 内ボーダー（くっきり線：印の縁取り） */}
        <circle
          cx="50"
          cy="50"
          r="37.5"
          fill="none"
          stroke="rgba(251,246,236,0.45)"
          strokeWidth="0.7"
        />

        {/* 円周文字（上半分のみ） */}
        <text
          fill="#fbf6ec"
          fontFamily="'Cormorant Garamond','Noto Serif JP',serif"
          fontSize="6.4"
          fontWeight="700"
          letterSpacing="3"
          opacity="0.92"
        >
          <textPath href={`#${uid}-arc`} startOffset="50%" textAnchor="middle">
            {`VOW · PACT · ${romanYear}`}
          </textPath>
        </text>

        {/* 中央の「誓」字（エンボス：金 + 上方向の薄影） */}
        <g filter={`url(#${uid}-emboss)`}>
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fontFamily="'Noto Serif JP', serif"
            fontSize="42"
            fontWeight="700"
            fill="#fbf6ec"
            opacity="0.96"
          >
            誓
          </text>
        </g>

        {/* 下部の控えめなドット装飾（円周文字との視覚バランス） */}
        <g opacity="0.55">
          <circle cx="50" cy="86" r="0.9" fill="#fbf6ec" />
          <circle cx="44" cy="85" r="0.55" fill="#fbf6ec" />
          <circle cx="56" cy="85" r="0.55" fill="#fbf6ec" />
        </g>
      </svg>
    </motion.div>
  )
}

/**
 * 西暦を篆刻風のローマ数字（MMXXVI など）に変換する。
 * 1〜3999 の範囲で正しく動く（VowPact の運用には十分）。
 */
function toRomanNumerals(num: number): string {
  const map: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ]
  let n = num
  let result = ""
  for (const [value, symbol] of map) {
    while (n >= value) {
      result += symbol
      n -= value
    }
  }
  return result
}

export default PactSeal
