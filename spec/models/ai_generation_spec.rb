require "rails_helper"

RSpec.describe AiGeneration, type: :model do
  describe "associations" do
    it "belongs_to :user" do
      assoc = described_class.reflect_on_association(:user)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be_falsey
    end

    it "belongs_to :pact, optional" do
      assoc = described_class.reflect_on_association(:pact)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be true
    end
  end

  describe "enum generation_type" do
    it "目標案 / 制約案 / 難易度判定 / 称号生成 を持つ" do
      expect(described_class.generation_types).to eq(
        "goal_suggestion" => 0,
        "constraint_suggestion" => 1,
        "difficulty_judgment" => 2,
        "title_generation" => 3
      )
    end
  end

  describe "enum status" do
    it "success / failed / filtered を持つ" do
      expect(described_class.statuses).to eq(
        "success" => 0,
        "failed" => 1,
        "filtered" => 2
      )
    end
  end

  describe "validations" do
    let(:user) { create(:user) }

    it "正しい属性なら valid（pact なし = 目標案系）" do
      ai = build(:ai_generation, user: user)
      expect(ai).to be_valid
    end

    it "user は必須" do
      ai = build(:ai_generation, user: nil)
      expect(ai).not_to be_valid
      expect(ai.errors[:user]).to be_present
    end

    it "pact は省略可（目標案 / 制約案では契約未確定なので nil もありうる）" do
      ai = build(:ai_generation, user: user, pact: nil)
      expect(ai).to be_valid
    end

    it "pact が存在する場合は紐付けられる（難易度判定 / 称号生成）" do
      pact = create(:pact, user: user)
      ai = build(:ai_generation, user: user, pact: pact, generation_type: :difficulty_judgment)
      expect(ai).to be_valid
      expect(ai.pact_id).to eq(pact.id)
    end

    it "generation_type は必須" do
      ai = build(:ai_generation, user: user, generation_type: nil)
      expect(ai).not_to be_valid
    end

    it "model は必須" do
      ai = build(:ai_generation, user: user, model: nil)
      expect(ai).not_to be_valid
      expect(ai.errors[:model]).to be_present
    end

    it "status は必須" do
      ai = build(:ai_generation, user: user, status: nil)
      expect(ai).not_to be_valid
    end

    it "input_data / output_data は jsonb で保存される" do
      ai = create(:ai_generation, user: user,
        input_data: { theme: "学習", model: "gpt-5.4-nano" },
        output_data: { goals: %w[A B C] })
      ai.reload
      expect(ai.input_data["theme"]).to eq("学習")
      expect(ai.output_data["goals"]).to eq(%w[A B C])
    end

    it "tokens_used / latency_ms は省略可（API エラー時は記録できない）" do
      ai = build(:ai_generation, user: user, tokens_used: nil, latency_ms: nil)
      expect(ai).to be_valid
    end

    it "失敗時は error_message を伴う" do
      ai = build(:ai_generation, user: user, status: :failed, error_message: "rate limit exceeded")
      expect(ai).to be_valid
      expect(ai.error_message).to eq("rate limit exceeded")
    end
  end

  describe "scope と検索" do
    let(:user) { create(:user) }

    before do
      create(:ai_generation, user: user, generation_type: :goal_suggestion, created_at: 2.days.ago)
      create(:ai_generation, user: user, generation_type: :constraint_suggestion, created_at: 1.day.ago)
      create(:ai_generation, user: user, generation_type: :goal_suggestion, created_at: 1.hour.ago)
    end

    it "generation_type で絞り込めて、件数集計に使える" do
      expect(described_class.goal_suggestion.count).to eq(2)
      expect(described_class.constraint_suggestion.count).to eq(1)
    end

    it "ユーザーごとの履歴を created_at 降順で取得できる" do
      list = user.ai_generations.order(created_at: :desc)
      expect(list.first.created_at).to be > list.last.created_at
    end
  end

  describe "User / Pact からのアソシエーション" do
    let(:user) { create(:user) }

    it "User#ai_generations で取得できる" do
      ai = create(:ai_generation, user: user)
      expect(user.reload.ai_generations).to include(ai)
    end

    it "Pact が destroy されたら関連 ai_generations の pact_id は nullify される" do
      pact = create(:pact, user: user)
      ai = create(:ai_generation, user: user, pact: pact, generation_type: :difficulty_judgment)
      pact.destroy!
      expect(ai.reload.pact_id).to be_nil
    end

    it "User が destroy されたら関連 ai_generations も destroy される" do
      create(:ai_generation, user: user)
      expect { user.destroy! }.to change(described_class, :count).by(-1)
    end
  end
end
