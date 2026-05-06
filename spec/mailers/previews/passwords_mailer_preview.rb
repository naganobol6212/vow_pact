# Preview all emails at http://localhost:3000/rails/mailers/passwords_mailer
class PasswordsMailerPreview < ActionMailer::Preview
  # Preview this email at http://localhost:3000/rails/mailers/passwords_mailer/reset
  def reset
    # 既存の本登録ユーザーがあればそれを、なければメモリ上のダミーを使う
    user = User.where(is_guest: false).first ||
           User.new(nickname: "プレビュー太郎", email: "preview@example.com")
    token = PasswordResetToken.new(
      user: user,
      token: SecureRandom.urlsafe_base64(32),
      expires_at: PasswordResetToken::EXPIRATION.from_now
    )
    PasswordsMailer.reset(token)
  end
end
