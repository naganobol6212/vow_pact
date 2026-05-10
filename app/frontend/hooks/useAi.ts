import { useMutation } from "@tanstack/react-query"
import { api, ApiError } from "../lib/api"

// AI API（Issue #20）を React 側から呼ぶための薄いラッパー群。
// useMutation を使うことで loading / error 状態を簡単に扱える。

type GoalsResponse = { goals: string[] }
type ConstraintsResponse = { constraints: string[] }
type DifficultyResponse = { difficulty: number; reason: string }
type TitlesResponse = { titles: string[] }

/** AI が偏らせるジャンル。空文字 / undefined はジャンル横断（おまかせ）。 */
export type GoalGenre =
  | ""
  | "学習"
  | "健康"
  | "創造"
  | "社交"
  | "内省"
  | "仕事"
  | "生活"

export function useSuggestGoals() {
  // theme を省略 / 空で呼ぶと、サーバ側で「おまかせ（ランダム）モード」になる。
  // genre を指定するとそのジャンルに寄せて提案する（任意）。
  return useMutation<GoalsResponse, ApiError, { theme?: string; genre?: GoalGenre }>({
    mutationFn: ({ theme, genre }) =>
      api<GoalsResponse>("/ai/goals", {
        method: "POST",
        body: { theme: theme ?? "", genre: genre ?? "" },
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
