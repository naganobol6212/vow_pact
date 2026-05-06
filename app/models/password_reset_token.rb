class PasswordResetToken < ApplicationRecord
  EXPIRATION = 30.minutes

  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(used_at: nil).where("expires_at > ?", Time.current) }

  # 新しいトークンを発行する。SecureRandom.urlsafe_base64(32) は 43 文字の URL safe な文字列。
  def self.issue_for!(user)
    create!(
      user: user,
      token: SecureRandom.urlsafe_base64(32),
      expires_at: EXPIRATION.from_now
    )
  end

  def expired?
    expires_at <= Time.current
  end

  def used?
    used_at.present?
  end

  # トークンを使ってパスワードを変更し、used_at を記録する。
  # 既に使用済みや期限切れの場合は ArgumentError。
  # User の更新と used_at 記録は同一 transaction 内で実行する。
  def consume!(password:, password_confirmation:)
    raise ArgumentError, "既に使用済みのトークンです" if used?
    raise ArgumentError, "期限切れのトークンです" if expired?

    transaction do
      user.update!(password: password, password_confirmation: password_confirmation)
      update!(used_at: Time.current)
    end
  end
end
