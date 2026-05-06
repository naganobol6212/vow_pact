module Api
  module V1
    module Ai
      class ConstraintsController < Api::V1::Ai::BaseController
        def create
          goal = params[:goal].to_s
          constraints = ::Ai::Logger.call(
            user: Current.user,
            type: :constraint_suggestion,
            model: "gpt-5.4-nano",
            input: { "goal" => goal }
          ) do
            ::Ai::ConstraintSuggester.new.suggest(goal: goal)
          end
          render json: { constraints: constraints }, status: :ok
        end
      end
    end
  end
end
