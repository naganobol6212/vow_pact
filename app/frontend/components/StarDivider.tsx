type Props = {
  /** 区切り線の色。デフォルトは gold (#c9a961)。 */
  color?: string
  /** 中央の星サイズ（px）。デフォルト 14。 */
  starSize?: number
  className?: string
}

/**
 * 章末・セクション区切りに使う「両端から伸びる金線 + 中央の星」のディバイダ。
 * モックアップの signed.jsx:6-17 のデザインを React コンポーネント化。
 */
function StarDivider({ color = "#c9a961", starSize = 14, className = "" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center w-full ${className}`}
      style={{ gap: 12 }}
    >
      <span
        className="flex-1"
        style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${color}66, ${color})`,
        }}
      />
      <svg width={starSize} height={starSize} viewBox="0 0 14 14" fill="none">
        <path
          d="M7 0.5 L8.3 5.2 L13 5.7 L9.4 8.6 L10.6 13.3 L7 10.6 L3.4 13.3 L4.6 8.6 L1 5.7 L5.7 5.2 Z"
          fill={color}
        />
      </svg>
      <span
        className="flex-1"
        style={{
          height: 1,
          background: `linear-gradient(to left, transparent, ${color}66, ${color})`,
        }}
      />
    </div>
  )
}

export default StarDivider
