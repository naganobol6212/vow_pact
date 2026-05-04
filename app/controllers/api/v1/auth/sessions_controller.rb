module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
        allow_unauthenticated_access only: [ :create ]
        skip_forgery_protection only: [ :create ]

        def create
          user = User.find_by(email: params[:email]&.downcase)

          if user&.authenticate(params[:password])
            start_new_session_for(user)
            render json: UserSerializer.new(user).serializable_hash, status: :ok
          else
            render json: {
              errors: [ { code: "invalid_credentials", message: "メールアドレスまたはパスワードが正しくありません" } ]
            }, status: :unauthorized
          end
        end

        def destroy
          terminate_session
          head :no_content
        end
      end
    end
  end
end
