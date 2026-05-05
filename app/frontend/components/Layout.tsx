import { Link, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useAuth } from "../hooks/useAuth"
import { api } from "../lib/api"

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
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-parchment text-ink font-sans flex flex-col">
      {showHeader && (
        <header className="border-b border-gold/30 bg-parchment/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="font-serif text-2xl font-bold text-seal hover:opacity-80 transition"
            >
              誓約 <span className="text-gold mx-1">⚔</span> 契約
            </Link>
            <div className="flex items-center gap-4">
              {title && <h1 className="font-serif text-lg text-ink/80 hidden sm:block">{title}</h1>}
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink/70 hidden sm:inline">{user?.nickname}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-sm text-ink/60 hover:text-seal transition underline-offset-2 hover:underline"
                  >
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {showFooter && (
        <footer className="border-t border-gold/30 bg-parchment/50 mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-ink/60">
            <span className="font-serif">Vow Pact</span> ©︎ 2026
          </div>
        </footer>
      )}
    </div>
  )
}

export default Layout
