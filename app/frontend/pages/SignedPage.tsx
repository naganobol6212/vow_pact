import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Layout from "../components/Layout"
import Button from "../components/Button"
import ShareButton from "../components/ShareButton"
import CrestSeal from "../components/CrestSeal"
import { api, ApiError } from "../lib/api"
import type { Pact } from "../types/pact"
import {
  SHARE_HASHTAGS,
  SHARE_LABELS,
  buildSignedShareText,
} from "../constants/share"

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

function SignedPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: pact,
    isLoading,
    isError,
  } = useQuery<Pact, ApiError>({
    queryKey: ["pact", id],
    queryFn: () => api<Pact>(`/pacts/${id}`),
    enabled: !!id,
    retry: false,
  })

  // X シェア時に契約を公開状態へ切り替えるための mutation。
  // ボタン押下と同時に fire-and-forget で叩く（ユーザージェスチャを切らさない）。
  // PATCH は通常 1 秒未満で終わるため、X 側の OG クローラー（投稿後にフェッチ）に十分間に合う想定。
  const publishMutation = useMutation<Pact, ApiError, void>({
    mutationFn: () =>
      api<Pact>(`/pacts/${id}`, { method: "PATCH", body: { is_public: true } }),
    onSuccess: () => {
      // キャッシュ更新（詳細画面トグルや他箇所に反映）
      queryClient.invalidateQueries({ queryKey: ["pact", id] })
      queryClient.invalidateQueries({ queryKey: ["pacts"] })
    },
  })

  // 称号自動生成。pact.title が nil のときに 1 度だけ叩く（サーバ側も idempotent）。
  // サーバ側で AI 生成 → 1 つ採用 → pact.title に保存 → 更新後の Pact を返す。
  const titleMutation = useMutation<Pact, ApiError, void>({
    mutationFn: () => api<Pact>(`/pacts/${id}/title`, { method: "POST" }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["pact", id], updated)
      queryClient.invalidateQueries({ queryKey: ["pacts"] })
    },
  })

  // 取得した pact に title が無ければ 1 度だけ生成を要求する。
  // titleMutation が pending / completed / errored の間は再呼び出ししない。
  useEffect(() => {
    if (!pact) return
    if (pact.title) return
    if (titleMutation.isPending || titleMutation.isSuccess || titleMutation.isError) return
    titleMutation.mutate()
  }, [pact, titleMutation])

  // OG image PNG を先取りフェッチして Rails.cache（Solid Cache）を温める。
  // Render Free tier では初回生成に 10 秒以上かかるため、ユーザーが SignedPage を見ている間に
  // 裏で生成完了させておく。シェアボタン押下後に X クローラーが来たときには cache hit するので
  // 即座に PNG を返せる。失敗しても X 投稿フローには影響させない。
  useEffect(() => {
    if (!id) return
    const ctrl = new AbortController()
    fetch(`/api/v1/public/pacts/${id}/og.png`, { signal: ctrl.signal }).catch(() => {})
    return () => ctrl.abort()
  }, [id])

  if (isLoading) {
    return (
      <Layout title="誓約締結">
        <div className="text-center mt-12 text-ink/60 font-serif">誓いを取り出している…</div>
      </Layout>
    )
  }

  if (isError || !pact) {
    return (
      <Layout title="誓約締結">
        <div className="text-center mt-12">
          <p className="text-seal mb-4">誓いが見つかりませんでした</p>
          <Button variant="ghost" type="button" onClick={() => navigate("/")}>
            ホームへ戻る
          </Button>
        </div>
      </Layout>
    )
  }

  const isCompleted = pact.status === "completed"
  const headline = isCompleted ? "成就せり" : "誓いは刻まれた"
  const subtitle = isCompleted
    ? "あなたの誓いは見事に達成された。紋章が授けられる。"
    : "本書に記された誓いは、あなた自身との不動の契約となる。"

  return (
    <Layout title="誓約締結" showFooter={false}>
      <div className="max-w-xl mx-auto text-center mt-8 px-2">
        {/* シール演出（Framer Motion） */}
        <div className="flex justify-center mb-8">
          <CrestSeal
            symbol={isCompleted ? "🏆" : "⚔"}
            size={180}
            emphasized={isCompleted}
          />
        </div>

        <motion.h2
          className="font-serif text-4xl text-seal mb-3"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {headline}
        </motion.h2>
        <motion.p
          className="font-serif text-base text-ink/70 mb-10"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          {subtitle}
        </motion.p>

        {/* 称号カード（TITLE GRANTED） — 金枠で「授かりもの」感を出す。
            pact.title が来るまでは生成中の placeholder を出す。 */}
        <motion.div
          className="relative mb-8 px-5 pt-6 pb-5 text-center bg-linear-to-b from-gold/10 to-gold/0 border border-gold"
          style={{ outline: "1px solid rgba(201,169,97,0.33)", outlineOffset: "-5px" }}
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.95 }}
          aria-label="授かりし称号"
          role="figure"
        >
          <span
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-parchment px-3 text-[10px] tracking-[0.5em] text-gold font-serif font-semibold whitespace-nowrap"
            style={{ paddingLeft: "calc(0.75rem + 0.5em)" }}
          >
            TITLE GRANTED
          </span>
          <div className="flex justify-center mb-2">
            <span className="text-gold text-sm">✦</span>
          </div>
          {pact.title ? (
            <p
              className="font-serif font-semibold text-ink text-xl sm:text-2xl tracking-wider"
              style={{ lineHeight: 1.5 }}
            >
              {pact.title.endsWith("者") ? (
                <>
                  {pact.title.slice(0, -1)}
                  <span className="text-seal">者</span>
                </>
              ) : (
                pact.title
              )}
            </p>
          ) : (
            <p className="font-serif text-ink/50 text-sm">
              {titleMutation.isError ? "称号の授与に失敗しました" : "称号を授かっています…"}
            </p>
          )}
        </motion.div>

        {/* 契約サマリ */}
        <motion.div
          className="text-left p-6 bg-parchment border-2 border-gold/60 rounded-xl shadow-lg mb-8"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">目標</p>
            <p className="text-base text-ink">{pact.goal}</p>
          </section>
          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">制約</p>
            <p className="text-base text-ink">{pact.constraint_text}</p>
          </section>
          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">期日</p>
            <p className="text-base text-ink">{pact.deadline}</p>
          </section>
          <section>
            <p className="text-xs text-ink/60 font-serif">難易度</p>
            <p className="text-base text-ink">
              {(() => {
                // 想定外の値（API 異常等）でも repeat() が RangeError を起こさないようクランプ
                const d = Math.min(5, Math.max(0, pact.difficulty))
                return (
                  <>
                    {"⚔".repeat(d)}
                    <span className="text-ink/30">{"⚔".repeat(5 - d)}</span>
                    <span className="ml-2 text-sm">{pact.difficulty} / 5</span>
                  </>
                )
              })()}
            </p>
          </section>
        </motion.div>

        {/* X シェア。常に /p/:id を使い、押下時に契約を公開化する（A 案）。
            これにより最初の締結時から OG カード（契約書 PNG）が表示される。 */}
        <motion.div className="mb-6 space-y-2" {...fadeUp} transition={{ duration: 0.6, delay: 1.15 }}>
          <ShareButton
            text={buildSignedShareText({
              goal: pact.goal,
              constraintText: pact.constraint_text,
              deadline: pact.deadline,
            })}
            url={`${window.location.origin}/p/${pact.id}`}
            hashtags={[...SHARE_HASHTAGS]}
            label={SHARE_LABELS.signed}
            onBeforeShare={() => {
              if (!pact.is_public) publishMutation.mutate()
            }}
          />
          <p className="text-xs text-ink/50">
            シェアすると契約が公開状態になり、X 上に契約書のカード画像が表示されます。
            <br />
            あとで契約詳細画面から非公開に戻すこともできます。
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <Button variant="ghost" onClick={() => navigate("/")}>
            ホームへ
          </Button>
          <Button variant="primary" onClick={() => navigate("/pacts/new/step1")}>
            新たな誓いを立てる
          </Button>
        </motion.div>
      </div>
    </Layout>
  )
}

export default SignedPage
