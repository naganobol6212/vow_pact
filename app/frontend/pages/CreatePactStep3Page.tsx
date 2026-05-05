import { useEffect } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { useCreatePact } from "../contexts/CreatePactContext"
import { useJudgeDifficulty } from "../hooks/useAi"

function CreatePactStep3Page() {
  const { draft, setDraft } = useCreatePact()
  const navigate = useNavigate()
  const judgeMutation = useJudgeDifficulty()

  useEffect(() => {
    if (!draft.goal.trim() || !draft.constraintText.trim()) {
      navigate("/pacts/new/step1", { replace: true })
    }
  }, [draft.goal, draft.constraintText, navigate])

  const handleJudge = async () => {
    if (!draft.deadline) return
    try {
      const res = await judgeMutation.mutateAsync({
        goal: draft.goal,
        constraint_text: draft.constraintText,
        deadline: draft.deadline,
      })
      setDraft((d) => ({
        ...d,
        difficulty: res.difficulty,
        difficultyReason: res.reason,
      }))
    } catch {
      // BaseController が 502 を返すのでユーザーへの表示は isError で判断
    }
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.deadline) return
    navigate("/pacts/new/step4")
  }

  // 期日のデフォルト最小値（明日）
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDeadline = tomorrow.toISOString().slice(0, 10)

  return (
    <Layout title="第三章：期日と難易度">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-xl text-seal mb-2">第三章 — 期日を刻み、試練の重みを量る</p>
        </div>

        {/* 確認表示 */}
        <div className="mb-6 px-4 py-3 bg-parchment/60 border-l-4 border-gold rounded-sm space-y-2">
          <div>
            <p className="text-xs text-ink/60 font-serif">目標</p>
            <p className="text-sm text-ink">{draft.goal}</p>
          </div>
          <div>
            <p className="text-xs text-ink/60 font-serif">試練</p>
            <p className="text-sm text-ink">{draft.constraintText}</p>
          </div>
        </div>

        <form onSubmit={handleNext}>
          <FormField
            label="期日（達成日）"
            type="date"
            value={draft.deadline}
            onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
            min={minDeadline}
            required
          />

          {/* 難易度判定 */}
          <div className="mb-6 p-4 border border-gold/40 rounded-sm bg-parchment/60">
            <h3 className="font-serif text-base text-ink mb-2">
              <span className="text-gold mr-2">⚜</span>難易度の天啓
            </h3>
            <p className="text-xs text-ink/60 mb-3">
              目標・試練・期日から AI が難易度（1〜5）を判定します。
            </p>
            <Button
              variant="secondary"
              type="button"
              onClick={handleJudge}
              disabled={!draft.deadline || judgeMutation.isPending}
            >
              {judgeMutation.isPending ? "判定中..." : "難易度を判定"}
            </Button>

            {draft.difficulty > 0 && draft.difficultyReason && (
              <div className="mt-4 p-3 bg-parchment border border-gold/40 rounded-sm">
                <p className="font-serif text-lg text-seal mb-1">
                  難易度：
                  <span className="ml-2">
                    {"⚔".repeat(draft.difficulty)}
                    <span className="text-ink/30">{"⚔".repeat(5 - draft.difficulty)}</span>
                  </span>
                  <span className="ml-2 text-base text-ink">{draft.difficulty} / 5</span>
                </p>
                <p className="text-sm text-ink/70">{draft.difficultyReason}</p>
              </div>
            )}

            {judgeMutation.isError && (
              <p className="text-xs text-seal mt-2">
                天啓を得られませんでした。再度お試しください。
              </p>
            )}
          </div>

          {/* 難易度の手動調整 */}
          <div className="mb-6">
            <label className="block mb-1 font-serif text-sm text-ink/80">
              難易度（手動調整可）：{draft.difficulty} / 5
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={draft.difficulty}
              onChange={(e) => setDraft((d) => ({ ...d, difficulty: Number(e.target.value) }))}
              className="w-full accent-seal"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" type="button" onClick={() => navigate("/pacts/new/step2")}>
              戻る
            </Button>
            <Button variant="primary" type="submit" disabled={!draft.deadline}>
              次へ ・ 契約書を見る
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreatePactStep3Page
