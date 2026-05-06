require "rails_helper"

RSpec.describe PasswordResetToken, type: :model do
  let(:user) { create(:user) }

  describe "associations" do
    it "belongs_to :user" do
      assoc = described_class.reflect_on_association(:user)
      expect(assoc.macro).to eq(:belongs_to)
    end
  end

  describe ".issue_for!" do
    it "新しいトークンを生成し、有効期限 30 分後で保存する" do
      result = described_class.issue_for!(user)
      expect(result).to be_persisted
      expect(result.user).to eq(user)
      expect(result.token).to be_present
      expect(result.expires_at).to be_within(2.seconds).of(30.minutes.from_now)
      expect(result.used_at).to be_nil
    end

    it "毎回ユニークなトークンを生成する" do
      tokens = 5.times.map { described_class.issue_for!(user).token }
      expect(tokens.uniq.size).to eq(5)
    end
  end

  describe "#expired?" do
    it "expires_at を過ぎていれば true" do
      t = create(:password_reset_token, expires_at: 1.minute.ago)
      expect(t.expired?).to be true
    end

    it "expires_at を過ぎていなければ false" do
      t = create(:password_reset_token, expires_at: 1.minute.from_now)
      expect(t.expired?).to be false
    end
  end

  describe "#used?" do
    it "used_at が nil なら false" do
      expect(create(:password_reset_token).used?).to be false
    end

    it "used_at に値があれば true" do
      expect(create(:password_reset_token, used_at: Time.current).used?).to be true
    end
  end

  describe "#consume!" do
    it "新しいパスワードを設定し、used_at を記録する" do
      t = create(:password_reset_token)
      t.consume!(password: "newpass1234", password_confirmation: "newpass1234")
      t.reload
      expect(t.used_at).to be_present
      expect(t.user.authenticate("newpass1234")).to eq(t.user)
    end

    it "既に使用済みなら ArgumentError" do
      t = create(:password_reset_token, used_at: 1.minute.ago)
      expect {
        t.consume!(password: "newpass1234", password_confirmation: "newpass1234")
      }.to raise_error(ArgumentError, /既に使用済み/)
    end

    it "期限切れなら ArgumentError" do
      t = create(:password_reset_token, expires_at: 1.minute.ago)
      expect {
        t.consume!(password: "newpass1234", password_confirmation: "newpass1234")
      }.to raise_error(ArgumentError, /期限切れ/)
    end

    it "新パスワードが短すぎる場合は ActiveRecord::RecordInvalid（used_at は記録されない）" do
      t = create(:password_reset_token)
      expect {
        t.consume!(password: "short", password_confirmation: "short")
      }.to raise_error(ActiveRecord::RecordInvalid)

      # transaction 内で失敗したので、used_at は更新されないまま
      expect(t.reload.used_at).to be_nil
    end

    it "新パスワードと確認が不一致なら ActiveRecord::RecordInvalid" do
      t = create(:password_reset_token)
      expect {
        t.consume!(password: "newpass1234", password_confirmation: "different")
      }.to raise_error(ActiveRecord::RecordInvalid)
      expect(t.reload.used_at).to be_nil
    end
  end

  describe "scope :active" do
    it "未使用かつ未期限切れのものだけ返す" do
      active = create(:password_reset_token, expires_at: 10.minutes.from_now)
      _expired = create(:password_reset_token, expires_at: 1.minute.ago)
      _used = create(:password_reset_token, used_at: Time.current)

      expect(described_class.active).to contain_exactly(active)
    end
  end
end
