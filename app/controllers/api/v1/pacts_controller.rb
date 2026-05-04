module Api
  module V1
    class PactsController < Api::V1::BaseController
      def index
        pacts = Current.user.pacts.order(created_at: :desc)
        render json: PactSerializer.new(pacts).serializable_hash, status: :ok
      end

      def show
        pact = Current.user.pacts.find(params[:id])
        render json: PactSerializer.new(pact).serializable_hash, status: :ok
      end

      def create
        pact = Current.user.pacts.create!(pact_params)
        render json: PactSerializer.new(pact).serializable_hash, status: :created
      end

      def update
        pact = Current.user.pacts.find(params[:id])
        pact.update!(edit_params)
        render json: PactSerializer.new(pact).serializable_hash, status: :ok
      end

      # 論理削除：DB からは消さず status を abandoned に変更する
      def destroy
        pact = Current.user.pacts.find(params[:id])
        pact.update!(status: :abandoned)
        head :no_content
      end

      private

      def pact_params
        params.permit(:goal, :constraint_text, :difficulty, :deadline, :signed_at)
      end

      # 編集可能な属性は goal / constraint_text のみ
      # deadline / difficulty / signed_at は契約時に確定し、後から変更不可
      def edit_params
        params.permit(:goal, :constraint_text)
      end
    end
  end
end
