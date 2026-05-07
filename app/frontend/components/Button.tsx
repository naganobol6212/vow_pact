import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-seal text-parchment shadow-md hover:shadow-lg hover:brightness-110 active:brightness-95",
  secondary: "bg-gold text-ink shadow-md hover:shadow-lg hover:brightness-105 active:brightness-95",
  ghost: "bg-transparent text-seal border border-seal hover:bg-seal/10 hover:shadow-sm active:bg-seal/20",
  // 破棄など取り消せない操作向け。CTA そのものは red、控えめにしたい場合は ghost を使う。
  destructive: "bg-red-700 text-parchment shadow-md hover:brightness-110 active:brightness-95",
}

// フォーカスリング色は variant に追従させる（特に destructive は赤系で揃える）
const focusRingClasses: Record<ButtonVariant, string> = {
  primary: "focus-visible:ring-seal/40",
  secondary: "focus-visible:ring-seal/40",
  ghost: "focus-visible:ring-seal/40",
  destructive: "focus-visible:ring-red-700/40",
}

function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "px-6 py-3 font-serif font-bold rounded-lg transition-all duration-200 ease-out " +
    "hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed " +
    "disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
  const width = fullWidth ? "w-full" : ""
  const variantClass = variantClasses[variant]
  const focusRingClass = focusRingClasses[variant]

  return (
    <button
      className={`${base} ${focusRingClass} ${variantClass} ${width} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
