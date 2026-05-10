module Api
  module V1
    module Ai
      class GoalsController < Api::V1::Ai::BaseController
        def create
          theme = params[:theme].to_s
          # genre はオプション（未指定なら nil として渡してジャンル横断）
          genre = params[:genre].to_s.presence
          # 未指定 genre をログに残すと無意味なので、設定された場合だけ input に含める。
          input_data = { "theme" => theme }
          input_data["genre"] = genre if genre
          goals = ::Ai::Logger.call(
            user: Current.user,
            type: :goal_suggestion,
            model: "gpt-5.4-nano",
            input: input_data
          ) do
            ::Ai::GoalSuggester.new.suggest(theme: theme, genre: genre)
          end
          render json: { goals: goals }, status: :ok
        end
      end
    end
  end
end
