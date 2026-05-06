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
  # 同時 PATCH の race（TOCTOU）を防ぐため、行ロックを取得して再判定する。
  # 既に使用済みや期限切れの場合は ArgumentError。
  def consume!(password:, password_confirmation:)
    with_lock do
      # ロック取得後に最新の DB 値で再判定する（reload は with_lock が暗黙に行う）
      raise ArgumentError, "既に使用済みのトークンです" if used?
      raise ArgumentError, "期限切れのトークンです" if expired?

      user.update!(password: password, password_confirmation: password_confirmation)
      update!(used_at: Time.current)
    end
  end
end
