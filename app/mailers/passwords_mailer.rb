class PasswordsMailer < ApplicationMailer
  default from: ENV.fetch("MAIL_FROM", "noreply@vow-pact.local")

  # パスワード再設定メールを送る。
  # @param token [PasswordResetToken] 発行済みトークン
  def reset(token)
    @user = token.user
    @reset_url = build_reset_url(token.token)
    @expires_in_minutes = (PasswordResetToken::EXPIRATION / 60).to_i

    mail(to: @user.email, subject: "【Vow Pact】パスワード再設定のご案内")
  end

  private

  def build_reset_url(token_value)
    base = ENV.fetch("FRONTEND_URL", "http://localhost:3000")
    "#{base}/reset-password/#{token_value}"
  end
end
