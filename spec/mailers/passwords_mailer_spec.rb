require "rails_helper"

RSpec.describe PasswordsMailer, type: :mailer do
  describe "#reset" do
    let(:user) { create(:user, email: "test@example.com", nickname: "勇者") }
    let(:token) { PasswordResetToken.issue_for!(user) }
    let(:mail) { described_class.reset(token) }

    it "宛先がユーザーのメールアドレスである" do
      expect(mail.to).to eq([ "test@example.com" ])
    end

    it "件名にプロジェクト名が含まれる" do
      expect(mail.subject).to include("Vow Pact")
    end

    it "本文にユーザーのニックネームが含まれる" do
      expect(mail.text_part.body.to_s).to include("勇者")
      expect(mail.html_part.body.to_s).to include("勇者")
    end

    it "本文にリセット URL（FRONTEND_URL/reset-password/トークン）が含まれる" do
      expect(mail.text_part.body.to_s).to include("/reset-password/#{token.token}")
      expect(mail.html_part.body.to_s).to include("/reset-password/#{token.token}")
    end

    it "本文に有効期限の分数が含まれる" do
      expect(mail.text_part.body.to_s).to include("30")
      expect(mail.html_part.body.to_s).to include("30")
    end
  end
end
