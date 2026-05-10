module Api
  module V1
    module Public
      # 認証不要で「公開された契約」を取得する。
      # is_public=false の契約は 404 で隠す（存在自体を漏らさない）。
      class PactsController < Api::V1::BaseController
        # index も認証不要にする（広場 /explore は未ログインでも閲覧可能）。
        allow_unauthenticated_access only: [ :index, :show ]

        # GET /api/v1/public/pacts?page=1
        # is_public=true の契約を新着順に paginate する。
        #
        # ページネーション戦略:
        #   オフセット型ページング（page=N, per_page=20）。新着順なので
        #   新しい契約が公開されるとページの境界がずれる可能性があるが、
        #   見せたい体験は「最近の活動を眺める」であり、厳密な悉皆性は不要なため許容する。
        #   per_page を URL から指定可能にすると DoS の温床になるためサーバ固定。
        PER_PAGE = 20

        def index
          page = (params[:page] || 1).to_i.clamp(1, 1_000) # ガード: 大きすぎる page を弾く
          offset = (page - 1) * PER_PAGE

          relation = Pact.public_pacts
                          .includes(:crest, :user)
                          .order(signed_at: :desc, id: :desc)

          total_count = relation.count
          pacts = relation.offset(offset).limit(PER_PAGE)

          render json: {
            pacts: pacts.map { |p| PublicPactSerializer.new(p).to_h },
            page: page,
            per_page: PER_PAGE,
            total_count: total_count,
            # 次のページが存在するかは「offset + 取得件数 < total」で判定。
            next_page: (offset + pacts.size < total_count ? page + 1 : nil)
          }, status: :ok
        end

        def show
          pact = Pact.public_pacts.includes(:crest, :user).find(params[:id])
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
