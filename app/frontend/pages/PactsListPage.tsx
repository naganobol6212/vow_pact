import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { api, ApiError } from "../lib/api"
import type { Pact, PactStatus } from "../types/pact"

// 「全て」タブは削除済み。Hall ページ（紋章コレクション）が
// 達成 / 進行中 / 破棄 をまとめて表示する役割を担う。
const STATUS_TABS: { value: PactStatus; label: string }[] = [
  { value: "active", label: "進行中" },
  { value: "completed", label: "達成" },
  { value: "abandoned", label: "破棄" },
  { value: "failed", label: "失敗" },
]

const STATUS_BADGE: Record<PactStatus, { text: string; className: string }> = {
  active: { text: "進行中", className: "bg-seal/10 text-seal border border-seal/30" },
  completed: { text: "達成", className: "bg-gold/20 text-ink border border-gold" },
  failed: { text: "失敗", className: "bg-ink/10 text-ink/60 border border-ink/30" },
  abandoned: { text: "破棄", className: "bg-ink/5 text-ink/40 border border-ink/20" },
}

function PactsListPage() {
  // デフォルトは「進行中」。ユーザーがまず確認したいのは active な誓い。
  const [filter, setFilter] = useState<PactStatus>("active")

  const { data: pacts, isLoading, isError } = useQuery<Pact[], ApiError>({
    queryKey: ["pacts"],
    queryFn: () => api<Pact[]>("/pacts"),
  })

  const filtered = pacts?.filter((p) => p.status === filter) ?? []

  return (
    <Layout title="契約一覧">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-2xl text-seal mb-2">契約一覧</p>
          <p className="text-sm text-ink/60">結んだ誓いの記録</p>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-6 border-b border-gold/30 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-sm font-serif whitespace-nowrap transition ${
                filter === tab.value
                  ? "text-seal border-b-2 border-seal"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-center text-ink/60 mt-12">書庫を開いている…</p>
        )}

        {isError && (
          <p className="text-center text-seal mt-12">書庫を開けませんでした</p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-ink/60 mb-6">該当する誓約がありません。</p>
            <Link to="/pacts/new/step1">
              <Button variant="primary">新たな誓約を結ぶ</Button>
            </Link>
          </div>
        )}

        <ul className="space-y-3">
          {filtered.map((pact) => {
            const badge = STATUS_BADGE[pact.status]
            return (
              <li key={pact.id}>
                <Link
                  to={`/pacts/${pact.id}`}
                  className="block p-4 bg-parchment/60 border border-gold/40 rounded-sm hover:border-seal transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-serif text-base text-ink flex-1">{pact.goal}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${badge.className}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-xs text-ink/60 mb-1">
                    試練：{pact.constraint_text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-ink/50 mt-2">
                    <span>
                      期日：{pact.deadline}
                    </span>
                    <span>
                      {"⚔".repeat(Math.min(5, Math.max(0, pact.difficulty)))}
                      <span className="text-ink/20">
                        {"⚔".repeat(5 - Math.min(5, Math.max(0, pact.difficulty)))}
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </Layout>
  )
}

export default PactsListPage
