import { Link } from "react-router-dom"

function HomePage() {
  return (
    <div>
      <h1>誓約 ⚔ 契約</h1>
      <p>Vow Pactへようこそ</p>
      <nav>
        <Link to="/about">Aboutページへ</Link>
      </nav>
    </div>
  )
}

export default HomePage
