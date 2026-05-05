require "rails_helper"

RSpec.describe Pact, type: :model do
  describe "factory" do
    it "valid な pact を生成できる" do
      pact = build(:pact)
      expect(pact).to be_valid
    end
  end

  describe "associations" do
    it "user に belongs_to" do
      user = create(:user)
      pact = create(:pact, user: user)
      expect(pact.user).to eq(user)
    end

    it "User から has_many :pacts でアクセスできる" do
      user = create(:user)
      pact = create(:pact, user: user)
      expect(user.pacts).to include(pact)
    end

    it "User 削除で紐づく pact も destroy される" do
      user = create(:user)
      create(:pact, user: user)
      expect { user.destroy }.to change { Pact.count }.by(-1)
    end
  end

  describe "enum status" do
    it "active / completed / failed / abandoned を持つ" do
      expect(Pact.statuses.keys).to contain_exactly("active", "completed", "failed", "abandoned")
    end

    it "デフォルトは active" do
      pact = create(:pact)
      expect(pact.status).to eq("active")
    end
  end

  describe "validations" do
    describe "goal" do
      it "必須" do
        pact = build(:pact, goal: nil)
        expect(pact).not_to be_valid
        expect(pact.errors[:goal]).to include("can't be blank")
      end

      it "1〜500文字" do
        expect(build(:pact, goal: "a")).to be_valid
        expect(build(:pact, goal: "a" * 500)).to be_valid
        expect(build(:pact, goal: "a" * 501)).not_to be_valid
      end

      it "前後空白を除去" do
        pact = create(:pact, goal: "  目標を立てる  ")
        expect(pact.reload.goal).to eq("目標を立てる")
      end
    end

    describe "constraint_text" do
      it "必須" do
        pact = build(:pact, constraint_text: nil)
        expect(pact).not_to be_valid
        expect(pact.errors[:constraint_text]).to include("can't be blank")
      end

      it "1〜500文字" do
        expect(build(:pact, constraint_text: "a" * 500)).to be_valid
        expect(build(:pact, constraint_text: "a" * 501)).not_to be_valid
      end
    end

    describe "difficulty" do
      it "必須" do
        pact = build(:pact, difficulty: nil)
        expect(pact).not_to be_valid
        expect(pact.errors[:difficulty]).to include("can't be blank")
      end

      it "1〜5の整数" do
        expect(build(:pact, difficulty: 1)).to be_valid
        expect(build(:pact, difficulty: 5)).to be_valid
        expect(build(:pact, difficulty: 0)).not_to be_valid
        expect(build(:pact, difficulty: 6)).not_to be_valid
      end
    end

    describe "deadline" do
      it "必須" do
        pact = build(:pact, deadline: nil)
        expect(pact).not_to be_valid
        expect(pact.errors[:deadline]).to include("can't be blank")
      end

      it "未来の日付（新規作成時のみ検証）" do
        expect(build(:pact, deadline: 1.day.from_now.to_date)).to be_valid
        # 過去日は弾く
        past_pact = build(:pact, deadline: 1.day.ago.to_date)
        expect(past_pact).not_to be_valid
        expect(past_pact.errors[:deadline]).to include("must be in the future")
        # 既存 pact は更新時に過去日でも valid（期日切れは状態として許容）
        existing = create(:pact, deadline: 1.day.from_now.to_date)
        existing.update(goal: "新しい目標")
        existing.deadline = 1.day.ago.to_date
        expect(existing.valid?).to be true
      end
    end

    describe "active 契約の上限（最大7つ）" do
      let(:user) { create(:user) }

      it "7つまでは active 契約を作れる" do
        7.times { create(:pact, user: user, status: :active) }
        expect(user.pacts.where(status: :active).count).to eq(7)
      end

      it "8つ目の active 契約は弾かれる" do
        7.times { create(:pact, user: user, status: :active) }
        eighth = build(:pact, user: user, status: :active)
        expect(eighth).not_to be_valid
        expect(eighth.errors[:base]).to include("active な契約は7つまでです")
      end

      it "completed / abandoned はカウントしない（8つ目作成可能）" do
        6.times { create(:pact, user: user, status: :active) }
        create(:pact, user: user, status: :completed, completed_at: Time.current)
        create(:pact, user: user, status: :abandoned)

        new_active = build(:pact, user: user, status: :active)
        expect(new_active).to be_valid
      end

      it "他ユーザーの active 契約はカウントしない" do
        other_user = create(:user)
        7.times { create(:pact, user: other_user, status: :active) }

        my_pact = build(:pact, user: user, status: :active)
        expect(my_pact).to be_valid
      end

      it "自分自身の更新では再カウントしない" do
        7.times { create(:pact, user: user, status: :active) }
        existing = user.pacts.first
        existing.goal = "新しい目標"
        expect(existing).to be_valid
      end
    end
  end
end
