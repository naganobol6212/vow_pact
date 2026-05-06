require "rails_helper"

RSpec.describe CrestGenerator, type: :service do
  let(:user) { create(:user) }

  def build_completed_pact(signed_at:, deadline:, difficulty: 3)
    pact = build(:pact, user: user, signed_at: signed_at, deadline: deadline,
                         difficulty: difficulty, status: :completed, completed_at: 1.hour.ago)
    pact.save!(validate: false)
    pact
  end

  def add_kept(pact:, on:)
    pact.check_ins.new(checked_on: on, status: :kept).save!(validate: false)
  end

  describe "#call" do
    context "completed でない pact" do
      it "Crest を作らない（戻り値 nil）" do
        active_pact = create(:pact, user: user)
        result = described_class.new(active_pact).call
        expect(result).to be_nil
        expect(active_pact.reload.crest).to be_nil
      end
    end

    context "既に Crest が存在する pact" do
      it "再度 call しても新規作成しない（既存を返す）" do
        pact = build_completed_pact(signed_at: 30.days.ago, deadline: 1.day.ago.to_date)
        existing = create(:crest, pact: pact, rarity: :rare)

        result = described_class.new(pact).call
        expect(result).to eq(existing)
        expect(Crest.where(pact_id: pact.id).count).to eq(1)
      end
    end

    context "completed pact に Crest を新規生成" do
      it "Crest が作成され、必須キーを含む crest_data が入る" do
        pact = build_completed_pact(signed_at: 30.days.ago, deadline: 1.day.ago.to_date, difficulty: 3)
        20.times { |i| add_kept(pact: pact, on: 30.days.ago.to_date + i) }

        crest = described_class.new(pact).call
        expect(crest).to be_persisted
        expect(crest.pact).to eq(pact)
        expect(crest.generated_at).to be_within(5.seconds).of(Time.current)
        %w[base_shape central_motif decoration color_palette shimmer_level].each do |key|
          expect(crest.crest_data).to have_key(key)
        end
      end
    end

    describe "レアリティ計算（difficulty × compliance_rate × period_score）" do
      # period_score = (期間日数 / 30.0).clamp(0.5, 6.0)
      # compliance_rate = kept_days / 期間日数

      it "簡単（difficulty=1）+ 短期間 + 低 compliance なら common" do
        # 5 日契約、1 日 kept = 20% / difficulty=1 / period_score=0.5
        # score = 1 * 0.2 * 0.5 = 0.1 → common
        pact = build_completed_pact(signed_at: 4.days.ago, deadline: Time.zone.today, difficulty: 1)
        add_kept(pact: pact, on: 1.day.ago.to_date)

        crest = described_class.new(pact).call
        expect(crest.rarity).to eq("common")
      end

      it "中程度（difficulty=3）+ 30 日 + 60% compliance なら rare" do
        # 30 日中 18 日 kept = 60% / difficulty=3 / period_score=1.0
        # score = 3 * 0.6 * 1.0 = 1.8 → rare（1.0..2.5）
        pact = build_completed_pact(signed_at: 29.days.ago, deadline: Time.zone.today, difficulty: 3)
        18.times { |i| add_kept(pact: pact, on: 29.days.ago.to_date + i) }

        crest = described_class.new(pact).call
        expect(crest.rarity).to eq("rare")
      end

      it "高難度（difficulty=5）+ 60 日 + 80% compliance なら epic" do
        # 60 日中 48 日 kept = 80% / difficulty=5 / period_score=2.0
        # score = 5 * 0.8 * 2.0 = 8.0 → legendary（4.0 超）
        # → 異なる組み合わせで epic を狙う
        # difficulty=4, 30 日中 25 kept (83%), period_score=1.0
        # score = 4 * 0.83 * 1.0 ≈ 3.33 → epic
        pact = build_completed_pact(signed_at: 29.days.ago, deadline: Time.zone.today, difficulty: 4)
        25.times { |i| add_kept(pact: pact, on: 29.days.ago.to_date + i) }

        crest = described_class.new(pact).call
        expect(crest.rarity).to eq("epic")
      end

      it "最高（difficulty=5）+ 長期間 + 高 compliance なら legendary" do
        # 90 日中 80 日 kept ≈ 89% / difficulty=5 / period_score=3.0
        # score = 5 * 0.89 * 3.0 ≈ 13.3 → legendary
        pact = build_completed_pact(signed_at: 89.days.ago, deadline: Time.zone.today, difficulty: 5)
        80.times { |i| add_kept(pact: pact, on: 89.days.ago.to_date + i) }

        crest = described_class.new(pact).call
        expect(crest.rarity).to eq("legendary")
      end

      it "極端に長期間でも period_score は 6.0 でクランプされる" do
        # 1000 日契約でも period_score は 6.0 が上限
        # difficulty=1, compliance=10%（少なめ）, period_score=6.0
        # score = 1 * 0.1 * 6.0 = 0.6 → common
        # クランプが効いていることを確認するため、極端な期間でも legendary にならないことを保証
        pact = build_completed_pact(signed_at: 1000.days.ago, deadline: 1.day.ago.to_date, difficulty: 1)
        100.times { |i| add_kept(pact: pact, on: 1000.days.ago.to_date + i) }
        # compliance_rate = 100/1001 ≈ 0.1
        # score = 1 * 0.1 * 6.0 = 0.6 → common（クランプなしだと period_score≈33 → 異常値）

        crest = described_class.new(pact).call
        expect(crest.rarity).to eq("common")
      end
    end

    describe "crest_data のパーツ抽選" do
      it "shimmer_level は rarity に応じて決まる（legendary が最も高い）" do
        legendary_pact = build_completed_pact(signed_at: 89.days.ago, deadline: Time.zone.today, difficulty: 5)
        80.times { |i| add_kept(pact: legendary_pact, on: 89.days.ago.to_date + i) }

        common_pact = build_completed_pact(signed_at: 4.days.ago, deadline: Time.zone.today, difficulty: 1)
        add_kept(pact: common_pact, on: 1.day.ago.to_date)

        legendary_crest = described_class.new(legendary_pact).call
        common_crest = described_class.new(common_pact).call

        expect(legendary_crest.crest_data["shimmer_level"]).to be > common_crest.crest_data["shimmer_level"]
      end
    end
  end
end
