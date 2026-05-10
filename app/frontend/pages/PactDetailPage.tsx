import { useState, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import Modal from "../components/Modal"
import HeraldicCrest from "../components/HeraldicCrest"
import ProgressGrass from "../components/ProgressGrass"
import StarDivider from "../components/StarDivider"
import ContractCard from "../components/ContractCard"
import { api, ApiError } from "../lib/api"
import { useAuth } from "../hooks/useAuth"
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

/** 契約書のセクション（【目標】 / 【制約】 / 等のラベル付き）。 */
function DetailSection({
  label,
  en,
  children,
}: {
  label: string
  en: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <h3
          className="font-serif font-semibold m-0"
          style={{
            fontSize: 11,
            letterSpacing: "0.45em",
            color: "var(--color-gold-muted)",
            paddingLeft: "0.45em",
          }}
        >
          【{label}】
        </h3>
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

function PactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [note, setNote] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

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
          <Link to="/crests">
            <Button variant="ghost">殿堂へ戻る</Button>
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
        {/* 達成済みなら紋章を大きく表示（HeraldicCrest）*/}
        {pact.status === "completed" && pact.crest && (
          <div className="flex justify-center mb-6">
            <HeraldicCrest rarity={pact.crest.rarity} size={140} animate />
          </div>
        )}

        {/* 契約書（4 隅装飾 + 二重金枠） */}
        <ContractCard className="mb-6">
          {/* 表題 */}
          <header className="text-center mb-4">
            <h2
              className="font-serif font-semibold m-0"
              style={{
                fontSize: "clamp(20px, 6vw, 24px)",
                letterSpacing: "0.45em",
                color: "var(--color-ink)",
                paddingLeft: "0.45em",
              }}
            >
              誓約契約書
            </h2>
            <p
              className="font-display mt-1.5"
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "var(--color-gold-muted)",
              }}
            >
              VOW PACT &middot; No. {String(pact.id).padStart(3, "0")}
            </p>
          </header>

          <StarDivider />

          {/* ステータスバッジ */}
          <div className="flex items-center justify-end mt-4">
            <span
              className={`text-xs px-2 py-0.5 rounded-sm whitespace-nowrap ${
                pact.status === "active"
                  ? "bg-seal/10 text-seal border border-seal/30"
                  : pact.status === "completed"
                    ? "bg-gold/20 text-ink border border-gold"
                    : "bg-ink/5 text-ink/40 border border-ink/20"
              }`}
            >
              {pact.status === "active"
                ? "進行中"
                : pact.status === "completed"
                  ? "達成"
                  : pact.status === "abandoned"
                    ? "破棄"
                    : pact.status === "failed"
                      ? "失敗"
                      : pact.status}
            </span>
          </div>

          {/* 称号 */}
          {pact.title && (
            <section className="mt-4 px-4 py-3 border border-gold/60 bg-gold/5 text-center">
              <p
                className="font-display font-semibold mb-1"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  color: "var(--color-gold-deep)",
                  paddingLeft: "0.4em",
                }}
              >
                ── TITLE GRANTED ──
              </p>
              <p className="font-serif text-base sm:text-lg font-semibold text-ink tracking-wider">
                {pact.title.endsWith("者") ? (
                  <>
                    {pact.title.slice(0, -1)}
                    <span className="text-seal">者</span>
                  </>
                ) : (
                  pact.title
                )}
              </p>
            </section>
          )}

          {/* 本文 */}
          <DetailSection label="目標" en="GOAL">
            <p className="font-serif text-base text-ink leading-relaxed">{pact.goal}</p>
          </DetailSection>

          <DetailSection label="制約" en="TRIAL">
            <p className="font-serif text-base text-ink leading-relaxed">
              {pact.constraint_text}
            </p>
          </DetailSection>

          <div className="grid grid-cols-2 gap-4">
            <DetailSection label="期日" en="DEADLINE">
              <p className="font-serif text-base text-ink">{pact.deadline}</p>
            </DetailSection>
            <DetailSection label="難易度" en="DIFFICULTY">
              <p className="font-serif text-base">
                <span className="text-seal tracking-widest">{"⚔".repeat(difficulty)}</span>
                <span className="text-ink/20 tracking-widest">
                  {"⚔".repeat(5 - difficulty)}
                </span>
                <span className="ml-2 text-sm text-ink/70">{pact.difficulty} / 5</span>
              </p>
            </DetailSection>
          </div>

          <div className="my-5">
            <StarDivider />
          </div>

          {/* 署名（誓約者）：Caveat フォントで手書き感 */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <p
                className="font-display"
                style={{
                  fontSize: 10,
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
                  // Homemade Apple は em 内の実描画が小さめなのでやや大きく
                  fontSize: 36,
                  color: "var(--color-ink)",
                  lineHeight: 1.3,
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

          {/* 公開設定 */}
          <PublicToggle pact={pact} />

          {/* 操作（active な契約のみ） */}
          {isActive && (
            <section className="mt-4 pt-4 border-t border-gold/30">
              <p className="text-sm text-ink font-bold mb-3">操作</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="ghost" type="button" onClick={() => setEditOpen(true)}>
                  編集
                </Button>
                {/* 入り口ボタンは ghost で控えめに。実際の破棄コミットは確認ダイアログ内で destructive を使う。 */}
                <Button variant="ghost" type="button" onClick={() => setDeleteOpen(true)}>
                  破棄
                </Button>
              </div>
            </section>
          )}
        </ContractCard>

        {/* 編集モーダル */}
        {editOpen && (
          <EditPactModal pact={pact} onClose={() => setEditOpen(false)} />
        )}

        {/* 削除確認ダイアログ */}
        {deleteOpen && (
          <DeleteConfirmDialog pact={pact} onClose={() => setDeleteOpen(false)} />
        )}

        {/* 進捗草式（GitHub 風グリッド）：契約期間中の毎日のチェックイン状態を可視化 */}
        {checkIns && (
          <section className="mb-6 p-5 bg-parchment-card border border-gold/40 rounded-sm">
            <header className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-base text-ink m-0">足跡</h2>
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  color: "var(--color-gold-muted)",
                  paddingLeft: "0.4em",
                }}
              >
                FOOTPRINTS
              </span>
            </header>
            <StarDivider />
            <p className="text-xs text-ink/60 mt-3 mb-3">
              {pact.signed_at.slice(0, 10)} 〜 {pact.deadline}
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <ProgressGrass pact={pact} checkIns={checkIns} interactive />
            </div>
          </section>
        )}

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
          <Button variant="ghost" onClick={() => navigate("/crests")}>
            殿堂へ戻る
          </Button>
        </div>
      </div>
    </Layout>
  )
}

