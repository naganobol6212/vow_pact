import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useAuth } from "../hooks/useAuth"
import { api } from "../lib/api"
import Footer from "./Footer"
import BottomTabs from "./BottomTabs"

type LayoutProps = {
  children: ReactNode
  title?: string
  showHeader?: boolean
  showFooter?: boolean
}

function Layout({ children, title, showHeader = true, showFooter = true }: LayoutProps) {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      await api<void>("/auth/logout", { method: "DELETE" })
    } catch {
      // エラーでもクライアント側のキャッシュは破棄する
    }
    // 古いキャッシュを完全にリセット（invalidate だけだと再取得で復活する）
    queryClient.setQueryData(["currentUser"], null)
    queryClient.removeQueries({ queryKey: ["currentUser"] })
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-parchment-bg text-ink font-sans flex flex-col">
      {showHeader && (
        <header className="border-b border-gold/30 bg-parchment-bg/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              to="/"
              className="font-serif text-xl sm:text-2xl font-bold text-seal hover:opacity-80 transition"
            >
              誓約 <span className="text-gold mx-1">⚔</span> 契約
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              {title && <h1 className="font-serif text-lg text-ink/80 hidden md:block">{title}</h1>}

              {isAuthenticated ? (
                <>
                  {/* ヘッダーには BottomTabs に入らない補助メニューだけ置く */}
                  <nav className="flex items-center gap-3 text-sm">
                    {!user?.is_guest && (
                      <Link
                        to="/rankings"
                        className="text-ink/70 hover:text-seal transition"
                        title="ランキング"
                      >
                        🏅<span className="hidden sm:inline ml-1">ランキング</span>
                      </Link>
                    )}
                    <Link
                      to="/how-it-works"
                      className="text-ink/70 hover:text-seal transition"
                      title="使い方"
                    >
                      ❓<span className="hidden sm:inline ml-1">使い方</span>
                    </Link>
                  </nav>
                  <div className="flex items-center gap-2 border-l border-gold/30 pl-3">
                    <span className="text-sm text-ink/70 hidden sm:inline">
                      {user?.nickname}
                      {user?.is_guest && (
                        <span className="ml-1 text-xs px-1 py-0.5 bg-gold/20 text-ink/60 rounded-sm">
                          ゲスト
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-xs text-ink/60 hover:text-seal transition underline-offset-2 hover:underline"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              ) : (
                /* 未ログイン時のヘッダー右側：使い方 + 認証 CTA */
                <nav className="flex items-center gap-3 text-sm">
                  <Link to="/how-it-works" className="text-ink/70 hover:text-seal transition">
                    使い方
                  </Link>
                  <Link
                    to="/login"
                    className="text-ink/70 hover:text-seal transition"
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3 py-1.5 bg-seal text-parchment rounded-lg text-xs font-bold shadow hover:shadow-md transition"
                  >
                    新規登録
                  </Link>
                </nav>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">{children}</main>

      {/* ログイン後はモバイルアプリ風の BottomTabs、未ログイン時は通常のリンクフッター */}
      {showFooter && (
        <>
          {isAuthenticated ? <BottomTabs /> : <Footer />}
        </>
      )}
    </div>
  )
}

export default Layout
