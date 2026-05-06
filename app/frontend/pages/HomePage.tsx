import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { useAuth } from "../hooks/useAuth"
import { api, ApiError } from "../lib/api"
import type { User } from "../types/user"

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ゲスト作成 → 即時ログイン状態 → 新規契約フローへ
  const guestMutation = useMutation<User, ApiError, void>({
    mutationFn: () => api<User>("/auth/guest", { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      navigate("/pacts/new/step1")
    },
  })

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center mt-12">
        <h2 className="font-serif text-4xl font-bold text-seal mb-4">
          誓約 <span className="text-gold mx-2">⚔</span> 契約
        </h2>
        <p className="font-serif text-lg text-ink/70 mb-2">Vow Pact</p>
        <p className="text-ink/80 mb-10">
          目標と試練を誓いに変え、達成すれば紋章を得る。
          <br />
          自分との契約を、形にする場。
        </p>

        {isLoading ? (
          <p className="text-ink/60">門を開いている…</p>
        ) : isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate("/pacts/new/step1")}>
              新たな誓約を結ぶ
            </Button>
            <Button variant="ghost" onClick={() => navigate("/pacts")}>
              書庫を見る
            </Button>
            <Button variant="ghost" onClick={() => navigate("/crests")}>
              殿堂を見る
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={() => navigate("/login")}>
                ログイン
              </Button>
              <Button variant="ghost" onClick={() => navigate("/signup")}>
                新規登録
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
              <span className="flex-1 border-t border-ink/20" />
              <span className="text-xs text-ink/50">または</span>
              <span className="flex-1 border-t border-ink/20" />
            </div>
            <Button
              variant="secondary"
              onClick={() => guestMutation.mutate()}
              disabled={guestMutation.isPending}
            >
              {guestMutation.isPending ? "支度中..." : "登録せずに試してみる"}
            </Button>
            {guestMutation.isError && (
              <p className="text-xs text-seal mt-2">
                ゲストの開始に失敗しました。再度お試しください。
              </p>
            )}
            <p className="text-xs text-ink/50 max-w-md">
              30 日間お試しでご利用いただけます。気に入ったら設定画面から正式登録できます。
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default HomePage
