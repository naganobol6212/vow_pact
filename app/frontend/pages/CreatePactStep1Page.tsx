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

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.goal.trim()) return
    navigate("/pacts/new/step2")
  }

  return (
    <Layout title="第一章：目標">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <p className="font-serif text-xl text-seal mb-2">第一章 — 誓いの目標</p>
          <p className="text-sm text-ink/60">あなたが成し遂げたい目標を、自らの言葉で記す。</p>
        </div>

        {/* AI 目標案セクション */}
        <div className="mb-8 p-4 border border-gold/40 rounded-sm bg-parchment/60">
          <h3 className="font-serif text-base text-ink mb-2">
            <span className="text-gold mr-2">⚜</span>天啓を受ける
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
              {suggestMutation.isPending ? "天啓中..." : "天啓を受ける"}
            </Button>
          </div>

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
            <p className="text-xs text-seal mt-2">天啓を得られませんでした。再度お試しください。</p>
          )}
        </div>

        {/* 入力フォーム */}
        <form onSubmit={handleNext}>
          <FormField
            label="あなたの目標"
            type="text"
            value={draft.goal}
            onChange={(e) => setDraft((d) => ({ ...d, goal: e.target.value }))}
            placeholder="例：毎日30分読書する"
            required
          />

          <div className="flex justify-end mt-6">
            <Button variant="primary" type="submit" disabled={!draft.goal.trim()}>
              次へ ・ 試練を定める
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default CreatePactStep1Page
