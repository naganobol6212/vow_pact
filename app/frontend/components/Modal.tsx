import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

type ModalProps = {
  // モーダルを閉じるコールバック。backdrop クリック / ESC キーで呼ばれる。
  onClose: () => void
  // モーダル本体の見出し要素の id を渡す（aria-labelledby 用）。
  labelledBy: string
  // backdrop クリックや ESC を一時的に無効化したい場合に true を渡す
  // （API の送信中などに UI を勝手に閉じさせたくないケース）。
  disableClose?: boolean
  children: ReactNode
}

// アクセシブルなモーダルの土台。
// - ESC で閉じる
// - 背景スクロールをロック（body.style.overflow を一時 hidden）
// - 開いた瞬間に内側の最初のフォーカス可能要素へフォーカスを当てる（focus-trap の最低限）
// - backdrop クリックで閉じる（disableClose が true の場合は無視）
//
// 完全な focus-trap（Tab/Shift+Tab で内側に閉じ込める）は本コンポーネントでは扱わない。
// 必要が出てきたら focus-trap-react などの導入を検討する。
function Modal({ onClose, labelledBy, disableClose = false, children }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableClose) onClose()
    }

    document.addEventListener("keydown", handleKeyDown)

    // 背景スクロールをロック。複数モーダルが重なるケースは想定外（その場合は別途参照カウントが必要）。
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // 開いた瞬間に内側の最初のフォーカス可能要素へフォーカス
    contentRef.current
      ?.querySelector<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
      ?.focus()

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, disableClose])

  const handleBackdropClick = () => {
    if (disableClose) return
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className="w-full max-w-md rounded-lg border-2 border-gold bg-parchment p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
