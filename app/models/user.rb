class User < ApplicationRecord
  GUEST_NICKNAME = "ゲスト".freeze
  GUEST_EMAIL_DOMAIN = "guest.local".freeze
  GUEST_EXPIRATION = 30.days

  has_secure_password

  scope :guest, -> { where(is_guest: true) }
  scope :registered, -> { where(is_guest: false) }
  # 期限切れの未昇格ゲスト（クリーンアップ Job 対象）
  scope :expired_guests, -> { guest.where("created_at < ?", GUEST_EXPIRATION.ago) }

  # ランダムな email + パスワードで guest user を作成する。
  # 通常の signup と違い、メアド入力不要で「お試しモード」を即開始できる。
  def self.create_guest!
    suffix = SecureRandom.hex(8)
    create!(
      email: "guest_#{suffix}@#{GUEST_EMAIL_DOMAIN}",
      nickname: GUEST_NICKNAME,
      password: SecureRandom.hex(16),
      is_guest: true,
      is_public: false   # ゲストはランキング非表示
    )
  end

  # ゲストを本登録ユーザーに昇格する。
  # email / password / nickname を本物に更新し、is_guest を false に切り替える。
  # 既存の Pact / CheckIn / Crest はそのまま引き継がれる。
  def promote_to_registered!(email:, password:, password_confirmation:, nickname: nil)
    raise ArgumentError, "登録済みユーザーは promote できません" unless is_guest?

    update!(
      email: email,
      password: password,
      password_confirmation: password_confirmation,
      nickname: nickname.presence || self.nickname,
      is_guest: false
    )
  end

  # アソシエーション
  has_many :pacts, dependent: :destroy
  has_many :sessions, dependent: :destroy
  has_many :check_ins, through: :pacts
  has_many :ai_generations, dependent: :destroy
  has_many :password_reset_tokens, dependent: :destroy

  # バリデーション
  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :nickname,
            presence: true,
            length: { in: 1..30 }
  validates :password,
            length: { minimum: 6 },
            allow_nil: true
  validates :avatar_url,
            format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]) },
            allow_blank: true
  validates :is_public,
            inclusion: { in: [ true, false ] }
  validates :streak_count,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :longest_streak,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # validation 前に正規化（前後空白除去 + 小文字化）
  before_validation :normalize_email
  before_validation :strip_nickname

  private

  def normalize_email
    self.email = email.strip.downcase if email.present?
  end

  def strip_nickname
    self.nickname = nickname.strip if nickname.present?
  end
end
