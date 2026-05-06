import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
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

        {/* 契約締結のシェア。
            公開設定なら /p/:id（認証不要・OG image 付き）、非公開なら /pacts/:id/signed を使う。 */}
        <motion.div className="mb-6 space-y-3" {...fadeUp} transition={{ duration: 0.6, delay: 1.15 }}>
          <ShareButton
            text={buildSignedShareText({
              goal: pact.goal,
              constraintText: pact.constraint_text,
              deadline: pact.deadline,
            })}
            url={
              pact.is_public
                ? `${window.location.origin}/p/${pact.id}`
                : `${window.location.origin}/pacts/${pact.id}/signed`
            }
            hashtags={[...SHARE_HASHTAGS]}
            label={SHARE_LABELS.signed}
          />
          {!pact.is_public && (
            <p className="text-xs text-ink/50">
              X カードに契約書の画像を表示するには、契約詳細画面で「公開設定」をオンにしてください。
            </p>
          )}
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
