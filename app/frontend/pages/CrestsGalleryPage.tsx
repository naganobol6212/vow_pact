import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { api, ApiError } from "../lib/api"
import type { Pact, CrestRarity } from "../types/pact"

const RARITY_TABS: { value: CrestRarity | "all"; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "legendary", label: "伝説" },
  { value: "epic", label: "英雄" },
  { value: "rare", label: "稀少" },
  { value: "common", label: "通常" },
]

const RARITY_STYLE: Record<CrestRarity, { label: string; className: string; ringClass: string }> = {
  common: {
    label: "Common",
    className: "bg-ink/5 text-ink/70 border-ink/30",
    ringClass: "ring-ink/20",
  },
  rare: {
    label: "Rare",
    className: "bg-seal/10 text-seal border-seal/40",
    ringClass: "ring-seal/30",
  },
  epic: {
    label: "Epic",
    className: "bg-gold/20 text-ink border-gold",
    ringClass: "ring-gold/50",
  },
  legendary: {
    label: "Legendary",
    className: "bg-gradient-to-br from-gold/40 to-seal/30 text-ink border-gold animate-pulse",
    ringClass: "ring-gold",
  },
}

const MOTIF_EMOJI: Record<string, string> = {
  sword: "⚔",
  moon: "🌙",
  flame: "🔥",
  eye: "👁",
  book: "📖",
  wolf: "🐺",
  eagle: "🦅",
  dragon: "🐉",
  star: "⭐",
  phoenix: "🦜",
}

function CrestsGalleryPage() {
  const [filter, setFilter] = useState<CrestRarity | "all">("all")

  const { data: pacts, isLoading, isError } = useQuery<Pact[], ApiError>({
    queryKey: ["pacts"],
    queryFn: () => api<Pact[]>("/pacts"),
  })

  const earned = useMemo(
    () => (pacts ?? []).filter((p) => p.status === "completed" && p.crest),
    [pacts]
  )

  const filtered = useMemo(
    () =>
      filter === "all"
        ? earned
        : earned.filter((p) => p.crest?.rarity === filter),
    [earned, filter]
  )

  return (
    <Layout title="誓約の殿堂">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-serif text-xl text-seal mb-2">誓約の殿堂</p>
          <p className="text-sm text-ink/60">これまでに刻みし {earned.length} 個の紋章</p>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mb-6 border-b border-gold/30 overflow-x-auto">
          {RARITY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-sm font-serif whitespace-nowrap transition ${
                filter === tab.value
                  ? "text-seal border-b-2 border-seal"
                  : "text-ink/50 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-center text-ink/60 mt-12">殿堂を開いている…</p>}

        {isError && <p className="text-center text-seal mt-12">殿堂を開けませんでした</p>}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-ink/60 mb-6">
              {earned.length === 0
                ? "まだ紋章を授かっていません。最初の誓いを成就させよう。"
                : "該当する紋章がありません。"}
            </p>
            <Link to="/pacts/new/step1">
              <Button variant="primary">新たな誓約を結ぶ</Button>
            </Link>
          </div>
        )}

        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((pact) => {
            if (!pact.crest) return null
            const style = RARITY_STYLE[pact.crest.rarity]
            const motif = MOTIF_EMOJI[pact.crest.crest_data.central_motif] ?? "⚔"
            const shimmer = pact.crest.crest_data.shimmer_level
            return (
              <li key={pact.id}>
                <Link
                  to={`/pacts/${pact.id}`}
                  className={`block p-4 bg-parchment border-2 rounded-sm transition hover:scale-[1.02] ${style.className}`}
                >
                  {/* 紋章ビジュアル */}
                  <div className="flex justify-center mb-3">
                    <div
                      className={`relative w-24 h-24 flex items-center justify-center rounded-full bg-parchment ring-4 ${style.ringClass}`}
                    >
                      <span className="text-4xl">{motif}</span>
                    </div>
                  </div>

                  {/* レアリティバッジ */}
                  <div className="flex justify-center mb-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 border rounded-sm ${style.className}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* 装飾レベル */}
                  <p className="text-center text-xs text-ink/60 mb-2">
                    {"✦".repeat(shimmer)}
                  </p>

                  {/* 目標 */}
                  <p className="text-xs text-center font-serif text-ink line-clamp-2">
                    {pact.goal}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </Layout>
  )
}

export default CrestsGalleryPage
