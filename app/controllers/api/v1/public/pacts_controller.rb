module Api
  module V1
    module Public
      # 認証不要で「公開された契約」を取得する。
      # is_public=false の契約は 404 で隠す（存在自体を漏らさない）。
      class PactsController < Api::V1::BaseController
        allow_unauthenticated_access only: [ :show ]

        def show
          pact = Pact.where(is_public: true).includes(:crest, :user).find(params[:id])
          render json: PublicPactSerializer.new(pact).serializable_hash, status: :ok
        rescue ActiveRecord::RecordNotFound
          render json: {
            errors: [ { code: "not_found", message: "公開された契約が見つかりません" } ]
          }, status: :not_found
        end
      end
    end
  end
end
