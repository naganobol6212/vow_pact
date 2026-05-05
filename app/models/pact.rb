class Pact < ApplicationRecord
  # MVP に含めない関連（v1.1 で実装）
  # has_many :check_ins, dependent: :destroy
  # has_one :crest, dependent: :destroy
  # has_many :ai_generations, dependent: :nullify

  belongs_to :user

  # 進行中の契約は最大 7 つまで（ユーザーごと）。
  # 「曜日ごとに別の誓い」を組める実用性と、誓いの重みを保つバランスから 7 を採用。
  MAX_ACTIVE_PACTS = 7

  enum :status, { active: 0, completed: 1, failed: 2, abandoned: 3 }

  # バリデーション
  validates :goal,
            presence: true,
            length: { in: 1..500 }
  validates :constraint_text,
            presence: true,
            length: { in: 1..500 }
  validates :difficulty,
            presence: true,
            inclusion: { in: 1..5 }
  validates :deadline,
            presence: true
  validates :signed_at,
            presence: true
  validate :deadline_must_be_in_the_future, on: :create
  validate :active_pacts_limit, if: -> { active? }

  # 正規化
  before_validation :strip_text_fields

  private

  def deadline_must_be_in_the_future
    return if deadline.blank?
    return if deadline > Date.current

    errors.add(:deadline, "must be in the future")
  end

  def active_pacts_limit
    return unless user

    active_count = user.pacts.where(status: :active).where.not(id: id).count
    return if active_count < MAX_ACTIVE_PACTS

    errors.add(:base, "active な契約は#{MAX_ACTIVE_PACTS}つまでです")
  end

  def strip_text_fields
    self.goal = goal.strip if goal.present?
    self.constraint_text = constraint_text.strip if constraint_text.present?
    self.title = title.strip if title.present?
  end
end
