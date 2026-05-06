import { buildTweetUrl } from "../lib/share"

type Props = {
  text: string
  label: string
  url?: string
  hashtags?: string[]
  className?: string
  // クリック時に副作用（公開化など）を投げたいときに使う。
  // ポップアップブロックを避けるため fire-and-forget で扱い、await はしない。
  onBeforeShare?: () => void | Promise<void>
}

// 𝕏（X）共有ボタン。OAuth は使わず、intent URL を新タブで開く方式。
// rel="noopener noreferrer" は target="_blank" 時のセキュリティ必須セット
// （window.opener 経由の乗っ取り防止 + Referrer 漏洩防止）。
function ShareButton({ text, label, url, hashtags, className = "", onBeforeShare }: Props) {
  const href = buildTweetUrl({ text, url, hashtags })
  const baseClass =
    "inline-flex items-center gap-2 px-5 py-2 bg-ink text-parchment font-serif font-bold rounded-sm hover:opacity-90 transition"

  const handleClick = () => {
    if (!onBeforeShare) return
    // ユーザージェスチャの同期コンテキストを保つため、onBeforeShare は直接呼ぶ。
    // Promise が返ってきた場合は catch を当てて未処理拒否を防ぐが、await はしない
    // （await するとブラウザの「クリック起点の新タブ」とみなされなくなり、ポップアップブロックの対象になりうる）。
    try {
      const result = onBeforeShare()
      if (result && typeof (result as Promise<void>).catch === "function") {
        ;(result as Promise<void>).catch(() => {})
      }
    } catch {
      // 同期例外も握り潰す（X 投稿はベストエフォートで継続）
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${baseClass} ${className}`.trim()}
    >
      <span aria-hidden="true">𝕏</span>
      <span>{label}</span>
    </a>
  )
}

export default ShareButton
