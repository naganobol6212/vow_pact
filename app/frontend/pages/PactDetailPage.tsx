import { useState, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { api, ApiError } from "../lib/api"
import type { Pact } from "../types/pact"
import type { CheckIn, CheckInStatus } from "../types/check_in"

type CheckInResponse = {
  check_in: CheckIn
  pact: Pact
  achieved: boolean
}

const STATUS_LABELS: Record<CheckInStatus, { label: string; symbol: string; className: string }> = {
  kept: { label: "守れた", symbol: "⚔", className: "bg-seal text-parchment hover:opacity-90" },
  broken: { label: "破れた", symbol: "✗", className: "bg-ink/70 text-parchment hover:opacity-90" },
  skipped: { label: "休戦", symbol: "—", className: "bg-gold text-ink hover:opacity-90" },
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function PactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [note, setNote] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: pact, isLoading: isPactLoading, isError: isPactError } = useQuery<Pact, ApiError>({
    queryKey: ["pact", id],
    queryFn: () => api<Pact>(`/pacts/${id}`),
    enabled: !!id,
  })

  const { data: checkIns } = useQuery<CheckIn[], ApiError>({
    queryKey: ["pact", id, "check_ins"],
    queryFn: () => api<CheckIn[]>(`/pacts/${id}/check_ins`),
    enabled: !!id,
  })

  const todayCheckIn = useMemo(
    () => checkIns?.find((ci) => ci.checked_on === todayIso()),
    [checkIns]
  )

  const checkInMutation = useMutation<CheckInResponse, ApiError, CheckInStatus>({
    mutationFn: (status) =>
      api<CheckInResponse>(`/pacts/${id}/check_ins`, {
        method: "POST",
        body: { status, note: note.trim() || undefined },
      }),
    onSuccess: async (result) => {
      setNote("")
      await queryClient.invalidateQueries({ queryKey: ["pact", id] })
      await queryClient.invalidateQueries({ queryKey: ["pact", id, "check_ins"] })
      await queryClient.invalidateQueries({ queryKey: ["pacts"] })
      if (result.achieved) {
        navigate(`/pacts/${id}/signed`)
      }
    },
    onError: (err) => {
      const errors = Array.isArray(err.errors) ? err.errors : []
      const firstError = errors[0] as { message?: string } | undefined
      setSubmitError(firstError?.message ?? "チェックインに失敗しました。")
    },
  })

  const handleCheckIn = (status: CheckInStatus) => {
    setSubmitError(null)
    checkInMutation.mutate(status)
  }

  if (isPactLoading) {
    return (
      <Layout title="誓約">
        <p className="text-center text-ink/60 mt-12">誓いを開いている…</p>
      </Layout>
    )
  }

  if (isPactError || !pact) {
    return (
      <Layout title="誓約">
        <div className="text-center mt-12">
          <p className="text-seal mb-4">誓いが見つかりませんでした</p>
          <Link to="/pacts">
            <Button variant="ghost">書庫へ戻る</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const isActive = pact.status === "active"
  const difficulty = Math.min(5, Math.max(0, pact.difficulty))

  return (
    <Layout title="誓約">
      <div className="max-w-2xl mx-auto">
        {/* 契約サマリ */}
        <div className="mb-6 p-6 bg-parchment border-2 border-gold/60 rounded-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className="font-serif text-xl text-seal flex-1">{pact.goal}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-sm whitespace-nowrap ${
                pact.status === "active"
                  ? "bg-seal/10 text-seal border border-seal/30"
                  : pact.status === "completed"
                    ? "bg-gold/20 text-ink border border-gold"
                    : "bg-ink/5 text-ink/40 border border-ink/20"
              }`}
            >
              {pact.status === "active" ? "進行中" : pact.status === "completed" ? "達成" : pact.status}
            </span>
          </div>

          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">試練</p>
            <p className="text-sm text-ink">{pact.constraint_text}</p>
          </section>
          <section className="mb-3">
            <p className="text-xs text-ink/60 font-serif">期日</p>
            <p className="text-sm text-ink">{pact.deadline}</p>
          </section>
          <section>
            <p className="text-xs text-ink/60 font-serif">難易度</p>
            <p className="text-sm text-ink">
              {"⚔".repeat(difficulty)}
              <span className="text-ink/30">{"⚔".repeat(5 - difficulty)}</span>
              <span className="ml-2">{pact.difficulty} / 5</span>
            </p>
          </section>
        </div>

        {/* 今日のチェックイン */}
        {isActive && (
          <div className="mb-6 p-5 bg-parchment/60 border border-gold/40 rounded-sm">
            <p className="font-serif text-base text-ink mb-3">
              今日（{todayIso()}）のチェックイン
              {todayCheckIn && (
                <span className="ml-2 text-xs text-ink/50">
                  既に記録済み（再度押すと訂正されます）
                </span>
              )}
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="メモ（任意・500 文字まで）"
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 bg-parchment border border-ink/30 rounded-sm text-sm focus:border-seal focus:outline-none mb-3"
            />

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(STATUS_LABELS) as CheckInStatus[]).map((status) => {
                const meta = STATUS_LABELS[status]
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleCheckIn(status)}
                    disabled={checkInMutation.isPending}
                    className={`px-3 py-3 rounded-sm font-serif font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${meta.className}`}
                  >
                    <span className="block text-2xl mb-1">{meta.symbol}</span>
                    <span className="block text-sm">{meta.label}</span>
                  </button>
                )
              })}
            </div>

            {submitError && (
              <p className="mt-3 text-xs text-seal" role="alert">
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* 履歴 */}
        <div className="mb-6">
          <p className="font-serif text-base text-ink mb-3">これまでの記録</p>
          {checkIns && checkIns.length > 0 ? (
            <ul className="space-y-2">
              {checkIns.map((ci) => {
                const meta = STATUS_LABELS[ci.status]
                return (
                  <li
                    key={ci.id}
                    className="flex items-start gap-3 p-3 bg-parchment/40 border border-gold/30 rounded-sm"
                  >
                    <span className="font-serif text-xl text-seal w-6 text-center">{meta.symbol}</span>
                    <div className="flex-1">
                      <p className="text-sm text-ink">
                        {ci.checked_on}：{meta.label}
                      </p>
                      {ci.note && (
                        <p className="text-xs text-ink/60 mt-1 whitespace-pre-wrap">{ci.note}</p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-ink/50">まだ記録はありません。</p>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate("/pacts")}>
            書庫へ戻る
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default PactDetailPage
