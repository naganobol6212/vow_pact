module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
        # destroy も unauthenticated 状態で叩かれうるので allow_unauthenticated_access に含める。
        # （未認証でログアウトボタンを押されたときに 401 ではなく idempotent に 204 を返す）
        allow_unauthenticated_access only: %i[create destroy]
        skip_forgery_protection only: %i[create destroy]

        def create
          user = User.find_by(email: params[:email]&.downcase)

          if user&.authenticate(params[:password])
            start_new_session_for(user)
            render json: UserSerializer.new(user).serializable_hash, status: :ok
          else
            render json: {
              errors: [ { code: "invalid_credentials", message: I18n.t("errors.api.invalid_credentials") } ]
            }, status: :unauthorized
          end
        end

        def destroy
          # Current.session が nil でも安全にクッキーは削除する。
          # 二度押し / セッション期限切れ後のログアウトでも 204 を返す（冪等）。
          Current.session&.destroy
          cookies.delete(:session_id)
          head :no_content
        end
      end
    end
  end
end
