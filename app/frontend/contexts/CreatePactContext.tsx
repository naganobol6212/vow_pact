import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

// 契約作成フロー（4 ステップ）で共有するドラフトデータ。
// localStorage や URL パラメータでなく Context で持つことで、
// リロードすると消える（途中放棄を許容する MVP の設計）。
export type PactDraft = {
  goal: string
  constraintText: string
  difficulty: number // 1〜5
  difficultyReason: string
  deadline: string // YYYY-MM-DD
}

type CreatePactContextValue = {
  draft: PactDraft
  setDraft: (updater: (prev: PactDraft) => PactDraft) => void
  resetDraft: () => void
}

const initialDraft: PactDraft = {
  goal: "",
  constraintText: "",
  difficulty: 3,
  difficultyReason: "",
  deadline: "",
}

const CreatePactContext = createContext<CreatePactContextValue | undefined>(undefined)

export function CreatePactProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<PactDraft>(initialDraft)

  const setDraft = (updater: (prev: PactDraft) => PactDraft) => {
    setDraftState((prev) => updater(prev))
  }

  const resetDraft = () => setDraftState(initialDraft)

  return (
    <CreatePactContext.Provider value={{ draft, setDraft, resetDraft }}>
      {children}
    </CreatePactContext.Provider>
  )
}

export function useCreatePact() {
  const ctx = useContext(CreatePactContext)
  if (!ctx) {
    throw new Error("useCreatePact must be used within CreatePactProvider")
  }
  return ctx
}
