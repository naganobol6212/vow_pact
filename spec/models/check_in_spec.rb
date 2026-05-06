require "rails_helper"

RSpec.describe CheckIn, type: :model do
  describe "associations" do
    it "belongs_to :pact" do
      assoc = described_class.reflect_on_association(:pact)
      expect(assoc.macro).to eq(:belongs_to)
    end
  end

  describe "enum status" do
    it "kept / broken / skipped を持つ" do
      expect(described_class.statuses).to eq("kept" => 0, "broken" => 1, "skipped" => 2)
    end
  end

  describe "validations" do
    let(:user) { create(:user) }
    let(:pact) { create(:pact, user: user, signed_at: 3.days.ago) }

    it "正しい属性の CheckIn は valid" do
      ci = build(:check_in, pact: pact, checked_on: Date.current)
      expect(ci).to be_valid
    end

    it "checked_on が必須" do
      ci = build(:check_in, pact: pact, checked_on: nil)
      expect(ci).not_to be_valid
      expect(ci.errors[:checked_on]).to be_present
    end

    it "checked_on が未来の日付なら invalid" do
      ci = build(:check_in, pact: pact, checked_on: Date.current + 1)
      expect(ci).not_to be_valid
      expect(ci.errors[:checked_on]).to be_present
    end

    it "checked_on が pact.signed_at より前なら invalid" do
      ci = build(:check_in, pact: pact, checked_on: pact.signed_at.to_date - 1)
      expect(ci).not_to be_valid
      expect(ci.errors[:checked_on]).to be_present
    end

    it "checked_on が pact.signed_at の当日なら valid" do
      ci = build(:check_in, pact: pact, checked_on: pact.signed_at.to_date)
      expect(ci).to be_valid
    end

    it "status 無し（nil）なら invalid" do
      ci = build(:check_in, pact: pact, status: nil)
      expect(ci).not_to be_valid
    end

    it "note は 500 文字まで OK" do
      ci = build(:check_in, pact: pact, note: "あ" * 500)
      expect(ci).to be_valid
    end

    it "note が 501 文字なら invalid" do
      ci = build(:check_in, pact: pact, note: "あ" * 501)
      expect(ci).not_to be_valid
      expect(ci.errors[:note]).to be_present
    end

    it "active でない pact への新規 CheckIn は invalid" do
      pact.update!(status: :abandoned)
      ci = build(:check_in, pact: pact, checked_on: Date.current)
      expect(ci).not_to be_valid
      expect(ci.errors[:pact]).to be_present
    end
  end

  describe "DB unique 制約（pact_id, checked_on）" do
    let(:user) { create(:user) }
    let(:pact) { create(:pact, user: user, signed_at: 3.days.ago) }

    it "同じ (pact, checked_on) の組み合わせは Rails レベルで invalid" do
      create(:check_in, pact: pact, checked_on: Date.current)
      duplicate = build(:check_in, pact: pact, checked_on: Date.current)
      expect(duplicate).not_to be_valid
    end

    it "同じ (pact, checked_on) で create! すると DB レベルでも RecordNotUnique になる" do
      create(:check_in, pact: pact, checked_on: Date.current)
      expect {
        # validation を skip して直接 INSERT したいので raw に作る
        described_class.new(pact: pact, checked_on: Date.current, status: :kept).save!(validate: false)
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it "find_or_initialize_by + update! で訂正パターンが動く（同日 2 回 = UPDATE）" do
      first = pact.check_ins.find_or_initialize_by(checked_on: Date.current)
      first.update!(status: :kept)

      second = pact.check_ins.find_or_initialize_by(checked_on: Date.current)
      second.update!(status: :broken, note: "やっぱり破った")

      expect(pact.check_ins.where(checked_on: Date.current).count).to eq(1)
      expect(pact.check_ins.find_by(checked_on: Date.current).status).to eq("broken")
      expect(pact.check_ins.find_by(checked_on: Date.current).note).to eq("やっぱり破った")
    end
  end

  describe "コールバックで User.streak_count が再計算される" do
    let(:user) { create(:user) }
    let(:pact) { create(:pact, user: user, signed_at: 7.days.ago) }

    it "create で streak_count が更新される" do
      expect {
        create(:check_in, pact: pact, checked_on: Date.current, status: :kept)
      }.to change { user.reload.streak_count }.from(0).to(1)
    end

    it "destroy で streak_count が再計算される（0 に戻る）" do
      ci = create(:check_in, pact: pact, checked_on: Date.current, status: :kept)
      expect { ci.destroy! }.to change { user.reload.streak_count }.from(1).to(0)
    end

    it "update で streak_count が再計算される（kept → broken で 0 になる）" do
      ci = create(:check_in, pact: pact, checked_on: Date.current, status: :kept)
      expect {
        ci.update!(status: :broken)
      }.to change { user.reload.streak_count }.from(1).to(0)
    end
  end
end
