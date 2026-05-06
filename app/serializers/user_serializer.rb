class UserSerializer
  include Alba::Resource

  attributes :id,
             :email,
             :nickname,
             :avatar_url,
             :is_public,
             :is_guest,
             :streak_count,
             :longest_streak,
             :created_at,
             :updated_at
end
