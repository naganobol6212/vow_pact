module Api
  module V1
    module Auth
      class RegistrationsController < Api::V1::BaseController
        allow_unauthenticated_access only: [ :create ]
        skip_forgery_protection only: [ :create ]

        def create
          user = User.create!(user_params)
          start_new_session_for(user)
          render json: UserSerializer.new(user).serializable_hash, status: :created
        end

        private

        def user_params
          params.permit(:email, :nickname, :password, :password_confirmation)
        end
      end
    end
  end
end
