module Api
  module V1
    module Ai
      # AI エンドポイントの共通基底。
      # 認証・CSRF・rescue_from は親（Api::V1::BaseController）から継承。
      # AI 固有の例外（OpenAI エラー / JSON パース失敗）を 502 で返す。
      class BaseController < Api::V1::BaseController
        include RateLimited

        # 全 AI エンドポイントにレート制限を適用（1 ユーザー 1 分 10 回）。
        before_action :enforce_ai_rate_limit!

        rescue_from ::Ai::BaseSuggester::JsonParseError, with: :render_ai_parse_error
        rescue_from Faraday::Error, with: :render_ai_upstream_error

        private

        def render_ai_parse_error(exception)
          Rails.logger.error("[AI parse error] #{exception.class}: #{exception.message}")
          render json: {
            errors: [ { code: "ai_parse_error", message: "AI レスポンスを解釈できませんでした。再度お試しください。" } ]
          }, status: :bad_gateway
        end

        def render_ai_upstream_error(exception)
          Rails.logger.error("[AI upstream error] #{exception.class}: #{exception.message}")
          render json: {
            errors: [ { code: "ai_upstream_error", message: "AI サービスに接続できませんでした。しばらくしてから再度お試しください。" } ]
          }, status: :bad_gateway
        end
      end
    end
  end
end
