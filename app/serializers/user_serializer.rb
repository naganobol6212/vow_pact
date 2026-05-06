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

  # Active Storage で添付されたアバターのパブリック URL。
  # 添付なしなら nil。FE は avatar_image_url > avatar_url の優先順位で表示する。
  attribute :avatar_image_url do |user|
    if user.avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(
        user.avatar,
        host: ENV.fetch("FRONTEND_URL", "http://localhost:3000")
      )
    end
  rescue StandardError
    nil
  end
end
