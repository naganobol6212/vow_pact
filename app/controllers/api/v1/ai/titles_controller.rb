module Api
  module V1
    module Ai
      class TitlesController < Api::V1::Ai::BaseController
        def create
          titles = ::Ai::TitleGenerator.new.generate(
            goal: params[:goal].to_s,
            difficulty: params[:difficulty].to_i
          )
          render json: { titles: titles }, status: :ok
        end
      end
    end
  end
end
