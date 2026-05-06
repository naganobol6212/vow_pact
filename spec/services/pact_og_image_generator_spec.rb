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

      it "完了バッジは描画されない" do
        expect(svg).not_to include("成就")
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

      it "完了バッジ（成就）が含まれる" do
        expect(svg).to include("成就")
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
