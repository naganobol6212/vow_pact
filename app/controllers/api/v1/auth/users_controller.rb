module Api
  module V1
    module Auth
      class UsersController < Api::V1::BaseController
        def show
          render json: UserSerializer.new(Current.user).serializable_hash, status: :ok
        end

        def update
          Current.user.update!(profile_params)
          render json: UserSerializer.new(Current.user).serializable_hash, status: :ok
        end

        def update_email
          unless Current.user.authenticate(params[:current_password])
            render json: {
              errors: [ { code: "invalid_password", message: I18n.t("errors.api.invalid_password") } ]
            }, status: :unauthorized
            return
          end

          Current.user.update!(email: params[:email])
          render json: UserSerializer.new(Current.user).serializable_hash, status: :ok
        end

        private

        def profile_params
          params.permit(:nickname, :avatar_url, :is_public)
        end
      end
    end
  end
end
