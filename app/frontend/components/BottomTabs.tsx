import { Link, useLocation } from "react-router-dom"

type Tab = {
  to: string
  label: string
  icon: string
  /** このタブが「現在地」と判定される条件 */
  match: (path: string) => boolean
}

// 旧「契約」タブ（/pacts）は殿堂と機能が重複していたため廃止。
// 殿堂が「達成 + 進行中」を 1 ページに統合表示するため契約一覧の役割を引き継ぐ。
// /pacts への直接アクセスは /crests へリダイレクト。
const TABS: Tab[] = [
  {
    to: "/",
    label: "ホーム",
    icon: "🏠",
    // /pacts/:id 詳細もホームから辿れるためここで吸収（誓う以外の /pacts/* は home 扱い）
    match: (p) =>
      p === "/" ||
      (p.startsWith("/pacts/") && !p.startsWith("/pacts/new") && p !== "/pacts"),
  },
  {
    to: "/pacts/new/step1",
    label: "誓う",
    icon: "✍️",
    match: (p) => p.startsWith("/pacts/new"),
  },
  {
    to: "/crests",
    label: "殿堂",
    icon: "🏆",
    match: (p) => p === "/crests" || p.startsWith("/crests/") || p === "/pacts",
  },
  {
    to: "/settings",
    label: "設定",
    icon: "⚙",
    match: (p) => p === "/settings" || p.startsWith("/settings/"),
  },
]

/**
 * モバイルアプリ風の下部固定タブバー（ログイン後のみ表示）。
 * すべてのタブは同じスタイル。アクティブなタブだけハイライトする。
 */
function BottomTabs() {
  const { pathname } = useLocation()

  return (
    <>
      {/* タブと本体が被らないよう、本体に下余白を作る */}
      <div className="h-16" aria-hidden="true" />

      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-parchment-bg/95 backdrop-blur-md border-t border-gold/40 shadow-[0_-4px_20px_rgba(139,26,26,0.08)]"
        aria-label="メインナビゲーション"
      >
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-4">
            {TABS.map((tab) => {
              const active = tab.match(pathname)
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`flex flex-col items-center justify-center py-2.5 transition relative ${
                    active ? "text-seal" : "text-ink/60 hover:text-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {/* アクティブ表示用の上端ライン */}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-seal rounded-full"
                    />
                  )}
                  <span className={`text-2xl transition ${active ? "scale-110" : ""}`}>
                    {tab.icon}
                  </span>
                  <span
                    className={`text-[10px] mt-0.5 ${active ? "font-bold" : "font-medium"}`}
                  >
                    {tab.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

export default BottomTabs
