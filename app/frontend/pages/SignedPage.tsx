import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import ShareButton from "../components/ShareButton"
import { api, ApiError } from "../lib/api"
import type { Pact } from "../types/pact"
import {
  SHARE_HASHTAGS,
  SHARE_LABELS,
  buildSignedShareText,
} from "../constants/share"

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

  return (
    <Layout title="誓約締結" showFooter={false}>
      <div className="max-w-xl mx-auto text-center mt-8">
        {/* シール装飾 */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-seal/10 border-4 border-seal/40 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-2 border-gold/60" />
            <span className="font-serif text-5xl text-seal">⚔</span>
          </div>
        </div>

        <h2 className="font-serif text-3xl text-seal mb-2">誓いは刻まれた</h2>
        <p className="font-serif text-base text-ink/70 mb-8">
          本書に記された誓いは、あなた自身との不動の契約となる。
        </p>

        {/* 契約サマリ */}
        <div className="text-left p-6 bg-parchment border-2 border-gold/60 rounded-sm mb-8">
          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">目標</p>
            <p className="text-base text-ink">{pact.goal}</p>
          </section>
          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">試練</p>
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
        </div>

        {/* 契約締結のシェア（Issue #26） */}
        <div className="mb-6">
          <ShareButton
            text={buildSignedShareText({
              goal: pact.goal,
              constraintText: pact.constraint_text,
              deadline: pact.deadline,
            })}
            url={`${window.location.origin}/pacts/${pact.id}/signed`}
            hashtags={[...SHARE_HASHTAGS]}
            label={SHARE_LABELS.signed}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ホームへ
          </Button>
          <Button variant="primary" onClick={() => navigate("/pacts/new/step1")}>
            新たな誓いを立てる
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default SignedPage
