import { buildTweetUrl } from "../lib/share"

type Props = {
  text: string
  label: string
  url?: string
  hashtags?: string[]
  className?: string
}

// 𝕏（X）共有ボタン。OAuth は使わず、intent URL を新タブで開く方式。
// rel="noopener noreferrer" は target="_blank" 時のセキュリティ必須セット
// （window.opener 経由の乗っ取り防止 + Referrer 漏洩防止）。
function ShareButton({ text, label, url, hashtags, className = "" }: Props) {
  const href = buildTweetUrl({ text, url, hashtags })
  const baseClass =
    "inline-flex items-center gap-2 px-5 py-2 bg-ink text-parchment font-serif font-bold rounded-sm hover:opacity-90 transition"
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} ${className}`.trim()}
    >
      <span aria-hidden="true">𝕏</span>
      <span>{label}</span>
    </a>
  )
}

export default ShareButton
