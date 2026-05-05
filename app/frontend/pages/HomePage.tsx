import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { useAuth } from "../hooks/useAuth"

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()

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
          <Link to="/pacts/new/step1">
            <Button variant="primary">新たな誓約を結ぶ</Button>
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="primary">ログイン</Button>
            </Link>
            <Link to="/signup">
              <Button variant="ghost">新規登録</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default HomePage
