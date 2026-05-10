type Position = "tl" | "tr" | "bl" | "br"

type Props = {
  position: Position
  /** 線の色。デフォルト gold。 */
  color?: string
  /** 飾りのサイズ（px）。デフォルト 22。 */
  size?: number
}

const POSITION_STYLE: Record<Position, React.CSSProperties> = {
  tl: { top: 10, left: 10, transform: "rotate(0deg)" },
  tr: { top: 10, right: 10, transform: "rotate(90deg)" },
  bl: { bottom: 10, left: 10, transform: "rotate(-90deg)" },
  br: { bottom: 10, right: 10, transform: "rotate(180deg)" },
}

/**
 * 契約書カードなどの 4 隅に配置する金の鉤型装飾。
 * 親要素は `position: relative` を持っている前提（絶対配置するため）。
 * モックアップの signed.jsx:133-156 を React 化。
 */
function CornerOrnament({ position, color = "#c9a961", size = 22 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      style={{ position: "absolute", ...POSITION_STYLE[position], opacity: 0.55 }}
      aria-hidden="true"
    >
      <path
        d="M2 8 L2 2 L8 2 M2 2 L7 7"
        stroke={color}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default CornerOrnament
