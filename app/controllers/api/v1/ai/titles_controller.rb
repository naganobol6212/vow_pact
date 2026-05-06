module Api
  module V1
    module Ai
      class TitlesController < Api::V1::Ai::BaseController
        def create
          goal = params[:goal].to_s
          difficulty = params[:difficulty].to_i
          titles = ::Ai::Logger.call(
            user: Current.user,
            type: :title_generation,
            model: "gpt-5.4-nano",
            input: { "goal" => goal, "difficulty" => difficulty }
          ) do
            ::Ai::TitleGenerator.new.generate(goal: goal, difficulty: difficulty)
          end
          render json: { titles: titles }, status: :ok
        end
      end
    end
  end
end
