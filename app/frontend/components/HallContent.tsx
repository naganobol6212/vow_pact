import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQueries, useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import Button from "./Button"
import HeraldicCrest from "./HeraldicCrest"
import CrestCatalog from "./CrestCatalog"
import HallStatsBlock from "./HallStatsBlock"
import HallFilterBar, {
  type HallFilter,
  type HallSort,
} from "./HallFilterBar"
import TrophyCard from "./hall/TrophyCard"
import ActiveCard from "./hall/ActiveCard"
import { api, ApiError } from "../lib/api"
import type { Pact, CrestRarity } from "../types/pact"
import type { CheckIn } from "../types/check_in"
import { useAuth } from "../hooks/useAuth"

const RARITY_ORDER: Record<CrestRarity, number> = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
}

/**
 * 殿堂のメインコンテンツ（統計 / フィルタ / カードグリッド / 紋章カタログ）。
 *
 * 旧 CrestsGalleryPage の中身を再利用可能なコンポーネントとして切り出したもの。
 * Home ページがダッシュボード化される際にもここを差し込む。ページ固有のヘッダー
 * （誓約の殿堂、ようこそ、等）は呼び出し側で組む前提。
 *
 * 「破棄した契約は表示しない」方針のため abandoned / failed は全フィルタで除外。
 */
