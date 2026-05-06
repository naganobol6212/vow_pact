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

  const streakQuery = useQuery<StreakRankingResponse, ApiError>({
    queryKey: ["rankings", "streak"],
    queryFn: () => api<StreakRankingResponse>("/rankings/streak"),
    enabled: tab === "streak",
  })

  const monthlyQuery = useQuery<MonthlyRankingResponse, ApiError>({
    queryKey: ["rankings", "monthly"],
    queryFn: () => api<MonthlyRankingResponse>("/rankings/monthly"),
    enabled: tab === "monthly",
  })

  return (
    <Layout title="ランキング">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-xl text-seal mb-2">誓約者の番付</p>
          <p className="text-sm text-ink/60">公開ユーザー同士で競う</p>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-6 border-b border-gold/30">
          <button
            onClick={() => setTab("streak")}
            className={`flex-1 px-4 py-2 text-sm font-serif transition ${
              tab === "streak" ? "text-seal border-b-2 border-seal" : "text-ink/50 hover:text-ink"
            }`}
          >
            連続日数
          </button>
          <button
            onClick={() => setTab("monthly")}
            className={`flex-1 px-4 py-2 text-sm font-serif transition ${
              tab === "monthly" ? "text-seal border-b-2 border-seal" : "text-ink/50 hover:text-ink"
            }`}
          >
            今月の達成数
          </button>
        </div>

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
            className={`flex items-center gap-3 p-3 border rounded-sm ${
              e.isMe ? "bg-seal/10 border-seal" : "bg-parchment/60 border-gold/40"
            }`}
          >
            <span className={`w-10 text-center text-xl font-serif ${badge.className}`}>
              {badge.emoji}
            </span>
            <span className="flex-1 font-serif text-base text-ink">
              {e.nickname}
              {e.isMe && <span className="ml-2 text-xs text-seal">あなた</span>}
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
