import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="border-t border-gold/30 bg-parchment/60 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* ロゴ + キャッチ */}
          <div>
            <Link to="/" className="font-serif text-xl font-bold text-seal hover:opacity-80 transition">
              誓約 <span className="text-gold mx-1">⚔</span> 契約
            </Link>
            <p className="text-xs text-ink/60 mt-2 leading-relaxed">
              目標と制約を「誓い」として刻み、達成すれば紋章を得る。
              <br />
              自分との契約を、形にする場。
            </p>
          </div>

          {/* リンク：プロダクト */}
          <div>
            <h4 className="font-serif text-sm font-bold text-ink mb-3">プロダクト</h4>
            <ul className="space-y-2 text-xs text-ink/70">
              <li>
                <Link to="/how-it-works" className="hover:text-seal transition">
                  使い方
                </Link>
              </li>
              <li>
                <Link to="/pacts/new/step1" className="hover:text-seal transition">
                  新たな誓約を結ぶ
                </Link>
              </li>
              <li>
                <Link to="/crests" className="hover:text-seal transition">
                  紋章コレクション
                </Link>
              </li>
            </ul>
          </div>

          {/* リンク：その他 */}
          <div>
            <h4 className="font-serif text-sm font-bold text-ink mb-3">その他</h4>
            <ul className="space-y-2 text-xs text-ink/70">
              <li>
                <a
                  href="https://github.com/naganobol6212/vow_pact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-seal transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link to="/settings" className="hover:text-seal transition">
                  設定
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-4 text-center text-xs text-ink/50">
          <span className="font-serif">Vow Pact</span> ©︎ 2026 — Built with Rails + React
        </div>
      </div>
    </footer>
  )
}

export default Footer