function HallContent() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<HallFilter>("all")
  const [sort, setSort] = useState<HallSort>("recent")

  const { data: pacts = [], isLoading, isError } = useQuery<Pact[], ApiError>({
    queryKey: ["pacts"],
    queryFn: () => api<Pact[]>("/pacts"),
  })

  // 進行中契約だけ check_ins を並列取得（active_card の進捗草式に使う）。
  // 既存の PactDetail と同じ queryKey なので cache を共有できる。
  const activePacts = useMemo(
    () => pacts.filter((p) => p.status === "active"),
    [pacts]
  )
  const checkInQueries = useQueries({
    queries: activePacts.map((p) => ({
      queryKey: ["pact", String(p.id), "check_ins"] as const,
      queryFn: () => api<CheckIn[]>(`/pacts/${p.id}/check_ins`),
      // active な契約だけ。チェックイン結果はすぐ古くなるので staleTime 短め。
      staleTime: 60_000,
    })),
  })
  const checkInsByPactId = useMemo(() => {
    const map = new Map<number, CheckIn[]>()
    activePacts.forEach((p, idx) => {
      const result = checkInQueries[idx]?.data
      if (result) map.set(p.id, result)
    })
    return map
  }, [activePacts, checkInQueries])

  // 表示対象を絞り込む。abandoned / failed はどのフィルタでも除外する。
  const visible = useMemo(() => {
    let list = pacts.filter((p) => p.status === "completed" || p.status === "active")
    if (filter === "fulfilled") list = list.filter((p) => p.status === "completed")
    else if (filter === "active") list = list.filter((p) => p.status === "active")

    if (sort === "rarity") {
      list.sort((a, b) => {
        const ra = a.crest ? RARITY_ORDER[a.crest.rarity] : 0
        const rb = b.crest ? RARITY_ORDER[b.crest.rarity] : 0
        return rb - ra
      })
    } else {
      list.sort((a, b) => {
        const ad = new Date(a.completed_at ?? a.signed_at).getTime()
        const bd = new Date(b.completed_at ?? b.signed_at).getTime()
        return bd - ad
      })
    }
    return list
  }, [pacts, filter, sort])

  // 統計
  const completed = useMemo(
    () => pacts.filter((p) => p.status === "completed"),
    [pacts]
  )
  const streak = user?.streak_count ?? 0
  const longestStreak = user?.longest_streak ?? 0

  return (
    <>
      {/* 公開フィード（広場）への導線 */}
      <div className="text-center mt-3">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-serif text-seal hover:underline"
        >
          <span aria-hidden="true">🌳</span>
          他の誓約者の広場を覗く →
        </Link>
      </div>

      {/* 統計 */}
      {pacts.length > 0 && (
        <HallStatsBlock
          achievedCount={completed.length}
          streak={streak}
          longestStreak={longestStreak}
        />
      )}

      {/* フィルタ + ソート */}
      <HallFilterBar
        filter={filter}
        sort={sort}
        onFilter={setFilter}
        onSort={setSort}
      />

      {/* ローディング / エラー */}
      {isLoading && (
        <p className="text-center text-ink/60 mt-12">殿堂を開いている…</p>
      )}
      {isError && (
        <p className="text-center text-seal mt-12">殿堂を開けませんでした</p>
      )}

      {/* 空状態 */}
      {!isLoading && !isError && visible.length === 0 && (
        <HallEmpty filter={filter} hasAnyPact={pacts.length > 0} />
      )}

      {/* カードグリッド */}
      {visible.length > 0 && (
        <main className="px-1 py-3" aria-label="自分の契約一覧">
          <div className="grid grid-cols-2 gap-3">
            {visible.map((pact, index) => {
              const no = String(index + 1).padStart(3, "0")
              // ActiveCard は草式と期日を主役にしたいので 2 列ぶち抜き、他は 1 列。
              const fullWidth = pact.status === "active"
              return (
                <motion.div
                  key={pact.id}
                  className={fullWidth ? "col-span-2" : ""}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.04, 0.6),
                    ease: "easeOut",
                  }}
                >
                  {pact.status === "completed" ? (
                    <TrophyCard
                      pact={pact}
                      no={no}
                      keptRate={1.0 /* TODO: PactSerializer に kept_rate を追加したら差し替える */}
                    />
                  ) : (
                    <ActiveCard
                      pact={pact}
                      no={no}
                      checkIns={checkInsByPactId.get(pact.id) ?? []}
                      daysLeft={computeDaysLeft(pact)}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </main>
      )}

      {/* 紋章の階位カタログ（授かりうる紋章の種類）*/}
      <CrestCatalog />
    </>
  )
}

function HallEmpty({
  filter,
  hasAnyPact,
}: {
  filter: HallFilter
  hasAnyPact: boolean
}) {
  if (!hasAnyPact) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-7">
        <div className="mb-4 opacity-40">
          <HeraldicCrest rarity="common" size={120} />
        </div>
        <h2
          className="font-serif font-semibold m-0"
          style={{
            fontSize: 22,
            letterSpacing: "0.1em",
            lineHeight: 1.5,
            color: "var(--color-ink)",
          }}
        >
          殿堂はまだ静かだ
        </h2>
        <p
          className="font-serif mt-2.5 mb-6"
          style={{
            fontSize: 13,
            color: "#6b6b6b",
            lineHeight: 1.7,
            letterSpacing: "0.04em",
            maxWidth: 260,
          }}
        >
          最初の試練を乗り越えたとき、
          <br />
          ここにあなたの紋章が刻まれる。
        </p>
        <Link to="/pacts/new/step1">
          <Button variant="primary">契約を結ぶ</Button>
        </Link>
      </div>
    )
  }

  // フィルタによる絞り込みで空になった場合
  return (
    <p
      className="text-center font-serif italic mt-12"
      style={{
        fontSize: 13,
        color: "var(--color-gold-muted)",
      }}
    >
      該当する契約はありません。
      {filter !== "all" && (
        <>
          <br />
          <span className="text-xs text-ink/50">フィルタを「全て」に戻すとすべての記録が見られます。</span>
        </>
      )}
    </p>
  )
}

/** 期日まで残り日数（負ならオーバー）。 */
function computeDaysLeft(pact: Pact): number {
  const deadline = new Date(pact.deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffMs = deadline.getTime() - today.getTime()
  return Math.ceil(diffMs / 86400000)
}

export default HallContent
