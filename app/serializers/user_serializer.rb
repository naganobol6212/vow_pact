class UserSerializer
  include Alba::Resource

  attributes :id,
             :email,
             :nickname,
             :avatar_url,
             :is_public,
             :streak_count,
             :longest_streak,
             :created_at,
             :updated_at
end
