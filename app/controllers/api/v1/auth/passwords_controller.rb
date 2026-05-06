module Api
  module V1
    module Auth
      class PasswordsController < Api::V1::BaseController
        def update
          unless Current.user.authenticate(params[:current_password])
            render json: {
              errors: [ { code: "invalid_password", message: I18n.t("errors.api.invalid_password") } ]
            }, status: :unauthorized
            return
          end

          Current.user.update!(
            password: params[:password],
            password_confirmation: params[:password_confirmation]
          )
          head :no_content
        end
      end
    end
  end
end
