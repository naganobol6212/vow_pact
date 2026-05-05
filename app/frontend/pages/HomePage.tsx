import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { useAuth } from "../hooks/useAuth"

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

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
          <Button variant="primary" onClick={() => navigate("/pacts/new/step1")}>
            新たな誓約を結ぶ
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={() => navigate("/login")}>
              ログイン
            </Button>
            <Button variant="ghost" onClick={() => navigate("/signup")}>
              新規登録
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default HomePage
