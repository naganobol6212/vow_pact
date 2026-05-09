import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { api, ApiError } from "../lib/api"
import type { Pact, Crest } from "../types/pact"

type Author = {
  nickname: string
  avatar_image_url: string | null
  avatar_url: string | null
}

type PublicPact = Omit<Pact, "user_id" | "difficulty_reason" | "crest"> & {
  author: Author
  crest: Crest | null
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  active: { text: "進行中", className: "bg-seal/10 text-seal border-seal/30" },
  completed: { text: "達成", className: "bg-gold/20 text-ink border-gold" },
  failed: { text: "失敗", className: "bg-ink/10 text-ink/60 border-ink/30" },
  abandoned: { text: "破棄", className: "bg-ink/5 text-ink/40 border-ink/20" },
}

function PublicPactPage() {
  const { id } = useParams<{ id: string }>()

  const { data: pact, isLoading, isError } = useQuery<PublicPact, ApiError>({
    queryKey: ["public_pact", id],
    queryFn: () => api<PublicPact>(`/public/pacts/${id}`),
    enabled: !!id,
  })

  // 動的 OG image 生成は OOM / レンダリング不安定のため一時無効化中。
  // 再開する際は以下の useEffect（先取りフェッチ）も復活させる。
  // useEffect(() => {
  //   if (!id) return
  //   const ctrl = new AbortController()
  //   fetch(`/api/v1/public/pacts/${id}/og.png`, { signal: ctrl.signal }).catch(() => {})
  //   return () => ctrl.abort()
  // }, [id])

  // OGP / Twitter Card 用のメタタグを動的に注入。
  // 動的 OG image は無効化中のため og:image / twitter:image は出さず、
  // twitter:card は summary（画像なし）にする。
  useEffect(() => {
    if (!pact) return
    const origin = window.location.origin
    const url = `${origin}/p/${pact.id}`
    const title = `${pact.author.nickname} の誓約：${pact.goal}`
    const description = `制約：${pact.constraint_text} / 期日：${pact.deadline}`

    setMetaTag("name", "description", description)
    setMetaProperty("og:title", title)
    setMetaProperty("og:description", description)
    setMetaProperty("og:url", url)
    setMetaProperty("og:type", "website")
    setMetaProperty("twitter:card", "summary")
    setMetaProperty("twitter:title", title)
    setMetaProperty("twitter:description", description)
    document.title = title
  }, [pact])

  if (isLoading) {
    return (
      <Layout title="誓約">
        <p className="text-center text-ink/60 mt-12">読み込み中…</p>
      </Layout>
    )
  }

  if (isError || !pact) {
    return (
      <Layout title="誓約">
        <div className="max-w-md mx-auto mt-12 text-center">
          <p className="font-serif text-xl text-seal mb-3">公開された契約が見つかりません</p>
          <p className="text-sm text-ink/70 mb-6">
            この契約は非公開設定か、削除された可能性があります。
          </p>
          <Link to="/">
            <Button variant="primary">ホームへ</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const status = STATUS_LABEL[pact.status]
  const difficulty = Math.min(5, Math.max(0, pact.difficulty))
  const avatar = pact.author.avatar_image_url ?? pact.author.avatar_url

  return (
    <Layout title="誓約">
      <article className="max-w-2xl mx-auto">
        {/* 投稿者 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-parchment border-2 border-gold/40 flex items-center justify-center overflow-hidden shadow-sm">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div>
            <p className="font-serif text-base text-ink">{pact.author.nickname}</p>
            <p className="text-xs text-ink/50">の誓い</p>
          </div>
        </div>

        {/* 契約書 */}
        <div className="p-6 sm:p-8 bg-parchment border-2 border-gold/60 rounded-xl shadow-lg">
          <p className="font-serif text-center text-base text-seal mb-6">─── 誓 約 書 ───</p>

          <div className="flex items-start justify-between gap-3 mb-5">
            <span className={`text-xs px-2 py-0.5 rounded-sm border ${status.className}`}>
              {status.text}
            </span>
            <span className="text-xs text-ink/50">締結 {pact.signed_at.slice(0, 10)}</span>
          </div>

          <section className="mb-4">
            <p className="text-xs text-ink/60 font-serif mb-1">目標</p>
            <p className="font-serif text-xl text-ink leading-relaxed">{pact.goal}</p>
          </section>

          <section className="mb-4">
            <p className="text-xs text-ink/60 font-serif mb-1">制約</p>
            <p className="font-serif text-base text-ink leading-relaxed">{pact.constraint_text}</p>
          </section>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <section>
              <p className="text-xs text-ink/60 font-serif mb-1">期日</p>
              <p className="font-serif text-base text-ink">{pact.deadline}</p>
            </section>
            <section>
              <p className="text-xs text-ink/60 font-serif mb-1">難易度</p>
              <p className="font-serif text-base text-ink">
                {"⚔".repeat(difficulty)}
                <span className="text-ink/30">{"⚔".repeat(5 - difficulty)}</span>
              </p>
            </section>
          </div>

          {/* 達成済みなら紋章バッジ */}
          {pact.status === "completed" && pact.crest && (
            <div className="mt-6 pt-4 border-t border-gold/40 text-center">
              <p className="text-xs text-ink/60 font-serif mb-2">この誓いは成就した</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold rounded-lg">
                <span className="text-2xl">🏆</span>
                <span className="font-serif text-sm text-ink">
                  紋章「{pact.crest.rarity}」を授与
                </span>
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-ink/60 mb-4">あなたも誓約を結びませんか？</p>
          <Link to="/">
            <Button variant="primary">Vow Pact を始める</Button>
          </Link>
        </div>
      </article>
    </Layout>
  )
}

function setMetaTag(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

function setMetaProperty(key: string, value: string) {
  setMetaTag("property", key, value)
  // Twitter Card は name 属性も認識するため両方注入
  setMetaTag("name", key, value)
}

export default PublicPactPage
