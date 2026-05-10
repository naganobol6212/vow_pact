import { Link, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import HallContent from "../components/HallContent"
import StarDivider from "../components/StarDivider"
import { useAuth } from "../hooks/useAuth"
import { api, ApiError } from "../lib/api"
import type { User } from "../types/user"

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: "✍️",
    title: "誓う",
    description: "目標と制約をセットで決める。AI も提案してくれる。",
  },
  {
    step: 2,
    icon: "📅",
    title: "記録",
    description: "毎日チェックイン。守れた / 破れた / 休戦の 3 択。",
  },
  {
    step: 3,
    icon: "🏆",
    title: "達成",
    description: "遵守率が半分を超えれば紋章を獲得。",
  },
]

/**
 * ホームページ。
 * - 未ログイン: マーケティングランディング（ヒーロー + 使い方 + 特徴）
 * - ログイン中: ダッシュボード（ウェルカム + 統計 + フィルタ + 自分の契約 + 紋章カタログ）
 *
 * ログイン中ユーザーが「自分の今」を一目で把握できるように、旧 /crests
 * （誓約の殿堂）のコンテンツをここに集約した。/crests は本ホームへリダイレクト。
 */
function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const guestMutation = useMutation<User, ApiError, void>({
    mutationFn: () => api<User>("/auth/guest", { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      navigate("/pacts/new/step1")
    },
  })

  if (isLoading) {
    return (
      <Layout>
        <p className="text-center text-ink/60 mt-12">読み込み中…</p>
      </Layout>
    )
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-1">
          <DashboardWelcome nickname={user?.nickname ?? "誓約者"} />
          <HallContent />
          <div className="text-center mt-8 mb-2">
            <Button variant="primary" onClick={() => navigate("/pacts/new/step1")}>
              新たな誓いを立てる
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* コンパクトなヒーロー（縦に短くして、すぐに「使い方」が見える） */}
      <section className="relative overflow-hidden -mx-4 px-4 pt-8 pb-6 sm:pt-12 sm:pb-8 mb-8 bg-linear-to-br from-parchment via-parchment to-gold/10">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-12 -left-12 w-60 h-60 rounded-full bg-seal/10 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-60 h-60 rounded-full bg-gold/20 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <p
            className="font-display font-semibold mb-2"
            style={{
              fontSize: 11,
              letterSpacing: "0.55em",
              color: "var(--color-gold-deep)",
              paddingLeft: "0.55em",
            }}
            aria-hidden="true"
          >
            ── VOW PACT &middot; MMXXVI ──
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-seal mb-2 tracking-wide">
            誓約 <span className="text-gold mx-1 sm:mx-2">⚔</span> 契約
          </h2>
          <p className="text-ink/80 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
            目標と制約を「誓い」として刻み、達成すれば紋章を得る。
            <br className="hidden sm:block" />
            自分との契約を、形にする場。
          </p>

          <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button variant="primary" fullWidth onClick={() => navigate("/signup")}>
                新規登録
              </Button>
              <Button variant="ghost" fullWidth onClick={() => navigate("/login")}>
                ログイン
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full">
              <span className="flex-1 border-t border-ink/20" />
              <span className="text-xs text-ink/50">または</span>
              <span className="flex-1 border-t border-ink/20" />
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => guestMutation.mutate()}
              disabled={guestMutation.isPending}
            >
              {guestMutation.isPending ? "支度中..." : "🎲 登録せずに 30 日お試し"}
            </Button>
            <p className="text-[11px] text-ink/50 -mt-2">
              作った誓約は本登録時にそのまま引き継がれます
            </p>

            {guestMutation.isError && (
              <p className="text-xs text-seal">
                ゲストの開始に失敗しました。再度お試しください。
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 使い方 3 ステップ（ファーストビューに収まる位置に） */}
      <section className="max-w-5xl mx-auto mb-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p
              className="font-display font-semibold"
              style={{
                fontSize: 10,
                letterSpacing: "0.5em",
                color: "var(--color-gold-muted)",
                paddingLeft: "0.5em",
              }}
              aria-hidden="true"
            >
              ── HOW IT WORKS ──
            </p>
            <h3 className="font-serif text-xl sm:text-2xl text-seal mt-1">使い方</h3>
          </div>
          <Link to="/how-it-works" className="text-xs text-seal hover:underline">
            くわしく →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="relative p-3 sm:p-5 bg-parchment-card border border-gold/40 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-seal text-parchment font-serif font-bold text-xs sm:text-sm shadow">
                {item.step}
              </div>
              <div className="text-3xl sm:text-4xl mb-2 text-center">{item.icon}</div>
              <h4 className="font-serif text-sm sm:text-base text-seal text-center mb-1">
                {item.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-ink/70 leading-relaxed text-center">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 特徴 */}
      <section className="max-w-4xl mx-auto mb-12 text-center">
        <p
          className="font-display font-semibold mb-1"
          style={{
            fontSize: 10,
            letterSpacing: "0.5em",
            color: "var(--color-gold-muted)",
            paddingLeft: "0.5em",
          }}
          aria-hidden="true"
        >
          ── DIFFERENCES ──
        </p>
        <h3 className="font-serif text-xl sm:text-2xl text-seal mb-2">
          他の習慣アプリとの違い
        </h3>
        <p className="text-xs text-ink/60 mb-6">
          「TODO リスト」では味わえない、自分との契約感
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              emoji: "🛡",
              title: "制約も明示する",
              text: "「やる」だけでなく「やらない」も誓う。本気度が変わる。",
            },
            {
              emoji: "✦",
              title: "AI が背中を押す",
              text: "目標案・制約案・難易度判定を AI がサポート。一人で考え込まない。",
            },
            {
              emoji: "🏆",
              title: "達成は紋章で残る",
              text: "達成した契約は 4 段階のレアリティで紋章化。コレクションが財産に。",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 bg-parchment-card border border-gold/30 rounded-xl text-center hover:border-seal hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <h4 className="font-bold text-seal mb-1 text-sm">{f.title}</h4>
              <p className="text-xs text-ink/70 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/how-it-works" className="text-sm text-seal hover:underline">
            使い方の詳細・FAQ を見る →
          </Link>
        </div>
      </section>
    </Layout>
  )
}

/**
 * ダッシュボード上部のウェルカムブロック。
 * 「── HOME ──」キャプション + 「{ニックネーム}、本日も誓約の途上にあり」
 */
function DashboardWelcome({ nickname }: { nickname: string }) {
  return (
    <header className="text-center pt-4 pb-3">
      <p
        className="font-display font-semibold mb-2"
        style={{
          fontSize: 10,
          letterSpacing: "0.55em",
          color: "var(--color-gold-deep)",
          paddingLeft: "0.55em",
        }}
        aria-hidden="true"
      >
        ── HOME ──
      </p>
      <h1
        className="font-serif font-bold m-0"
        style={{
          fontSize: "clamp(20px, 5.5vw, 26px)",
          letterSpacing: "0.1em",
          color: "var(--color-ink)",
          paddingLeft: "0.1em",
          lineHeight: 1.4,
        }}
      >
        <span className="text-seal">{nickname}</span>、本日も誓約の途上にあり
      </h1>
      <div className="mt-3">
        <StarDivider />
      </div>
    </header>
  )
}

export default HomePage
