class Crest < ApplicationRecord
  REQUIRED_CREST_DATA_KEYS = %w[base_shape central_motif decoration color_palette shimmer_level].freeze

  belongs_to :pact

  enum :rarity, {
    common: 0,
    rare: 1,
    epic: 2,
    legendary: 3
  }

  # DB UNIQUE と二重防御
  validates :pact_id, uniqueness: true
  validates :rarity, presence: true
  validates :generated_at, presence: true
  validate :crest_data_must_have_required_keys
  validate :pact_must_be_completed

  private

  def crest_data_must_have_required_keys
    return if crest_data.blank?
    missing = REQUIRED_CREST_DATA_KEYS - crest_data.keys.map(&:to_s)
    return if missing.empty?
    errors.add(:crest_data, "は必須キー #{missing.join(', ')} を含む必要があります")
  end

  def pact_must_be_completed
    return if pact.blank?
    errors.add(:pact, "は completed 状態である必要があります") unless pact.completed?
  end
end
