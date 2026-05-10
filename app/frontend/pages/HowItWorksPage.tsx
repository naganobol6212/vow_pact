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
      "「TODO」より重い「契約」として、目標だけでなく制約（やらないこと）もセットで誓います。\nAI は王道案・ひねり案・斬新案の 3 タイプを提案。さらに「学習 / 健康 / 創造 / 社交 / 内省 / 仕事 / 生活」からジャンルを選ぶと、その方向に寄った提案が出ます。\n難易度の判定も AI に任せられます。目標の具体性、制約の厳しさ、期日までの長さを総合して 1〜5 のレベルが付き、納得いかなければスライダーで自分で調整も可能です。",
  },
  {
    step: 2,
    icon: "📅",
    title: "毎日チェックイン",
    description:
      "守れた / 破れた / 休戦の 3 択で記録。GitHub 風の草式グリッドで日々の足跡が見える。",
    detail:
      "1 日 1 回、その日の実行状況を記録します。\n- ⚔ 守れた：連続記録が伸びる\n- ✗ 破れた：連続が途切れる\n- — 休戦：途切れず、伸びもしない\n\n契約詳細ページの「足跡」セクションでは、契約期間の各日がマス目で並び、タップするとその日の日付と状態を確認できます。",
  },
  {
    step: 3,
    icon: "🏆",
    title: "達成すれば紋章 + 称号を授かる",
    description:
      "期間中の遵守率が半分を超えれば達成。レアリティ付きの紋章と中世風の称号が付与される。",
    detail:
      "難易度 × 守れた割合 × 期間 を組み合わせた総合スコアで、4 段階のレアリティが決まります。\n- 通常（コモン）/ 稀少（レア）/ 英雄（エピック）/ 伝説（レジェンダリー）\nさらに AI が達成内容に応じた称号（例：沈黙の試練を背負いし者）を自動で授けます。\n\n集めた紋章はホーム画面でいつでも眺められ、4 階位それぞれの意味も「授かりうる紋章」セクションで確認できます。",
  },
]

const FAQ = [
  {
    q: "「TODO リスト」と何が違うんですか？",
    a: "TODO は「やること」だけ。Vow Pact は「やること」+「やらないこと（制約）」+「期日」をセットで誓うので、本気度が変わります。達成すると紋章と称号でコレクションも増えます。",
  },
  {
    q: "登録しないと使えませんか？",
    a: "登録しなくても 30 日間お試しで使えます（ゲストモード）。気に入ったら設定画面から正式登録すると、これまでの誓約・チェックイン・紋章がそのまま引き継がれます。",
  },
  {
    q: "1 日にチェックインを忘れたら？",
    a: "あとから記録できます。同じ日に再度チェックインすれば、新しい記録に上書きされます。また体調が悪い日や事情がある日は「休戦」を選ぶと、連続記録が途切れずに済みます（伸びもしませんが、そこでリセットされません）。",
  },
  {
    q: "達成判定の基準は？",
    a: "期日が来た時点で、契約期間中に「守れた」日が半分（50%）を超えていれば達成扱いになります。途中で「破れた」日があっても、合計で半分以上守れていれば OK です（寛容モード）。一度達成と認められた契約は、後から記録を訂正しても達成のままで残ります。",
  },
  {
    q: "進行中の契約はいくつまで作れますか？",
    a: "同時に進められるのは最大 7 件です。曜日ごとに別の誓いを組めるよう余裕を持たせつつ、増やしすぎて誓いの重みが薄れない数として 7 を採用しています。",
  },
  {
    q: "結んだ契約は後から編集できますか？",
    a: "目標と制約の文言は契約詳細画面からいつでも編集できます。ただし、期日 / 難易度 / 締結日は契約を結んだ時点で固定される設計です（誓いの重みを保つため）。大幅にやり直したいときは「破棄」を選んで、新しく結び直してください。",
  },
  {
    q: "他のユーザーの誓約を覗けますか？",
    a: "画面下の「広場」タブから、公開設定にされている誓約を新着順に見られます。気になるカードをタップすれば、詳しい内容も読めます。自分の誓約を「公開」にすれば同じように他の人に見てもらえます。",
  },
  {
    q: "公開したくない場合は？",
    a: "結んだ契約は最初は非公開です。契約詳細画面のスイッチで、契約ごとに公開 / 非公開を切り替えられます。X（旧 Twitter）でシェアした場合は自動的に公開設定になりますが、後から非公開に戻すこともできます。ランキングへの参加も設定画面から個別に選べます。",
  },
]

const FEATURES = [
  { emoji: "✦", title: "AI 提案", text: "目標 / 制約 / 難易度 / 称号を AI がサポート（ジャンル指定可）" },
  { emoji: "📅", title: "チェックイン", text: "1 日 1 回、3 択（守れた / 破れた / 休戦）で記録" },
  { emoji: "🌱", title: "進捗草式", text: "GitHub 風 7×N グリッドで日々の足跡を可視化" },
  { emoji: "🔥", title: "連続記録", text: "現在の streak と最長 streak を表示" },
  { emoji: "🏆", title: "紋章 + 称号", text: "達成すると 4 段階の紋章と中世風の称号を授与" },
  { emoji: "🌳", title: "誓約の広場", text: "他のユーザーの公開契約を新着順に閲覧" },
  { emoji: "🏅", title: "ランキング", text: "公開ユーザー同士で連続日数 / 達成数を競う" },
  { emoji: "𝕏", title: "𝕏 シェア", text: "契約締結時に X 投稿画面を開く（自動公開化）" },
  { emoji: "🎲", title: "ゲストモード", text: "登録なしで 30 日間お試し（後から本登録に引継ぎ）" },
]

function HowItWorksPage() {
  const { isAuthenticated } = useAuth()

  return (
    <Layout title="使い方">
      {/* ヒーロー */}
      <section className="text-center mb-12">
        <p
          className="font-display font-semibold mb-2"
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            color: "var(--color-gold-deep)",
            paddingLeft: "0.55em",
          }}
          aria-hidden="true"
        >
          ── HOW IT WORKS ──
        </p>
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
            className="relative p-6 sm:p-8 bg-parchment-card border border-gold/40 rounded-xl shadow-md"
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
                <p className="text-xs text-ink/70 whitespace-pre-line leading-relaxed">
                  {s.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 機能一覧 */}
      <section className="max-w-4xl mx-auto mb-16">
        <h3 className="font-serif text-2xl text-center text-seal mb-2">主な機能</h3>
        <p className="text-center text-sm text-ink/60 mb-8">
          自分との契約をリッチに記録するための機能を揃えています
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-4 bg-parchment-card border border-gold/30 rounded-xl hover:border-seal hover:shadow-md hover:-translate-y-0.5 transition"
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
              className="group p-4 bg-parchment-card border border-gold/30 rounded-xl hover:border-seal transition"
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
