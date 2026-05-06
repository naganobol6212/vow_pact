require "rails_helper"

RSpec.describe Crest, type: :model do
  let(:user) { create(:user) }

  # completed pact をテスト用に作るヘルパー（deadline_must_be_in_the_future を回避）
  def build_completed_pact(signed_at: 10.days.ago, deadline: 1.day.ago.to_date)
    pact = build(:pact, user: user, signed_at: signed_at, deadline: deadline,
                         status: :completed, completed_at: 1.hour.ago)
    pact.save!(validate: false)
    pact
  end

  describe "associations" do
    it "belongs_to :pact" do
      assoc = described_class.reflect_on_association(:pact)
      expect(assoc.macro).to eq(:belongs_to)
    end
  end

  describe "enum rarity" do
    it "common / rare / epic / legendary を持つ" do
      expect(described_class.rarities).to eq(
        "common" => 0,
        "rare" => 1,
        "epic" => 2,
        "legendary" => 3
      )
    end
  end

  describe "validations" do
    let(:pact) { build_completed_pact }

    it "正しい属性なら valid" do
      crest = build(:crest, pact: pact)
      expect(crest).to be_valid
    end

    it "rarity は必須" do
      crest = build(:crest, pact: pact, rarity: nil)
      expect(crest).not_to be_valid
    end

    it "generated_at は必須" do
      crest = build(:crest, pact: pact, generated_at: nil)
      expect(crest).not_to be_valid
      expect(crest.errors[:generated_at]).to be_present
    end

    it "crest_data に必須キーが揃っていれば valid" do
      crest = build(:crest, pact: pact, crest_data: {
        "base_shape" => "shield_round",
        "central_motif" => "sword",
        "decoration" => "wings",
        "color_palette" => "crimson_gold",
        "shimmer_level" => 2
      })
      expect(crest).to be_valid
    end

    it "crest_data に必須キーが欠けていると invalid" do
      crest = build(:crest, pact: pact, crest_data: { "base_shape" => "shield_round" })
      expect(crest).not_to be_valid
      expect(crest.errors[:crest_data]).to be_present
    end

    it "対応する Pact が completed でないと invalid" do
      active_pact = create(:pact, user: user, status: :active)
      crest = build(:crest, pact: active_pact)
      expect(crest).not_to be_valid
      expect(crest.errors[:pact]).to be_present
    end

    it "1 契約 1 紋章（同 pact_id で 2 件目はDB UNIQUE で弾かれる）" do
      pact = build_completed_pact
      create(:crest, pact: pact)
      duplicate = build(:crest, pact: pact)
      expect(duplicate).not_to be_valid
    end
  end

  describe "Pact からのアソシエーション（has_one）" do
    it "Pact#crest で取得できる" do
      pact = build_completed_pact
      crest = create(:crest, pact: pact)
      expect(pact.reload.crest).to eq(crest)
    end

    it "Pact が destroy されたら関連 crest も destroy される" do
      pact = build_completed_pact
      create(:crest, pact: pact)
      expect { pact.destroy! }.to change(described_class, :count).by(-1)
    end
  end
end
