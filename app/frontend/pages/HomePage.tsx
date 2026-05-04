import { Link } from "react-router-dom"

function HomePage() {
  return (
    <div className="min-h-screen bg-parchment p-8 text-ink font-sans">
      <h1 className="text-4xl font-bold font-serif text-seal mb-4">誓約 ⚔ 契約</h1>
      <p className="mb-4">Vow Pact へようこそ</p>
      <nav>
        <Link to="/about" className="text-seal underline">
          Aboutページへ
        </Link>
      </nav>
    </div>
  )
}

export default HomePage
