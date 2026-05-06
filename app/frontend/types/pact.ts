export type PactStatus = "active" | "completed" | "failed" | "abandoned"

export type CrestRarity = "common" | "rare" | "epic" | "legendary"

export type CrestData = {
  base_shape: string
  central_motif: string
  decoration: string
  color_palette: string
  shimmer_level: number
}

export type Crest = {
  id: number
  pact_id: number
  crest_data: CrestData
  rarity: CrestRarity
  generated_at: string
  created_at: string
  updated_at: string
}

export type Pact = {
  id: number
  user_id: number
  goal: string
  constraint_text: string
  difficulty: number
  difficulty_reason: string | null
  deadline: string
  status: PactStatus
  title: string | null
  signed_at: string
  completed_at: string | null
  /** この契約を公開するか。true なら /p/:id から認証なしで閲覧可能。 */
  is_public: boolean
  crest: Crest | null
  created_at: string
  updated_at: string
}
