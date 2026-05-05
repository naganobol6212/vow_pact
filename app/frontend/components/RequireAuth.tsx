import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

type RequireAuthProps = {
  children: ReactNode
}

// 認証必須ルートのガード。
// useAuth で /api/v1/auth/me の状態を確認し、未ログインなら /login にリダイレクト。
// 取得中はローディング表示で UX を整える。
function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment text-ink/60 font-serif">
        誓約の門を開いている…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default RequireAuth
