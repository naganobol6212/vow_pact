import { motion } from "framer-motion"

type Props = {
  /**
   * 紋章中央に表示する文字（絵文字 / シンボル）。デフォルトは ⚔。
   */
  symbol?: string
  /**
   * サイズ（px）。デフォルト 160。
   */
  size?: number
  /**
   * 「kept」のような特別演出を強調するか（true なら粒子が増える）。
   */
  emphasized?: boolean
}

/**
 * 誓約締結時 / 達成時に出る紋章のシール演出。
 * Framer Motion で：
 * - 中央のシールが拡大しながら回転して着地
 * - 周囲に粒子（ゴールド）が放射状に飛ぶ
 * - 同時にシール下から光のリングが広がる
 */
function CrestSeal({ symbol = "⚔", size = 160, emphasized = false }: Props) {
  const particleCount = emphasized ? 12 : 8

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* 光のリング（外側） */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-gold/60"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1.6], opacity: [0, 0.8, 0] }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />

      {/* 光のリング（内側、追従） */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-seal/40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1.4], opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.6, ease: "easeOut", delay: 0.15 }}
      />

      {/* 粒子（ゴールド） */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const distance = size * (emphasized ? 0.95 : 0.75)
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance
        return (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-gold"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x, y, opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 + i * 0.04 }}
          />
        )
      })}

      {/* シール本体（拡大しながら回転して着地） */}
      <motion.div
        className="relative w-full h-full rounded-full bg-parchment shadow-2xl ring-4 ring-seal/40 flex items-center justify-center"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 16,
          delay: 0.1,
        }}
      >
        {/* 内側の二重罫線 */}
        <div className="absolute inset-3 rounded-full border-2 border-gold/50 pointer-events-none" />
        <div className="absolute inset-5 rounded-full border border-gold/30 pointer-events-none" />

        {/* 中央のシンボル（脈動） */}
        <motion.span
          className="font-serif text-seal select-none"
          style={{ fontSize: size * 0.42 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, delay: 1.0 }}
        >
          {symbol}
        </motion.span>
      </motion.div>
    </div>
  )
}

export default CrestSeal
