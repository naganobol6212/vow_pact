module Api
  module V1
    module Ai
      class GoalsController < Api::V1::Ai::BaseController
        def create
          goals = ::Ai::GoalSuggester.new.suggest(theme: params[:theme].to_s)
          render json: { goals: goals }, status: :ok
        end
      end
    end
  end
end
