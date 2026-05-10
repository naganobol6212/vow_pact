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
  #
  # rails_blob_url は host:（ホスト名のみ）と protocol: を分けて受け取る。
  # FRONTEND_URL は "https://example.com" 形式なので URI で分解する必要がある。
  # 旧実装は host: にスキーム込みの URL を渡しており、生成 URL が壊れていたため
  # アバターが本番で表示できなかった。
  attribute :avatar_image_url do |user|
    next nil unless user.avatar.attached?

    frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:3000")
    uri = URI.parse(frontend_url)
    Rails.application.routes.url_helpers.rails_blob_url(
      user.avatar,
      host: uri.host,
      protocol: uri.scheme || "https",
      port: (uri.port if uri.port && uri.port != uri.default_port)
    )
  rescue StandardError => e
    Rails.logger.error(
      "[UserSerializer] avatar_image_url generation failed for user##{user.id}: #{e.class}: #{e.message}"
    )
    nil
  end
end
