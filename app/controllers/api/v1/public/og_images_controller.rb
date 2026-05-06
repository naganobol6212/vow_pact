module Api
  module V1
    module Public
      # 公開された契約から OG image（PNG）を動的に生成して配信する。
      # /api/v1/public/pacts/:id/og.png でアクセス可能。
      # is_public=false の契約は 404。
      # キャッシュ：契約の updated_at をキーにして CDN・ブラウザに乗せる。
      class OgImagesController < Api::V1::BaseController
        allow_unauthenticated_access only: [ :show ]

        def show
          pact = Pact.where(is_public: true).find(params[:id])

          # キャッシュ制御：updated_at が変わるまでブラウザ・CDN にキャッシュさせる
          fresh_when(etag: pact, last_modified: pact.updated_at, public: true)
          return if request.fresh?(response)

          png = PactOgImageGenerator.new(pact).to_png
          send_data png, type: "image/png", disposition: "inline",
                          filename: "pact-#{pact.id}-og.png"
        rescue ActiveRecord::RecordNotFound
          head :not_found
        end
      end
    end
  end
end
