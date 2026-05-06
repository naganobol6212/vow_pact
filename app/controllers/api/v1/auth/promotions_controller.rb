module Api
  module V1
    module Auth
      # ゲストユーザーを本登録ユーザーへ昇格する。
      # email / password / password_confirmation を本物に更新し、is_guest=false に切り替える。
      # 既存の Pact / CheckIn / Crest はそのまま引き継がれる（同じ User なので id 不変）。
      class PromotionsController < Api::V1::BaseController
        def update
          unless Current.user&.is_guest?
            render json: {
              errors: [ { code: "not_a_guest", message: I18n.t("errors.api.not_a_guest") } ]
            }, status: :unprocessable_entity
            return
          end

          Current.user.promote_to_registered!(
            email: promote_params[:email],
            password: promote_params[:password],
            password_confirmation: promote_params[:password_confirmation],
            nickname: promote_params[:nickname]
          )

          render json: UserSerializer.new(Current.user).serializable_hash, status: :ok
        end

        private

        def promote_params
          params.permit(:email, :password, :password_confirmation, :nickname)
        end
      end
    end
  end
end
