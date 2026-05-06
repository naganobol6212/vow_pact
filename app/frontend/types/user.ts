export type User = {
  id: number
  email: string
  nickname: string
  avatar_url: string | null
  /** Active Storage で添付された画像のパブリック URL（attached?なら設定、なければ null）。 */
  avatar_image_url: string | null
  is_public: boolean
  is_guest: boolean
  streak_count: number
  longest_streak: number
  created_at: string
  updated_at: string
}
