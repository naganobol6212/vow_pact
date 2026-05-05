import { useId } from "react"
import type { InputHTMLAttributes } from "react"

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function FormField({ label, error, id, className = "", ...rest }: FormFieldProps) {
  // useId は SSR 安全で、HTML 仕様に準拠した id を返すため、
  // 日本語ラベルを id に流用するパターン（無効な id 生成）を避けられる。
  const generatedId = useId()
  const inputId = id ?? generatedId
  const borderClass = error ? "border-seal" : "border-ink/30 focus:border-seal"
  const baseInputClass =
    "w-full px-4 py-2 bg-parchment border rounded-sm font-sans text-ink placeholder-ink/40 focus:outline-none transition"

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block mb-1 font-serif text-sm text-ink/80">
        {label}
      </label>
      <input
        id={inputId}
        className={`${baseInputClass} ${borderClass} ${className}`.trim()}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-seal" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
