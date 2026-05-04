module Api
  module V1
    class PactsController < Api::V1::BaseController
      def index
        pacts = Current.user.pacts.order(created_at: :desc)
        render json: PactSerializer.new(pacts).serializable_hash, status: :ok
      end

      def create
        pact = Current.user.pacts.create!(pact_params)
        render json: PactSerializer.new(pact).serializable_hash, status: :created
      end

      private

      def pact_params
        params.permit(:goal, :constraint_text, :difficulty, :deadline, :signed_at)
      end
    end
  end
end
