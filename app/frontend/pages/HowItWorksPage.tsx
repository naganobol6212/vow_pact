import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import { useAuth } from "../hooks/useAuth"

const STEPS = [
  {
    step: 1,
    icon: "✍️",
    title: "目標と制約を誓う",
    description:
      "達成したい目標と、自分に課す制約をセットで決める。AI に提案してもらうこともできる。",
    detail:
      "「TODO」より重い「契約」として、目標だけでなく制約（やらないこと）もセットで誓う。\nAI は王道案・ひねり案・斬新案の 3 タイプを提案するので、自分に合うものを選べる。",
  },
  {
    step: 2,
    icon: "📅",
    title: "毎日チェックイン",
    description:
      "守れた / 破れた / 休戦の 3 択で記録。連続記録が伸びていく。",
    detail:
      "1 日 1 回、その日の実行状況を記録する。\n- ⚔ 守れた（kept）：連続記録が伸びる\n- ✗ 破れた（broken）：連続が途切れる\n- — 休戦（skipped）：途切れず、伸びもしない",
  },
  {
    step: 3,
    icon: "🏆",
    title: "達成すれば紋章を得る",
    description:
      "期間中の遵守率が半分を超えれば達成。レアリティ付きの紋章が授与される。",
    detail:
      "難易度 × 遵守率 × 期間で総合スコアを計算し、4 段階のレアリティで紋章が決まる。\n- common（通常）/ rare（稀少）/ epic（英雄）/ legendary（伝説）\n- 集めた紋章は紋章コレクションでいつでも眺められる。",
  },
]

const FAQ = [
  {
    q: "「TODO リスト」と何が違うんですか？",
    a: "TODO は「やること」だけ。Vow Pact は「やること」+「やらないこと（制約）」+「期日」をセットで誓うので、本気度が変わります。達成すると紋章でコレクションも増えます。",
  },
  {
    q: "登録しないと使えませんか？",
    a: "登録しなくても 30 日間お試しで使えます（ゲストモード）。気に入ったら設定画面から正式登録すると、これまでの誓約・チェックイン・紋章がそのまま引き継がれます。",
  },
  {
    q: "1 日にチェックインを忘れたら？",
    a: "後から訂正できます。同じ日に 2 回 POST すると最新の状態で上書きされます。なお「休戦」を選ぶと連続記録は切れず伸びもしないので、休む日があってもリセットされません。",
  },
  {
    q: "達成判定の基準は？",
    a: "期日まで来て、契約期間中の遵守率（kept した日数 / 期間日数）が 50% 以上なら達成扱い。一度達成したら不可逆で、後から訂正しても達成は奪われません。",
  },
  {
    q: "公開で晒したくない場合は？",
    a: "デフォルトで非公開です。ランキングに参加したい場合だけ設定で公開できます。契約自体も個別に公開/非公開を切り替えられます。",
  },
]

const FEATURES = [
  { emoji: "✦", title: "AI 提案", text: "目標・制約・難易度判定を AI がサポート" },
  { emoji: "📅", title: "チェックイン", text: "1 日 1 回、3 択で記録" },
  { emoji: "🔥", title: "連続記録", text: "kept を続けて streak を伸ばす" },
  { emoji: "🏆", title: "紋章授与", text: "達成すると 4 段階の紋章が授与" },
  { emoji: "📜", title: "紋章コレクション", text: "達成した紋章を rarity 別に閲覧" },
  { emoji: "🏅", title: "ランキング", text: "公開ユーザー同士で連続日数 / 達成数を競う" },
  { emoji: "𝕏", title: "𝕏 シェア", text: "契約締結時に X 投稿画面を開く" },
  { emoji: "🎲", title: "ゲストモード", text: "登録なしで 30 日間お試し" },
  { emoji: "⚙", title: "プロフィール", text: "アバター・公開設定など" },
]

function HowItWorksPage() {
  const { isAuthenticated } = useAuth()

  return (
    <Layout title="使い方">
      {/* ヒーロー */}
      <section className="text-center mb-12">
        <h2 className="font-serif text-3xl sm:text-4xl text-seal mb-3">使い方</h2>
        <p className="text-base text-ink/70 max-w-xl mx-auto">
          Vow Pact は「自分との契約」を形にして、達成体験をゲーム性で残すアプリです。
          <br className="hidden sm:block" />
          3 ステップで始められます。
        </p>
      </section>

      {/* 3 ステップ詳細 */}
      <section className="max-w-4xl mx-auto mb-16 space-y-8">
        {STEPS.map((s) => (
          <div
            key={s.step}
            className="relative p-6 sm:p-8 bg-parchment border border-gold/40 rounded-xl shadow-md"
          >
            <div className="absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center rounded-full bg-seal text-parchment font-serif font-bold text-xl shadow-md">
              {s.step}
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="text-5xl shrink-0 text-center sm:text-left w-full sm:w-auto">
                {s.icon}
              </div>
              <div>
                <h3 className="font-serif text-xl text-seal mb-2">{s.title}</h3>
                <p className="text-sm text-ink mb-3">{s.description}</p>
                <p className="text-xs text-ink/70 whitespace-pre-line leading-relaxed">{s.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 機能一覧 */}
      <section className="max-w-4xl mx-auto mb-16">
        <h3 className="font-serif text-2xl text-center text-seal mb-2">主な機能</h3>
        <p className="text-center text-sm text-ink/60 mb-8">MVP に必要な機能を一通り揃えています</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-4 bg-parchment/60 border border-gold/30 rounded-xl hover:border-seal hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <h4 className="font-bold text-seal text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-ink/70 leading-relaxed">{f.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto mb-16">
        <h3 className="font-serif text-2xl text-center text-seal mb-2">よくある質問</h3>
        <p className="text-center text-sm text-ink/60 mb-8">気になることは大体ここに</p>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <details
              key={i}
              className="group p-4 bg-parchment/60 border border-gold/30 rounded-xl hover:border-seal transition"
            >
              <summary className="cursor-pointer font-bold text-ink list-none flex items-center justify-between">
                <span className="flex-1 text-sm sm:text-base">{f.q}</span>
                <span className="text-seal text-xl ml-2 group-open:rotate-45 transition shrink-0">
                  +
                </span>
              </summary>
              <p className="text-sm text-ink/70 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto text-center">
        {isAuthenticated ? (
          <Link to="/pacts/new/step1">
            <Button variant="primary">新たな誓約を結ぶ</Button>
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button variant="primary">新規登録して始める</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost">ログイン</Button>
            </Link>
          </div>
        )}
      </section>
    </Layout>
  )
}

export default HowItWorksPage
