module Api
  module V1
    module Public
      # 公開された契約から OG image（PNG）を動的に生成して配信する。
      # /api/v1/public/pacts/:id/og.png でアクセス可能。
      # is_public=false の契約は 404。
      # キャッシュ戦略：
      #   1) updated_at をキーに Rails.cache（Solid Cache）へ PNG を保存
      #      （Render Free tier では rsvg-convert + Noto CJK フォント読み込みに 10 秒以上かかるため、
      #      毎回再生成すると X クローラー（タイムアウト 5〜10 秒）に間に合わない）
      #   2) ETag / Last-Modified でブラウザ・CDN にも乗せる
      class OgImagesController < Api::V1::BaseController
        allow_unauthenticated_access only: [ :show ]

        # Solid Cache に格納する OG image の有効期限。
        # 契約が更新されると updated_at が変わり cache key も変わるため、古いキーは TTL で自動失効。
        OG_IMAGE_CACHE_TTL = 30.days

        def show
          pact = Pact.where(is_public: true).find(params[:id])

          # ETag / Last-Modified で 304 を返せる場合は本文生成自体スキップ
          fresh_when(etag: pact, last_modified: pact.updated_at, public: true)
          return if request.fresh?(response)

          cache_key = [ "pact_og_image", pact.id, pact.updated_at.to_i ]
          png = Rails.cache.fetch(cache_key, expires_in: OG_IMAGE_CACHE_TTL) do
            PactOgImageGenerator.new(pact).to_png
          end

          send_data png, type: "image/png", disposition: "inline",
                          filename: "pact-#{pact.id}-og.png"
        rescue ActiveRecord::RecordNotFound
          head :not_found
        end
      end
    end
  end
end
