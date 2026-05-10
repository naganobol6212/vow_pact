class PublicPactSerializer
  include Alba::Resource

  # 公開ページ向けの限定フィールド。
  # user_id / 認証情報のような内部情報は含めない。
  attributes :id,
             :goal,
             :constraint_text,
             :difficulty,
             :deadline,
             :status,
             :title,
             :signed_at,
             :completed_at

  # 公開可能な投稿者情報（nickname と avatar のみ）
  attribute :author do |pact|
    {
      "nickname" => pact.user.nickname,
      "avatar_image_url" => PublicPactSerializer.avatar_blob_url(pact.user),
      "avatar_url" => pact.user.avatar_url
    }
  end

  one :crest, resource: CrestSerializer

  # rails_blob_url の host: は host 名のみ（"https://example.com" 全体ではない）を
  # 受け取るため、FRONTEND_URL を URI で分解して host / protocol / port を分けて渡す。
  # 旧実装は host: にスキーム込み URL を渡しており本番でアバター URL が壊れていた
  # （PR 1 で UserSerializer に同じ修正を適用済み）。
  def self.avatar_blob_url(user)
    return nil unless user&.avatar&.attached?

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
      "[PublicPactSerializer] avatar URL failed for user##{user&.id}: #{e.class}: #{e.message}"
    )
    nil
  end
end
