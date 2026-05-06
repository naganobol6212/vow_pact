import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Layout from "../components/Layout"
import { api, ApiError } from "../lib/api"
import { useAuth } from "../hooks/useAuth"
import type {
  MonthlyRankingResponse,
  StreakRankingResponse,
} from "../types/ranking"

type Tab = "streak" | "monthly"

function rankBadge(rank: number) {
  if (rank === 1) return { emoji: "🥇", className: "text-gold" }
  if (rank === 2) return { emoji: "🥈", className: "text-ink/60" }
  if (rank === 3) return { emoji: "🥉", className: "text-seal/80" }
  return { emoji: `${rank}`, className: "text-ink/50" }
}

function RankingsPage() {
  const [tab, setTab] = useState<Tab>("streak")
  const { user } = useAuth()

  // Hooks は早期 return より前に呼び出す（rules-of-hooks）。
  // ゲスト時は enabled: false にして API は叩かない。
  const isGuest = user?.is_guest === true

  const streakQuery = useQuery<StreakRankingResponse, ApiError>({
    queryKey: ["rankings", "streak"],
    queryFn: () => api<StreakRankingResponse>("/rankings/streak"),
    enabled: tab === "streak" && !isGuest,
  })

  const monthlyQuery = useQuery<MonthlyRankingResponse, ApiError>({
    queryKey: ["rankings", "monthly"],
    queryFn: () => api<MonthlyRankingResponse>("/rankings/monthly"),
    enabled: tab === "monthly" && !isGuest,
  })

  // ゲストには非公開（直接 URL アクセスでも見せない）
  if (isGuest) {
    return (
      <Layout title="ランキング">
        <div className="max-w-md mx-auto mt-12 text-center">
          <p className="font-serif text-xl text-seal mb-3">ランキングは本登録後にご覧いただけます</p>
          <p className="text-sm text-ink/70 mb-6">
            メールアドレスを登録するとランキングへの参加・閲覧ができます。
            <br />
            これまでの誓約・チェックイン・紋章はそのまま引き継がれます。
          </p>
          <a
            href="/settings"
            className="inline-block px-6 py-2 bg-seal text-parchment rounded-lg shadow hover:shadow-lg hover:scale-105 transition font-bold"
          >
            設定画面で正式登録する
          </a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="ランキング">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-2xl text-seal mb-2">ランキング</p>
          <p className="text-sm text-ink/60">プロフィールを公開しているユーザー同士で競い合います</p>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-2 border-b border-gold/30">
          <button
            onClick={() => setTab("streak")}
            className={`flex-1 px-4 py-2 text-sm font-bold transition ${
              tab === "streak" ? "text-seal border-b-2 border-seal" : "text-ink/50 hover:text-ink"
            }`}
          >
            連続チェックイン日数
          </button>
          <button
            onClick={() => setTab("monthly")}
            className={`flex-1 px-4 py-2 text-sm font-bold transition ${
              tab === "monthly" ? "text-seal border-b-2 border-seal" : "text-ink/50 hover:text-ink"
            }`}
          >
            今月達成した契約数
          </button>
        </div>
        <p className="text-xs text-ink/50 mb-6 text-center">
          {tab === "streak"
            ? "「kept（守れた）」を毎日続けた日数で競います。途切れると 0 にリセット。"
            : "今月のうち、契約期間が満了して達成（completed）した契約の数で競います。"}
        </p>

        {/* 自分の順位（is_public=false でも見える） */}
        {user && !user.is_public && (
          <div className="mb-4 p-3 bg-gold/10 border border-gold/40 rounded-sm text-xs text-ink/70">
            あなたは「ランキング非表示」設定です。一覧には載りませんが、自分の順位は見えます。
            <span className="block mt-1">設定画面で公開に変更できます。</span>
          </div>
        )}

        {tab === "streak" && (
          <>
            {streakQuery.isLoading && <p className="text-center text-ink/60 mt-12">読み込み中…</p>}
            {streakQuery.isError && <p className="text-center text-seal mt-12">取得に失敗しました</p>}
            {streakQuery.data && (
              <div>
                <RankingList
                  entries={streakQuery.data.rankings.map((e) => ({
                    rank: e.rank,
                    nickname: e.user.nickname,
                    score: e.streak_count,
                    suffix: "日",
                    isMe: e.user.id === user?.id,
                  }))}
                />
                <MyRank
                  rank={streakQuery.data.my_rank.rank}
                  score={streakQuery.data.my_rank.streak_count}
                  suffix="日"
                />
              </div>
            )}
          </>
        )}

        {tab === "monthly" && (
          <>
            {monthlyQuery.isLoading && <p className="text-center text-ink/60 mt-12">読み込み中…</p>}
            {monthlyQuery.isError && <p className="text-center text-seal mt-12">取得に失敗しました</p>}
            {monthlyQuery.data && (
              <div>
                <p className="text-center text-xs text-ink/60 mb-3">{monthlyQuery.data.month}</p>
                <RankingList
                  entries={monthlyQuery.data.rankings.map((e) => ({
                    rank: e.rank,
                    nickname: e.user.nickname,
                    score: e.achievement_count,
                    suffix: "件",
                    isMe: e.user.id === user?.id,
                  }))}
                />
                <MyRank
                  rank={monthlyQuery.data.my_rank.rank}
                  score={monthlyQuery.data.my_rank.achievement_count}
                  suffix="件"
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

type Entry = { rank: number; nickname: string; score: number; suffix: string; isMe: boolean }

function RankingList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <p className="text-center text-ink/50 mt-12">まだランキングに人がいません。</p>
  }
  return (
    <ul className="space-y-2">
      {entries.map((e, i) => {
        const badge = rankBadge(e.rank)
        return (
          <li
            key={`${e.rank}-${i}`}
            className={`flex items-center gap-3 p-3 border rounded-xl shadow-sm transition hover:shadow-md ${
              e.isMe
                ? "bg-seal/10 border-seal ring-2 ring-seal/30"
                : "bg-parchment/70 border-gold/40 hover:border-gold"
            }`}
          >
            <span className={`w-10 text-center text-xl font-serif ${badge.className}`}>
              {badge.emoji}
            </span>
            <span className="flex-1 font-serif text-base text-ink">
              {e.nickname}
              {e.isMe && <span className="ml-2 text-xs text-seal font-bold">あなた</span>}
            </span>
            <span className="font-serif text-base text-ink">
              {e.score}
              <span className="text-sm text-ink/60 ml-1">{e.suffix}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function MyRank({ rank, score, suffix }: { rank: number | null; score: number; suffix: string }) {
  return (
    <div className="mt-6 p-4 bg-parchment border-2 border-seal/40 rounded-sm">
      <p className="text-xs text-ink/60 font-serif mb-1">あなたの順位</p>
      <p className="font-serif text-base text-ink">
        {rank ? `${rank} 位` : "圏外"}
        <span className="ml-3 text-sm text-ink/60">
          （{score} {suffix}）
        </span>
      </p>
    </div>
  )
}

export default RankingsPage
