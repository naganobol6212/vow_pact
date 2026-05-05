import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { useCreatePact } from "../contexts/CreatePactContext"
import { useSuggestGoals } from "../hooks/useAi"

function CreatePactStep1Page() {
  const { draft, setDraft } = useCreatePact()
  const [theme, setTheme] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const navigate = useNavigate()
  const suggestMutation = useSuggestGoals()

  const handleSuggest = async () => {
    if (!theme.trim()) return
    try {
      const res = await suggestMutation.mutateAsync({ theme })
      setSuggestions(res.goals ?? [])
    } catch {
      setSuggestions([])
    }
  }

  // テーマなしで AI に「突拍子もない / ストレッチ / 面白い / 自己成長」をミックスさせる。
  const handleRandomSuggest = async () => {
    try {
      const res = await suggestMutation.mutateAsync({})
      setSuggestions(res.goals ?? [])
    } catch {
      setSuggestions([])
    }
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.goal.trim()) return
    navigate("/pacts/new/step2")
  }

  return (
    <Layout title="目標を決める">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <p className="font-serif text-xl text-seal mb-2">Step 1 / 4 ・ 目標を決める</p>
          <p className="text-sm text-ink/60">達成したい目標を入力します。</p>
        </div>

        {/* AI 目標案セクション */}
        <div className="mb-8 p-4 border border-gold/40 rounded-sm bg-parchment/60">
          <h3 className="font-serif text-base text-ink mb-2">
            <span className="text-gold mr-2">⚜</span>AI に提案してもらう（任意）
          </h3>
          <p className="text-xs text-ink/60 mb-3">
            テーマを入力すると AI が目標案を 3 つ提案します。
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例：健康、学習、創作"
              className="flex-1 px-3 py-2 bg-parchment border border-ink/30 rounded-sm text-sm focus:border-seal focus:outline-none"
            />
            <Button
              variant="secondary"
              type="button"
              onClick={handleSuggest}
              disabled={suggestMutation.isPending || !theme.trim()}
            >
              {suggestMutation.isPending ? "提案中..." : "AI に提案してもらう"}
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="flex-1 border-t border-ink/20" />
            <span className="text-xs text-ink/50">または</span>
            <span className="flex-1 border-t border-ink/20" />
          </div>

          <Button
            variant="ghost"
            type="button"
            onClick={handleRandomSuggest}
            disabled={suggestMutation.isPending}
            fullWidth
          >
            <span aria-hidden="true" className="mr-1">🎲</span>
            {suggestMutation.isPending ? "提案中..." : "おまかせで提案してもらう"}
          </Button>

          {suggestions.length > 0 && (
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, goal: s }))}
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

        {/* 入力フォーム */}
        <form onSubmit={handleNext}>
          <FormField
            label="目標"
            type="text"
            value={draft.goal}
            onChange={(e) => setDraft((d) => ({ ...d, goal: e.target.value }))}
            placeholder="例：毎日30分読書する"
            required
          />

          <div className="flex justify-end mt-6">
            <Button variant="primary" type="submit" disabled={!draft.goal.trim()}>
              次へ：制約を決める
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreatePactStep1Page
