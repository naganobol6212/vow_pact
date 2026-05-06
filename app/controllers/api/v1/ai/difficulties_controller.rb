module Api
  module V1
    module Ai
      class DifficultiesController < Api::V1::Ai::BaseController
        def create
          input = {
            "goal" => params[:goal].to_s,
            "constraint_text" => params[:constraint_text].to_s,
            "deadline" => params[:deadline].to_s
          }
          result = ::Ai::Logger.call(
            user: Current.user,
            type: :difficulty_judgment,
            model: "gpt-5.4-nano",
            input: input
          ) do
            ::Ai::DifficultyJudge.new.judge(
              goal: input["goal"],
              constraint_text: input["constraint_text"],
              deadline: input["deadline"]
            )
          end
          render json: result, status: :ok
        end
      end
    end
  end
end
