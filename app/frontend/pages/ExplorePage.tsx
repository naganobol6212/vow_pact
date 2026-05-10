import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Layout from "../components/Layout"
import Button from "../components/Button"
import StarDivider from "../components/StarDivider"
import HeraldicCrest from "../components/HeraldicCrest"
import { api, ApiError } from "../lib/api"
import type { Crest, PactStatus } from "../types/pact"

type Author = {
  nickname: string
  avatar_image_url: string | null
  avatar_url: string | null
}

type PublicPactSummary = {
  id: number
  goal: string
  constraint_text: string
  difficulty: number
  deadline: string
  status: PactStatus
  title: string | null
  signed_at: string
  completed_at: string | null
  author: Author
  crest: Crest | null
}

type ExploreResponse = {
  pacts: PublicPactSummary[]
  page: number
  per_page: number
  total_count: number
  next_page: number | null
}

const STATUS_LABEL: Record<PactStatus, string> = {
  active: "進行中",
  completed: "達成",
  failed: "失敗",
  abandoned: "破棄",
}

/**
 * 誓約の広場（/explore）。
 *
 * is_public=true の契約を新着順に表示する。認証不要なので
 * 未ログインのユーザーが「他の人がどんな誓いを立てているか」を
 * 覗きに来られる。各カードから個別ページ /p/:id へ遷移可能。
 */
