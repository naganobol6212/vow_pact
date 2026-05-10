import { useMemo } from "react"
import { motion } from "framer-motion"
import type { CrestRarity } from "../types/pact"

type Props = {
  rarity: CrestRarity
  /** 描画サイズ（px）。デフォルト 140。 */
  size?: number
  /** 達成時の出現アニメーション（spring + scale + rotate）を実行する。 */
  animate?: boolean
  /** 進行中契約のプレビュー用に薄く（opacity 0.35）描画する。 */
  dimmed?: boolean
  className?: string
}

type RarityPalette = {
  label: string
  en: string
  primary: string
  secondary: string
  glow: string
  decorations: number
}

// レアリティごとのパレット。Design fulfilled.jsx:10-51 を移植。
// 色は CSS 変数経由で参照することも可能だが、SVG の linearGradient stop に
// CSS 変数を渡すと一部ブラウザで描画されないため、ここではリテラル値で持つ。
const RARITY: Record<CrestRarity, RarityPalette> = {
  common: {
    label: "コモン",
    en: "COMMON",
    primary: "#7a7060",
    secondary: "#a89c84",
    glow: "rgba(168, 156, 132, 0.25)",
    decorations: 0,
  },
  rare: {
    label: "レア",
    en: "RARE",
    primary: "#3a5a8c",
    secondary: "#7a9bc2",
    glow: "rgba(80, 130, 200, 0.35)",
    decorations: 1,
  },
  epic: {
    label: "エピック",
    en: "EPIC",
    primary: "#6b3a8c",
    secondary: "#a877c7",
    glow: "rgba(140, 80, 180, 0.4)",
    decorations: 2,
  },
  legendary: {
    label: "レジェンダリー",
    en: "LEGENDARY",
    primary: "#a77b1f",
    secondary: "#e8c873",
    glow: "rgba(232, 200, 115, 0.55)",
    decorations: 3,
  },
}

// SVG <filter> / <linearGradient> の id がページ内で衝突するのを防ぐためのカウンタ。
// useMemo で同一インスタンスの間は安定化する。
let crestIdCounter = 0

/**
 * Heraldic Crest（紋章）。レアリティで色と装飾数が変わる SVG 紋章。
 *
 * - 上部：冠（5 つ尖った王冠ライク）
 * - 中央：盾形 + 中央バンドに「誓」字
 * - 下部：星（decorations + 1 個）
 * - 外周：8 点の装飾ドット環
 * - 両脇：月桂樹
 * - 背景：rarity 色のラジアルグロー
 *
 * 中央の "誓" はモックアップ準拠。central_motif（剣 / 月 / 炎 等）は意図的に
 * 描画せず、rarity だけで一貫した見た目に統一している（要望: ⚪ 1 回目の
 * 紋章が目玉（eye）の変なアイコンになる問題の解消）。
 */
