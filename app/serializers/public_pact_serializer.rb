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
      "avatar_image_url" => pact.user.avatar.attached? ?
        Rails.application.routes.url_helpers.rails_blob_url(
          pact.user.avatar,
          host: ENV.fetch("FRONTEND_URL", "http://localhost:3000")
        ) : nil,
      "avatar_url" => pact.user.avatar_url
    }
  rescue StandardError
    { "nickname" => pact.user.nickname, "avatar_image_url" => nil, "avatar_url" => pact.user.avatar_url }
  end

  one :crest, resource: CrestSerializer
end
