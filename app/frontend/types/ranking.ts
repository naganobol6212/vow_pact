export type RankingUser = {
  id: number
  nickname: string
  avatar_url: string | null
}

export type MonthlyRankingEntry = {
  rank: number
  user: RankingUser
  achievement_count: number
}

export type StreakRankingEntry = {
  rank: number
  user: RankingUser
  streak_count: number
}

export type MonthlyRankingResponse = {
  month: string
  rankings: MonthlyRankingEntry[]
  my_rank: { rank: number | null; achievement_count: number }
}

export type StreakRankingResponse = {
  rankings: StreakRankingEntry[]
  my_rank: { rank: number | null; streak_count: number }
}
