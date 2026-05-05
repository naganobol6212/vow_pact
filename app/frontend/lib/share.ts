// X (旧 Twitter) のシェア用 intent URL を生成する。
// OAuth は使わず、ユーザーのブラウザで X の投稿画面を開くだけのシンプルな方式。
// 公式仕様: https://twitter.com/intent/post?text=...&url=...&hashtags=tag1,tag2
//   - hashtags は # を付けずカンマ区切り（X 側で自動的に # が付く）

export type TweetUrlParams = {
  text: string
  url?: string
  hashtags?: string[]
}

export function buildTweetUrl({ text, url, hashtags }: TweetUrlParams): string {
  // URLSearchParams はスペースを + にエンコードするが、X の intent では %20 の方が
  // 確実に解釈されるため encodeURIComponent で個別に組み立てる。
  const parts: string[] = [`text=${encodeURIComponent(text)}`]
  if (url) parts.push(`url=${encodeURIComponent(url)}`)
  if (hashtags && hashtags.length > 0) {
    // 誤入力で先頭に # が付いていても剥がす（X 側で必ず # を付与するため二重 # を防ぐ）
    const cleaned = hashtags.map((h) => h.replace(/^#/, ""))
    parts.push(`hashtags=${encodeURIComponent(cleaned.join(","))}`)
  }
  return `https://x.com/intent/post?${parts.join("&")}`
}