function HeraldicCrest({
  rarity,
  size = 140,
  animate = false,
  dimmed = false,
  className = "",
}: Props) {
  const palette = RARITY[rarity]
  const uid = useMemo(() => `crest-${++crestIdCounter}`, [])

  const animationProps = animate
    ? {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: {
          type: "spring" as const,
          stiffness: 220,
          damping: 16,
          delay: 0.1,
        },
      }
    : {}

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        opacity: dimmed ? 0.35 : 1,
      }}
      aria-label={`紋章（${palette.label}）`}
      role="img"
      {...animationProps}
    >
      {/* radial glow（背景のふわっとした光）*/}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -size * 0.35,
          background: `radial-gradient(circle, ${palette.glow} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        style={{ position: "relative" }}
      >
        <defs>
          <linearGradient id={`${uid}-shield`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.secondary} />
            <stop offset="100%" stopColor={palette.primary} />
          </linearGradient>
          <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbf6ec" />
            <stop offset="100%" stopColor="#e8dec6" />
          </linearGradient>
          <filter id={`${uid}-rough`}>
            <feTurbulence baseFrequency="0.9" numOctaves="2" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="0.6" />
          </filter>
        </defs>

        {/* laurel left */}
        <g transform="translate(8, 60) rotate(-8)" opacity="0.8">
          <path
            d="M0 35 Q-2 25 0 18 Q-3 10 -2 0 Q3 8 5 18 Q3 28 0 35z"
            fill={palette.secondary}
            opacity="0.6"
          />
          <path
            d="M-4 30 Q-8 25 -10 20"
            stroke={palette.primary}
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M-4 18 Q-8 14 -10 10"
            stroke={palette.primary}
            strokeWidth="1"
            fill="none"
          />
        </g>
        {/* laurel right（左の鏡像）*/}
        <g transform="translate(132, 60) rotate(8) scale(-1, 1)" opacity="0.8">
          <path
            d="M0 35 Q-2 25 0 18 Q-3 10 -2 0 Q3 8 5 18 Q3 28 0 35z"
            fill={palette.secondary}
            opacity="0.6"
          />
          <path
            d="M-4 30 Q-8 25 -10 20"
            stroke={palette.primary}
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M-4 18 Q-8 14 -10 10"
            stroke={palette.primary}
            strokeWidth="1"
            fill="none"
          />
        </g>

        {/* shield body */}
        <path
          d="M70 14 L108 22 L108 70 Q108 100 70 122 Q32 100 32 70 L32 22 Z"
          fill={`url(#${uid}-shield)`}
          stroke={palette.primary}
          strokeWidth="1.5"
          filter={`url(#${uid}-rough)`}
        />
        {/* inner highlight */}
        <path
          d="M70 18 L104 25 L104 70 Q104 96 70 116 Q36 96 36 70 L36 25 Z"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />

        {/* central horizontal band */}
        <path
          d="M37 56 L103 56 L103 76 Q103 80 100 82 L70 90 L40 82 Q37 80 37 76 Z"
          fill={`url(#${uid}-band)`}
          stroke={palette.primary}
          strokeWidth="1"
        />

        {/* central kanji 誓 */}
        <text
          x="70"
          y="76"
          textAnchor="middle"
          fontFamily="'Noto Serif JP', serif"
          fontSize="22"
          fontWeight="700"
          fill={palette.primary}
          letterSpacing="0"
        >
          誓
        </text>

        {/* upper crown / fleur */}
        <g transform="translate(70, 28)">
          <path
            d="M-12 6 L-8 -2 L-4 4 L0 -6 L4 4 L8 -2 L12 6 Z"
            fill={palette.secondary}
            stroke={palette.primary}
            strokeWidth="0.8"
          />
          <circle cx="0" cy="-6" r="1.6" fill={palette.primary} />
        </g>

        {/* lower flourish — 星の数は rarity の decorations + 1 個 */}
        {palette.decorations > 0 && (
          <g transform="translate(70, 102)">
            {Array.from({ length: palette.decorations + 1 }).map((_, i) => {
              const offset = (i - palette.decorations / 2) * 8
              return (
                <path
                  key={i}
                  d={`M${offset} -3 L${offset + 1.4} -0.6 L${offset + 4} -0.2 L${offset + 2} 1.6 L${offset + 2.6} 4.4 L${offset} 3 L${offset - 2.6} 4.4 L${offset - 2} 1.6 L${offset - 4} -0.2 L${offset - 1.4} -0.6 Z`}
                  fill={palette.primary}
                />
              )
            })}
          </g>
        )}

        {/* outer ring of accent dots */}
        <g opacity="0.6">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2
            const cx = 70 + Math.cos(angle) * 60
            const cy = 70 + Math.sin(angle) * 60
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={i % 2 === 0 ? 1.2 : 0.6}
                fill={palette.primary}
              />
            )
          })}
        </g>
      </svg>
    </motion.div>
  )
}

export default HeraldicCrest
export { RARITY as HERALDIC_RARITY }
