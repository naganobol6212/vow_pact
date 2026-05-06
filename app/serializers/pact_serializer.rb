class PactSerializer
  include Alba::Resource

  attributes :id,
             :user_id,
             :goal,
             :constraint_text,
             :difficulty,
             :difficulty_reason,
             :deadline,
             :status,
             :title,
             :signed_at,
             :completed_at,
             :is_public,
             :created_at,
             :updated_at

  # 達成済み契約には紋章が紐づく。未達成なら null。
  one :crest, resource: CrestSerializer
end
