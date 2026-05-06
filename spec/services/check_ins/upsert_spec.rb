require "rails_helper"

RSpec.describe CheckIns::Upsert, type: :service do
  let(:user) { create(:user) }
  let(:pact) { create(:pact, user: user, signed_at: 3.days.ago) }

  describe ".call" do
    it "新規 check_in を作成する（created=true を返す）" do
      check_in, created = described_class.call(pact: pact, status: :kept, note: "やった")
      expect(check_in).to be_persisted
      expect(check_in.status).to eq("kept")
      expect(check_in.note).to eq("やった")
      expect(check_in.checked_on).to eq(Time.zone.today)
      expect(created).to be true
    end

    it "同日 2 回呼ぶと既存レコードを更新する（created=false を返す）" do
      first, c1 = described_class.call(pact: pact, status: :kept)
      second, c2 = described_class.call(pact: pact, status: :broken, note: "やっぱり破った")

      expect(c1).to be true
      expect(c2).to be false
      expect(first.id).to eq(second.id)
      expect(pact.check_ins.where(checked_on: Time.zone.today).count).to eq(1)
      expect(second.status).to eq("broken")
      expect(second.note).to eq("やっぱり破った")
    end

    it "checked_on は Time.zone.today で固定（クライアント値は受け付けない設計）" do
      check_in, _ = described_class.call(pact: pact, status: :kept)
      expect(check_in.checked_on).to eq(Time.zone.today)
    end
  end
end