function ExplorePage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isFetching } = useQuery<ExploreResponse, ApiError>({
    queryKey: ["explore_pacts", page],
    queryFn: () => api<ExploreResponse>(`/public/pacts?page=${page}`),
    staleTime: 60_000,
  })

  return (
    <Layout title="誓約の広場">
      <div className="max-w-3xl mx-auto px-1">
        {/* ヘッダー */}
        <header className="text-center pt-4 pb-3">
          <div
            className="font-display font-semibold mb-2"
            style={{
              fontSize: 10,
              letterSpacing: "0.6em",
              color: "var(--color-gold-deep)",
              paddingLeft: "0.6em",
            }}
            aria-hidden="true"
          >
            ── EXPLORE ──
          </div>
          <h1
            className="font-serif font-bold m-0"
            style={{
              fontSize: "clamp(28px, 7.6vw, 34px)",
              letterSpacing: "0.16em",
              color: "var(--color-ink)",
              paddingLeft: "0.16em",
              lineHeight: 1.2,
            }}
          >
            <ruby>
              誓約
              <rt
                style={{
                  fontSize: "0.32em",
                  color: "var(--color-gold-deep)",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                せいやく
              </rt>
            </ruby>
            の
            <ruby>
              広場
              <rt
                style={{
                  fontSize: "0.32em",
                  color: "var(--color-gold-deep)",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                ひろば
              </rt>
            </ruby>
          </h1>
          <div
            className="mx-auto mt-3"
            style={{
              width: 110,
              height: 1,
              background:
                "linear-gradient(to right, transparent, var(--color-gold), transparent)",
            }}
          />
          <p
            className="font-serif italic mt-2.5"
            style={{
              fontSize: 12,
              color: "var(--color-gold-muted)",
              letterSpacing: "0.1em",
            }}
          >
            他の誓約者たちが、いま、何を誓っているか。
          </p>
        </header>

        {/* ローディング / エラー */}
        {isLoading && (
          <p className="text-center text-ink/60 mt-12">広場を開いている…</p>
        )}
        {isError && (
          <p className="text-center text-seal mt-12">広場を開けませんでした</p>
        )}

        {/* 空状態 */}
        {!isLoading && !isError && data && data.pacts.length === 0 && (
          <div className="text-center mt-12 px-6">
            <div className="mb-4 opacity-40 inline-block">
              <HeraldicCrest rarity="common" size={120} />
            </div>
            <p className="font-serif text-base text-ink/70 mb-3">
              まだ誰も公開していない。
            </p>
            <p className="text-xs text-ink/50 mb-6">
              あなたが最初の誓約者になりませんか？
            </p>
            <Link to="/pacts/new/step1">
              <Button variant="primary">契約を結ぶ</Button>
            </Link>
          </div>
        )}

        {/* カードリスト */}
        {data && data.pacts.length > 0 && (
          <main className="mt-5 space-y-3" aria-label="公開契約一覧">
            {data.pacts.map((pact, index) => (
              <motion.div
                key={pact.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(index * 0.04, 0.6),
                  ease: "easeOut",
                }}
              >
                <ExploreCard pact={pact} />
              </motion.div>
            ))}

            {/* もっと見る */}
            {data.next_page && (
              <div className="text-center pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                >
                  {isFetching ? "読み込み中…" : "もっと見る"}
                </Button>
              </div>
            )}

            {/* 件数表示 */}
            <p className="text-center text-xs text-ink/40 pt-2">
              {data.pacts.length} 件 / 全 {data.total_count} 件
            </p>
          </main>
        )}
      </div>
    </Layout>
  )
}

function ExploreCard({ pact }: { pact: PublicPactSummary }) {
  const status = STATUS_LABEL[pact.status]
  const difficulty = Math.min(5, Math.max(0, pact.difficulty))
  const avatar = pact.author.avatar_image_url ?? pact.author.avatar_url

  return (
    <article
      className="bg-parchment border border-gold/40 p-5"
      style={{
        position: "relative",
        boxShadow: "0 4px 12px -8px rgba(44,24,16,0.18)",
      }}
    >
      {/* 投稿者 */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full bg-parchment-card border-2 border-gold/40 flex items-center justify-center overflow-hidden shadow-sm"
          aria-hidden="true"
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm text-ink truncate">
            {pact.author.nickname}
          </p>
          <p className="text-[10px] text-ink/50">
            {pact.signed_at.slice(0, 10)} 締結
          </p>
        </div>
        {pact.status === "completed" && pact.crest && (
          <HeraldicCrest rarity={pact.crest.rarity} size={48} />
        )}
        {pact.status !== "completed" && (
          <span
            className={`text-xs px-2 py-0.5 rounded-sm border whitespace-nowrap ${
              pact.status === "active"
                ? "bg-seal/10 text-seal border-seal/30"
                : "bg-ink/5 text-ink/50 border-ink/20"
            }`}
          >
            {status}
          </span>
        )}
      </div>

      <StarDivider />

      {/* 目標・制約 */}
      <div className="mt-4 space-y-2">
        <div>
          <p
            className="font-display font-semibold mb-0.5"
            style={{
              fontSize: 9,
              letterSpacing: "0.4em",
              color: "var(--color-gold-muted)",
              paddingLeft: "0.4em",
            }}
          >
            GOAL
          </p>
          <p className="font-serif text-base text-ink leading-relaxed">
            {pact.goal}
          </p>
        </div>
        <div>
          <p
            className="font-display font-semibold mb-0.5"
            style={{
              fontSize: 9,
              letterSpacing: "0.4em",
              color: "var(--color-gold-muted)",
              paddingLeft: "0.4em",
            }}
          >
            TRIAL
          </p>
          <p className="font-serif text-sm text-ink/80 leading-relaxed line-clamp-2">
            {pact.constraint_text}
          </p>
        </div>
      </div>

      {/* メタ + 詳細リンク */}
      <div className="mt-4 pt-3 flex items-center justify-between border-t border-gold/20">
        <div className="flex items-center gap-3 text-xs text-ink/60">
          <span>期日 {pact.deadline}</span>
          <span aria-hidden="true">·</span>
          <span>
            <span className="text-seal tracking-wider">
              {"⚔".repeat(difficulty)}
            </span>
            <span className="text-ink/20 tracking-wider">
              {"⚔".repeat(5 - difficulty)}
            </span>
          </span>
        </div>
        <Link
          to={`/p/${pact.id}`}
          className="text-xs text-seal hover:underline font-serif"
        >
          詳しく見る →
        </Link>
      </div>
    </article>
  )
}

export default ExplorePage
