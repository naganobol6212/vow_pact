require "rails_helper"

RSpec.describe CleanupExpiredGuestsJob, type: :job do
  describe "#perform" do
    it "30 日以上前に作成された未昇格ゲストを削除する" do
      old_guest = User.create_guest!
      old_guest.update_columns(created_at: 31.days.ago)

      expect {
        described_class.perform_now
      }.to change(User, :count).by(-1)

      expect(User.where(id: old_guest.id)).to be_empty
    end

    it "29 日前のゲストは残す（GUEST_EXPIRATION 以内）" do
      recent_guest = User.create_guest!
      recent_guest.update_columns(created_at: 29.days.ago)

      expect {
        described_class.perform_now
      }.not_to change(User, :count)
    end

    it "本登録ユーザーは古くても削除しない" do
      old_user = create(:user, is_guest: false)
      old_user.update_columns(created_at: 100.days.ago)

      expect {
        described_class.perform_now
      }.not_to change(User, :count)
    end

    it "削除されたゲストの Pact / CheckIn も連鎖削除される" do
      guest = User.create_guest!
      guest.update_columns(created_at: 31.days.ago)
      pact = create(:pact, user: guest, signed_at: 30.days.ago)
      pact.check_ins.new(checked_on: 25.days.ago.to_date, status: :kept).save!(validate: false)

      expect {
        described_class.perform_now
      }.to change(User, :count).by(-1)
        .and change(Pact, :count).by(-1)
        .and change(CheckIn, :count).by(-1)
    end
  end
end
