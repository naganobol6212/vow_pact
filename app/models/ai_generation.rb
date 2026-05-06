class AiGeneration < ApplicationRecord
  belongs_to :user
  # pact は AI 呼び出しタイミングによっては未確定（目標案 / 制約案）。
  # 紐付いた pact が destroy されたら nullify でログは残す（コスト分析・監査用途）。
  belongs_to :pact, optional: true

  enum :generation_type, {
    goal_suggestion: 0,        # 目標案
    constraint_suggestion: 1,  # 制約案
    difficulty_judgment: 2,    # 難易度判定
    title_generation: 3        # 称号生成
  }

  enum :status, {
    success: 0,
    failed: 1,
    filtered: 2  # コンテンツフィルタで弾かれた
  }

  validates :generation_type, presence: true
  validates :status, presence: true
  validates :model, presence: true
end
