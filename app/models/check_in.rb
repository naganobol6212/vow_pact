class CheckIn < ApplicationRecord
  belongs_to :pact

  enum :status, { kept: 0, broken: 1, skipped: 2 }

  NOTE_MAX_LENGTH = 500

  # checked_on はサーバ側で自動設定（チート防止）。
  # クライアント値はコントローラの strong params で除外される設計（Issue #19 で実装）。
  # 内部呼び出しで明示指定された場合（テスト・データ補修等）は尊重する。
  before_validation :set_checked_on_to_today, on: :create

  validates :checked_on, presence: true
  validates :status, presence: true
  validates :note, length: { maximum: NOTE_MAX_LENGTH }, allow_blank: true
  # DB UNIQUE と二重防御（Rails レベルでも検出）
  validates :checked_on, uniqueness: { scope: :pact_id }
  validate :checked_on_not_in_future
  validate :checked_on_after_pact_signed_at
  validate :pact_must_be_active, on: :create

  # 同一 transaction 内で User.streak_count を再計算する。
  # update_columns は現在の transaction で UPDATE を発行するので、
  # 外側が rollback されれば streak も巻き戻り整合性は保たれる。
  # 並行 check-in による race は StreakCalculator 側の with_lock で吸収する。
  after_save :recalc_user_streak
  after_destroy :recalc_user_streak

  private

  def checked_on_not_in_future
    return if checked_on.blank?
    errors.add(:checked_on, "は未来の日付にできません") if checked_on > Time.zone.today
  end

  def checked_on_after_pact_signed_at
    return if checked_on.blank? || pact.blank? || pact.signed_at.blank?
    # pact.signed_at は datetime なので date に揃えて比較
    errors.add(:checked_on, "は契約締結日以降である必要があります") if checked_on < pact.signed_at.to_date
  end

  def pact_must_be_active
    return if pact.blank?
    errors.add(:pact, "は active でなければなりません") unless pact.active?
  end

  def recalc_user_streak
    StreakCalculator.new(pact.user).call
  end

  def set_checked_on_to_today
    self.checked_on = Date.current if checked_on.blank?
  end
end
