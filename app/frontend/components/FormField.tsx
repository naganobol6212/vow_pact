import type { InputHTMLAttributes } from "react"

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function FormField({ label, error, id, className = "", ...rest }: FormFieldProps) {
  const inputId = id ?? `field-${label}`
  const baseInputClass =
    "w-full px-4 py-2 bg-parchment border border-ink/30 rounded-sm font-sans text-ink placeholder-ink/40 focus:border-seal focus:outline-none transition"
  const errorClass = error ? "border-seal" : ""

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block mb-1 font-serif text-sm text-ink/80">
        {label}
      </label>
      <input
        id={inputId}
        className={`${baseInputClass} ${errorClass} ${className}`.trim()}
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
