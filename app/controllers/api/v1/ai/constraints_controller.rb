module Api
  module V1
    module Ai
      class ConstraintsController < Api::V1::Ai::BaseController
        def create
          constraints = ::Ai::ConstraintSuggester.new.suggest(goal: params[:goal].to_s)
          render json: { constraints: constraints }, status: :ok
        end
      end
    end
  end
end
