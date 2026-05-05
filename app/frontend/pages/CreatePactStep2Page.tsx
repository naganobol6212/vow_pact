import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { useCreatePact } from "../contexts/CreatePactContext"
import { useSuggestConstraints } from "../hooks/useAi"

function CreatePactStep2Page() {
  const { draft, setDraft } = useCreatePact()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const navigate = useNavigate()
  const suggestMutation = useSuggestConstraints()

  // Step1 をスキップして直接来た場合は戻す
  useEffect(() => {
    if (!draft.goal.trim()) {
      navigate("/pacts/new/step1", { replace: true })
    }
  }, [draft.goal, navigate])

  const handleSuggest = async () => {
    if (!draft.goal.trim()) return
    try {
      const res = await suggestMutation.mutateAsync({ goal: draft.goal })
      setSuggestions(res.constraints ?? [])
    } catch {
      setSuggestions([])
    }
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.constraintText.trim()) return
    navigate("/pacts/new/step3")
  }

  return (
    <Layout title="制約を決める">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-xl text-seal mb-2">Step 2 / 4 ・ 制約を決める</p>
          <p className="text-sm text-ink/60">目標達成のために自分に課す制約を 1 つ決めます。</p>
        </div>

        {/* 目標の確認表示（Step 1 で入力した内容） */}
        <div className="mb-6 px-4 py-3 bg-parchment/60 border-l-4 border-gold rounded-sm">
          <p className="text-xs text-ink/60 font-serif mb-1">目標</p>
          <p className="text-sm text-ink">{draft.goal}</p>
        </div>

        {/* AI 制約案セクション */}
        <div className="mb-8 p-4 border border-gold/40 rounded-sm bg-parchment/60">
          <h3 className="font-serif text-base text-ink mb-2">
            <span className="text-gold mr-2">⚜</span>AI に提案してもらう（任意）
          </h3>
          <p className="text-xs text-ink/60 mb-3">目標に合った制約を AI が 3 つ提案します。</p>
          <Button
            variant="secondary"
            type="button"
            onClick={handleSuggest}
            disabled={suggestMutation.isPending}
          >
            {suggestMutation.isPending ? "提案中..." : "AI に提案してもらう"}
          </Button>

          {suggestions.length > 0 && (
            <ul className="space-y-2 mt-4">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, constraintText: s }))}
                    className="w-full text-left px-3 py-2 bg-parchment border border-gold/40 rounded-sm hover:border-seal text-sm transition"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {suggestMutation.isError && (
            <p className="text-xs text-seal mt-2">提案を取得できませんでした。再度お試しください。</p>
          )}
        </div>

        <form onSubmit={handleNext}>
          <FormField
            label="制約"
            type="text"
            value={draft.constraintText}
            onChange={(e) => setDraft((d) => ({ ...d, constraintText: e.target.value }))}
            placeholder="例：夜 22 時以降スマホを触らない"
            required
          />

          <div className="flex justify-between mt-6">
            <Button variant="ghost" type="button" onClick={() => navigate("/pacts/new/step1")}>
              戻る
            </Button>
            <Button variant="primary" type="submit" disabled={!draft.constraintText.trim()}>
              次へ：期日と難易度
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreatePactStep2Page
