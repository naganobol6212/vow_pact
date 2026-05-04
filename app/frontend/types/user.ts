export type User = {
  id: number
  email: string
  nickname: string
  avatar_url: string | null
  is_public: boolean
  streak_count: number
  longest_streak: number
  created_at: string
  updated_at: string
}
