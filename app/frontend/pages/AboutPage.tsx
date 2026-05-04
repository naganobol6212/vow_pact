// TODO: Issue #15 の動作確認用の仮ページ。Issue #21 で実画面を実装する際に削除する。
import { Link } from "react-router-dom"

function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>これはRouter動作確認の仮ページです.</p>
      <Link to="/">ホームへ戻る</Link>
    </div>
  )
}

export default AboutPage
