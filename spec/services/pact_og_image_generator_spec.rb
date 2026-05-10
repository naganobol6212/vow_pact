require "rails_helper"

RSpec.describe PactOgImageGenerator, type: :service do
  let(:user) { create(:user, nickname: "テスト誓約者") }
  let(:base_attrs) do
    { goal: "毎朝鏡の自分に「今日もえらい」を1回言う",
      constraint_text: "寝る30分前からスマホ見ない",
      deadline: Date.parse("2026-05-31"),
      difficulty: 2 }
  end

  def build_pact(**overrides)
    p = build(:pact, **base_attrs, user: user, **overrides)
    p.save!(validate: false)
    p
  end

  describe "#to_svg" do
    context "active な契約（未達成）" do
      let(:pact) { build_pact(status: :active) }
      subject(:svg) { described_class.new(pact).to_svg }

      it "ヘッドラインが「誓いは刻まれた」になる" do
        expect(svg).to include("誓いは刻まれた")
        expect(svg).not_to include("成就せり")
      end

      it "サブタイトルが SignedPage と同じ文言になる" do
        expect(svg).to include("本書に記された誓いは、あなた自身との不動の契約となる。")
      end

      it "契約書本文（目標 / 制約 / 期日）を描画する" do
        expect(svg).to include("毎朝鏡の自分に")
        expect(svg).to include("寝る30分前からスマホ見ない")
        expect(svg).to include("2026-05-31")
      end

      it "難易度を ⚔ + n/5 で表示する" do
        expect(svg).to include("⚔")
        expect(svg).to include("2 / 5")
      end

      it "active 状態では「成就せり」（達成ヘッドライン）は描画されない" do
        expect(svg).not_to include("成就せり")
      end

      it "HeraldicCrest（盾形紋章 + 中央の「誓」字）が描画される" do
        # 盾の path は HeraldicCrest 共通の値
        expect(svg).to include("M70 14 L108 22")
        # 中央バンドの「誓」字（紋章中央）
        expect(svg).to include(">誓<")
      end

      it "Design 準拠の二重金枠と 4 隅装飾が含まれる" do
        expect(svg).to include('stroke-width="2.5"')
        expect(svg).to include('stroke-opacity="0.55"')
        expect(svg).to include("M0 0 L60 0 M0 0 L0 60")
      end

      it "ブランド帯と SIGN · ENDURE · BE CROWNED フッターが含まれる" do
        expect(svg).to include("VOW PACT · MMXXVI")
        expect(svg).to include("SIGN · ENDURE · BE CROWNED")
        expect(svg).to include("vowpact.app")
      end
    end

    context "completed な契約（達成済み）" do
      let(:pact) { build_pact(status: :completed, completed_at: Time.current) }
      subject(:svg) { described_class.new(pact).to_svg }

      it "ヘッドラインが「成就せり」になる" do
        expect(svg).to include("成就せり")
        expect(svg).not_to include("誓いは刻まれた")
      end

      it "サブタイトルが達成版になる" do
        expect(svg).to include("あなたの誓いは見事に達成された。紋章が授けられる。")
      end

      it "達成済み crest があれば rarity 別の紋章色が出る" do
        # crest を持たせて legendary 色（金）を確認
        crest = build(:crest, pact: pact, rarity: :legendary)
        crest.save!(validate: false)
        pact.reload
        legendary_svg = described_class.new(pact).to_svg
        # legendary palette の primary 色（#a77b1f）が SVG に含まれる
        expect(legendary_svg).to include("#a77b1f")
      end
    end

    context "title が設定されている場合" do
      let(:pact) { build_pact(title: "沈黙の試練を背負いし者") }
      subject(:svg) { described_class.new(pact).to_svg }

      it "TITLE GRANTED ラベルと称号本文を描画する" do
        expect(svg).to include("TITLE GRANTED")
        expect(svg).to include("沈黙の試練を背負いし者")
      end

      it "title 内の特殊文字（&, <, >）はエスケープされる" do
        pact.title = "AI &amp; Sword <hero>"
        pact.save!(validate: false)
        out = described_class.new(pact).to_svg
        expect(out).to include("AI &amp;amp; Sword &lt;hero&gt;")
      end
    end

    context "title が未設定の場合" do
      let(:pact) { build_pact(title: nil) }
      subject(:svg) { described_class.new(pact).to_svg }

      it "TITLE GRANTED ラベルは描画されない" do
        expect(svg).not_to include("TITLE GRANTED")
      end
    end
  end

  describe "#to_png" do
    let(:pact) { build_pact(status: :active) }

    it "rsvg-convert / convert が使える環境では PNG バイナリを返す（テスト環境はフォールバック PNG）" do
      png = described_class.new(pact).to_png
      expect(png).to be_a(String)
      expect(png.bytesize).to be > 0
      # PNG マジックバイト
      expect(png.byteslice(0, 8).bytes).to eq([ 137, 80, 78, 71, 13, 10, 26, 10 ])
    end
  end
end
