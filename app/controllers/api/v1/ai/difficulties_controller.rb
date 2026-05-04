module Api
  module V1
    module Ai
      class DifficultiesController < Api::V1::Ai::BaseController
        def create
          result = ::Ai::DifficultyJudge.new.judge(
            goal: params[:goal].to_s,
            constraint_text: params[:constraint_text].to_s,
            deadline: params[:deadline].to_s
          )
          render json: result, status: :ok
        end
      end
    end
  end
end
