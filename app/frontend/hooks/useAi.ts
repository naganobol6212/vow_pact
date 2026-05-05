import { useMutation } from "@tanstack/react-query"
import { api, ApiError } from "../lib/api"

// AI API（Issue #20）を React 側から呼ぶための薄いラッパー群。
// useMutation を使うことで loading / error 状態を簡単に扱える。

type GoalsResponse = { goals: string[] }
type ConstraintsResponse = { constraints: string[] }
type DifficultyResponse = { difficulty: number; reason: string }
type TitlesResponse = { titles: string[] }

export function useSuggestGoals() {
  // theme を省略 / 空で呼ぶと、サーバ側で「おまかせ（ランダム）モード」になる。
  return useMutation<GoalsResponse, ApiError, { theme?: string }>({
    mutationFn: ({ theme }) =>
      api<GoalsResponse>("/ai/goals", {
        method: "POST",
        body: { theme: theme ?? "" },
      }),
  })
}

export function useSuggestConstraints() {
  return useMutation<ConstraintsResponse, ApiError, { goal: string }>({
    mutationFn: ({ goal }) =>
      api<ConstraintsResponse>("/ai/constraints", {
        method: "POST",
        body: { goal },
      }),
  })
}

export function useJudgeDifficulty() {
  return useMutation<
    DifficultyResponse,
    ApiError,
    { goal: string; constraint_text: string; deadline: string }
  >({
    mutationFn: (params) =>
      api<DifficultyResponse>("/ai/difficulties", {
        method: "POST",
        body: params,
      }),
  })
}

export function useSuggestTitles() {
  return useMutation<TitlesResponse, ApiError, { goal: string; difficulty: number }>({
    mutationFn: (params) =>
      api<TitlesResponse>("/ai/titles", {
        method: "POST",
        body: params,
      }),
  })
}
