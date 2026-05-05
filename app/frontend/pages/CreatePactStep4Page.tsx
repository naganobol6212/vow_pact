import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { useCreatePact } from "../contexts/CreatePactContext"
import { api, ApiError } from "../lib/api"
import type { Pact } from "../types/pact"

type CreatePactInput = {
  goal: string
  constraint_text: string
  difficulty: number
  difficulty_reason: string
  deadline: string
  signed_at: string
}

function CreatePactStep4Page() {
  const { draft, resetDraft } = useCreatePact()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!draft.goal.trim() || !draft.constraintText.trim() || !draft.deadline) {
      navigate("/pacts/new/step1", { replace: true })
    }
  }, [draft, navigate])

  const createMutation = useMutation<Pact, ApiError, CreatePactInput>({
    mutationFn: (params) =>
      api<Pact>("/pacts", {
        method: "POST",
        body: params,
      }),
  })

  const handleSign = async () => {
    setSubmitError(null)
    try {
      const pact = await createMutation.mutateAsync({
        goal: draft.goal,
        constraint_text: draft.constraintText,
        difficulty: draft.difficulty,
        difficulty_reason: draft.difficultyReason,
        deadline: draft.deadline,
        signed_at: new Date().toISOString(),
      })
      // 一覧キャッシュを破棄して次回再取得
      await queryClient.invalidateQueries({ queryKey: ["pacts"] })
      resetDraft()
      navigate(`/pacts/${pact.id}/signed`)
    } catch (err) {
      if (err instanceof ApiError) {
        const errors = Array.isArray(err.errors) ? err.errors : []
        const firstError = errors[0] as { message?: string } | undefined
        setSubmitError(firstError?.message ?? "契約の締結に失敗しました。再度お試しください。")
      } else {
        setSubmitError("予期せぬ問題が発生しました。")
      }
    }
  }

  // 期日までの日数（マウント時に固定、再レンダーで揺らがないよう useMemo で安定化）
  const daysToDeadline = useMemo(() => {
    if (!draft.deadline) return 0
    const now = new Date().getTime()
    return Math.ceil((new Date(draft.deadline).getTime() - now) / (1000 * 60 * 60 * 24))
  }, [draft.deadline])

  return (
    <Layout title="第四章：契約書">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-xl text-seal mb-2">第四章 — 契約書</p>
          <p className="text-sm text-ink/60">記された誓いを確認し、署名する。</p>
        </div>

        {/* 契約書プレビュー */}
        <div className="mb-8 p-8 bg-parchment border-2 border-gold/60 rounded-sm shadow-lg">
          <p className="font-serif text-center text-base text-seal mb-6">─── 誓 約 書 ───</p>

          <div className="space-y-5 font-serif text-ink">
            <p className="text-sm leading-relaxed">
              我、本書に名を記す者として、以下の誓いを立てる。
            </p>

            <section>
              <p className="text-xs text-ink/60 mb-1">一 目標</p>
              <p className="text-base ml-4">「{draft.goal}」</p>
            </section>

            <section>
              <p className="text-xs text-ink/60 mb-1">二 試練</p>
              <p className="text-base ml-4">「{draft.constraintText}」</p>
            </section>

            <section>
              <p className="text-xs text-ink/60 mb-1">三 期日</p>
              <p className="text-base ml-4">
                {draft.deadline}（あと {daysToDeadline} 日）
              </p>
            </section>

            <section>
              <p className="text-xs text-ink/60 mb-1">四 難易度</p>
              <p className="text-base ml-4">
                {"⚔".repeat(draft.difficulty)}
                <span className="text-ink/30">{"⚔".repeat(5 - draft.difficulty)}</span>
                <span className="ml-2 text-sm">{draft.difficulty} / 5</span>
              </p>
            </section>

            <p className="text-sm leading-relaxed pt-4 border-t border-gold/40">
              この誓いを破ることなく成し遂げたとき、我は紋章を得る。
              <br />
              成し遂げられぬとき、誓いは消えゆくのみ。
            </p>
          </div>
        </div>

        {submitError && (
          <div
            className="mb-4 p-3 bg-seal/10 border border-seal text-seal text-sm rounded-sm"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="flex justify-between">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate("/pacts/new/step3")}
            disabled={createMutation.isPending}
          >
            戻る
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSign}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "誓いを刻んでいる..." : "ここに誓う"}
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default CreatePactStep4Page
