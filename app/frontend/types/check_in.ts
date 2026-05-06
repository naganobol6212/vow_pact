export type CheckInStatus = "kept" | "broken" | "skipped"

export type CheckIn = {
  id: number
  pact_id: number
  checked_on: string
  status: CheckInStatus
  note: string | null
  created_at: string
  updated_at: string
}
