type Props = {
  size?: number
  color?: string
  className?: string
}

/** 炎アイコン。連続日数（streak）の視覚記号として使う。 */
function FlameIcon({ size = 14, color = "var(--color-gold)", className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 22c-4.5 0-7-3-7-7 0-3 2-5.5 3-7 0 1.5 1 2.5 2 2.5 0-3 1.5-6 5-8.5-1 4 4 6 4 11 0 5-2.5 9-7 9z"
        fill={color}
        stroke="#8b6f47"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default FlameIcon
