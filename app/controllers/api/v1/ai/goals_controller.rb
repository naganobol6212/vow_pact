module Api
  module V1
    module Ai
      class GoalsController < Api::V1::Ai::BaseController
        def create
          theme = params[:theme].to_s
          goals = ::Ai::Logger.call(
            user: Current.user,
            type: :goal_suggestion,
            model: "gpt-5.4-nano",
            input: { "theme" => theme }
          ) do
            ::Ai::GoalSuggester.new.suggest(theme: theme)
          end
          render json: { goals: goals }, status: :ok
        end
      end
    end
  end
end
