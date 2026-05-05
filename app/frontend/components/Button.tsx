import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-seal text-parchment hover:opacity-90",
  secondary: "bg-gold text-ink hover:opacity-90",
  ghost: "bg-transparent text-seal border border-seal hover:bg-seal/10",
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
    "px-6 py-3 font-serif font-bold rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
  const width = fullWidth ? "w-full" : ""
  const variantClass = variantClasses[variant]

  return (
    <button
      className={`${base} ${variantClass} ${width} ${className}`.trim()}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
