// TODO: Issue #15 の動作確認用の仮ページ。Issue #21 で実画面を実装する際に削除する。
import { Link } from "react-router-dom"

function AboutPage() {
  return (
    <div className="min-h-screen bg-parchment p-8 text-ink font-sans">
      <h1 className="text-4xl font-bold font-serif text-seal mb-4">About</h1>
      <p className="mb-4">これは Router 動作確認用の仮ページです。</p>
      <Link to="/" className="text-seal underline">
        ホームへ戻る
      </Link>
    </div>
  )
}

export default AboutPage
