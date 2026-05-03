class User < ApplicationRecord
  has_secure_password

  # アソシエーション（Pact / CheckIn / AiGeneration は v1.1 で実装）
  # has_many :pacts, dependent: :destroy
  # has_many :check_ins, through: :pacts
  # has_many :ai_generations, dependent: :destroy

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
