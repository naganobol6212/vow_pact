// 𝕏 シェア用の文言・ラベル・ハッシュタグを 1 ヶ所に集約する。
// 後で文言を差し替えるとき / i18n 対応するときの単一窓口。

export const SHARE_LABELS = {
  signed: "𝕏で天下に宣する",
  checkIn: "𝕏で歩みを刻む",
  fulfilled: "𝕏で栄光を示す",
} as const

export const SHARE_HASHTAGS = ["vow_pact", "誓約契約"] as const

type SignedTextParams = {
  goal: string
  constraintText: string
  deadline: string
}

export function buildSignedShareText({ goal, constraintText, deadline }: SignedTextParams): string {
  return [
    "新たな誓いを立てた。",
    `目標：${goal}`,
    `試練：${constraintText}`,
    `期日：${deadline}`,
    "𝕏で天下に宣する 🗡",
  ].join("\n")
}

type CheckInStatus = "kept" | "broken" | "skipped"
type CheckInTextParams = {
  dayCount: number
  status: CheckInStatus
}

const CHECK_IN_TEMPLATES: Record<CheckInStatus, (n: number) => string> = {
  kept: (n) => `${n}日目、誓いを守れた ⚔`,
  broken: (n) => `${n}日目、誓いに揺れた。明日また、刃を研ぎ直す。`,
  skipped: (n) => `${n}日目、休戦。明日、また誓いに戻る。`,
}

export function buildCheckInShareText({ dayCount, status }: CheckInTextParams): string {
  return CHECK_IN_TEMPLATES[status](dayCount)
}

type FulfilledTextParams = {
  goal: string
  periodDays: number
  rarity: string
  title?: string
}

export function buildFulfilledShareText({
  goal,
  periodDays,
  rarity,
  title,
}: FulfilledTextParams): string {
  const head = title ? `「${title}」、ここに成就せり 🏆` : "誓い、ここに成就せり 🏆"
  return [
    head,
    `${goal} を ${periodDays}日かけて成し遂げた。`,
    `紋章「${rarity}」を授かりし者。`,
  ].join("\n")
}
