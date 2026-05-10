import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Layout from "../components/Layout"
import Button from "../components/Button"
import ShareButton from "../components/ShareButton"
import PactSeal from "../components/PactSeal"
import HeraldicCrest from "../components/HeraldicCrest"
import ContractCard from "../components/ContractCard"
import StarDivider from "../components/StarDivider"
import { useAuth } from "../hooks/useAuth"
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

/** 契約書のセクションラベル（【目標】 / GOAL）。PactDetailPage の DetailSection と
 * 同じパターン。コンポーネント分離するほどでもないので各画面でローカル定義する。 */
function SignedSection({
  label,
  en,
  children,
}: {
  label: string
  en: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-3">
      <div className="flex items-baseline justify-between mb-1">
        <h4
          className="font-serif font-semibold m-0"
          style={{
            fontSize: 11,
            letterSpacing: "0.45em",
            color: "var(--color-gold-muted)",
            paddingLeft: "0.45em",
          }}
        >
          【{label}】
        </h4>
        <span
          className="font-display"
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "var(--color-gold-muted)",
            opacity: 0.7,
          }}
          aria-hidden="true"
        >
          {en}
        </span>
      </div>
      {children}
    </section>
  )
}

function SignedPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

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

  // 動的 OG image はレンダリング品質の問題（背景黒・フォント崩れ・レイアウト崩れ）
  // で再度無効化中。og:image meta も layout で出していないので先取りフェッチ不要。
  // 再開する際は以下を復活させる:
  // useEffect(() => {
  //   if (!id) return
  //   const ctrl = new AbortController()
  //   fetch(`/api/v1/public/pacts/${id}/og.png`, { signal: ctrl.signal }).catch(() => {})
  //   return () => ctrl.abort()
  // }, [id])

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
        {/* シール演出: 達成時は紋章リビール、締結時は朱印押印 */}
        <div className="flex justify-center mb-8">
          {isCompleted && pact.crest ? (
            <HeraldicCrest rarity={pact.crest.rarity} size={180} animate />
          ) : (
            <PactSeal size={180} animate />
          )}
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

        {/* 契約サマリ（ContractCard で 4 隅装飾 + 二重金枠） */}
        <motion.div
          className="text-left mb-8"
          {...fadeUp}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <ContractCard>
            <header className="text-center mb-3">
              <h3
                className="font-serif font-semibold m-0"
                style={{
                  fontSize: "clamp(18px, 5.5vw, 22px)",
                  letterSpacing: "0.45em",
                  color: "var(--color-ink)",
                  paddingLeft: "0.45em",
                }}
              >
                誓約契約書
              </h3>
              <p
                className="font-display mt-1.5"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.3em",
                  color: "var(--color-gold-muted)",
                }}
              >
                VOW PACT &middot; No. {String(pact.id).padStart(3, "0")}
              </p>
            </header>

            <StarDivider />

            <div className="mt-5 mb-1">
              <SignedSection label="目標" en="GOAL">
                <p className="font-serif text-base text-ink">{pact.goal}</p>
              </SignedSection>
              <SignedSection label="制約" en="TRIAL">
                <p className="font-serif text-base text-ink">{pact.constraint_text}</p>
              </SignedSection>
              <div className="grid grid-cols-2 gap-4">
                <SignedSection label="期日" en="DEADLINE">
                  <p className="font-serif text-base text-ink">{pact.deadline}</p>
                </SignedSection>
                <SignedSection label="難易度" en="DIFFICULTY">
                  <p className="font-serif text-base">
                    {(() => {
                      const d = Math.min(5, Math.max(0, pact.difficulty))
                      return (
                        <>
                          <span className="text-seal tracking-widest">{"⚔".repeat(d)}</span>
                          <span className="text-ink/20 tracking-widest">
                            {"⚔".repeat(5 - d)}
                          </span>
                          <span className="ml-2 text-sm text-ink/70">
                            {pact.difficulty} / 5
                          </span>
                        </>
                      )
                    })()}
                  </p>
                </SignedSection>
              </div>
            </div>

            <div className="my-4">
              <StarDivider />
            </div>

            {/* 署名: Caveat フォントで手書き感 */}
            <div className="flex items-end justify-between mt-2">
              <div>
                <p
                  className="font-display"
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.3em",
                    color: "var(--color-gold-muted)",
                    marginBottom: 2,
                  }}
                >
                  SIGNED BY
                </p>
                <span
                  className="inline-block"
                  style={{
                    fontFamily: "var(--font-signature)",
                    fontSize: 28,
                    color: "var(--color-ink)",
                    lineHeight: 1,
                    transform: "rotate(-2deg)",
                  }}
                >
                  {user?.nickname ?? "誓約者"}
                </span>
              </div>
              <p className="text-xs text-ink/50">
                締結 {pact.signed_at.slice(0, 10)}
              </p>
            </div>
          </ContractCard>
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
