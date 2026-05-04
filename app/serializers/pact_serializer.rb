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
             :created_at,
             :updated_at
end