// =====================================================================
// 公開/非公開トグル + 公開 URL コピー
// =====================================================================

function PublicToggle({ pact }: { pact: Pact }) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const toggleMutation = useMutation<Pact, ApiError, boolean>({
    mutationFn: (next) =>
      api<Pact>(`/pacts/${pact.id}`, {
        method: "PATCH",
        body: { is_public: next },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pact", String(pact.id)] })
      await queryClient.invalidateQueries({ queryKey: ["pacts"] })
    },
  })

  const publicUrl = `${window.location.origin}/p/${pact.id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // クリップボード失敗は無視（フォールバックなし、URL は表示されている）
    }
  }

  return (
    <section className="mt-4 pt-4 border-t border-gold/30">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-ink font-bold">公開設定</p>
          <p className="text-xs text-ink/60">
            {pact.is_public
              ? "URL を知っている誰でも閲覧できます"
              : "あなただけが閲覧できます"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={pact.is_public}
          onClick={() => toggleMutation.mutate(!pact.is_public)}
          disabled={toggleMutation.isPending}
          className={`relative w-12 h-6 rounded-full transition shrink-0 ${
            pact.is_public ? "bg-seal" : "bg-ink/30"
          } disabled:opacity-50`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-parchment shadow transition-transform ${
              pact.is_public ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {pact.is_public && (
        <div className="mt-3 p-3 bg-gold/10 border border-gold/40 rounded-lg">
          <p className="text-xs text-ink/70 mb-2">公開 URL：</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-2 py-1 text-xs bg-parchment border border-ink/20 rounded font-mono"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 text-xs bg-seal text-parchment rounded hover:opacity-90 transition shrink-0"
            >
              {copied ? "✓ コピー済み" : "コピー"}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

// =====================================================================
// 契約編集モーダル
// =====================================================================
// 編集可能な属性は goal / constraint_text のみ。
// 期日 / 難易度 / 締結日は契約時に確定する設計（CLAUDE.md 7. 重要な設計判断）。

function EditPactModal({ pact, onClose }: { pact: Pact; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [goal, setGoal] = useState(pact.goal)
  const [constraintText, setConstraintText] = useState(pact.constraint_text)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation<Pact, ApiError, void>({
    mutationFn: () =>
      api<Pact>(`/pacts/${pact.id}`, {
        method: "PATCH",
        body: { goal: goal.trim(), constraint_text: constraintText.trim() },
      }),
    onSuccess: async () => {
      // 既存パターン（checkInMutation / PublicToggle）と挙動を揃えるため、
      // invalidate を await してからモーダルを閉じる。閉じた直後に古いデータが
      // チラ見えするのを避ける。
      await queryClient.invalidateQueries({ queryKey: ["pact", String(pact.id)] })
      await queryClient.invalidateQueries({ queryKey: ["pacts"] })
      onClose()
    },
    onError: (err) => {
      const errors = Array.isArray(err.errors) ? err.errors : []
      const firstError = errors[0] as { message?: string } | undefined
      setError(firstError?.message ?? "編集に失敗しました")
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (goal.trim() === "" || constraintText.trim() === "") {
      setError("目標と制約は必須です")
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal onClose={onClose} labelledBy="edit-pact-title" disableClose={mutation.isPending}>
      <h2 id="edit-pact-title" className="font-serif text-xl text-seal mb-4">
        契約を編集する
      </h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="edit-goal" className="block text-xs text-ink/70 mb-1">
            目標
          </label>
          <textarea
            id="edit-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3 py-2 bg-parchment border border-ink/30 rounded-sm text-sm focus:border-seal focus:outline-none"
            required
          />
        </div>
        <div>
          <label htmlFor="edit-constraint" className="block text-xs text-ink/70 mb-1">
            制約
          </label>
          <textarea
            id="edit-constraint"
            value={constraintText}
            onChange={(e) => setConstraintText(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full px-3 py-2 bg-parchment border border-ink/30 rounded-sm text-sm focus:border-seal focus:outline-none"
            required
          />
        </div>
        <p className="text-xs text-ink/50">
          ※ 期日 / 難易度 / 締結日は契約時に確定したため変更できません。
        </p>
        {error && (
          <p className="text-xs text-seal" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={mutation.isPending}>
            キャンセル
          </Button>
          <Button variant="primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "保存中…" : "保存"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// =====================================================================
// 契約破棄（削除）確認ダイアログ
// =====================================================================
// 論理削除：DB からは消さず status を abandoned に変更する（CLAUDE.md 7.）。

function DeleteConfirmDialog({ pact, onClose }: { pact: Pact; onClose: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation<void, ApiError, void>({
    mutationFn: async () => {
      await api(`/pacts/${pact.id}`, { method: "DELETE" })
    },
    onSuccess: async () => {
      // 既存パターンと挙動を揃えるため、invalidate を await してから navigate する。
      await queryClient.invalidateQueries({ queryKey: ["pact", String(pact.id)] })
      await queryClient.invalidateQueries({ queryKey: ["pacts"] })
      navigate("/crests", { replace: true })
    },
    onError: (err) => {
      const errors = Array.isArray(err.errors) ? err.errors : []
      const firstError = errors[0] as { message?: string } | undefined
      setError(firstError?.message ?? "破棄に失敗しました")
    },
  })

  return (
    <Modal onClose={onClose} labelledBy="delete-pact-title" disableClose={mutation.isPending}>
      <h2 id="delete-pact-title" className="font-serif text-xl text-seal mb-3">
        この契約を破棄しますか？
      </h2>
      <p className="text-sm text-ink/70 mb-2">
        目標：<span className="text-ink">{pact.goal}</span>
      </p>
      <p className="text-xs text-ink/60 mb-4">
        破棄した契約は契約一覧から消え、紋章ももう得られません。一度破棄すると元に戻せません。
      </p>
      {error && (
        <p className="text-xs text-seal mb-3" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose} disabled={mutation.isPending}>
          キャンセル
        </Button>
        <Button
          variant="destructive"
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "破棄中…" : "破棄する"}
        </Button>
      </div>
    </Modal>
  )
}

export default PactDetailPage
