export type PactStatus = "active" | "completed" | "failed" | "abandoned"

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
  created_at: string
  updated_at: string
}
