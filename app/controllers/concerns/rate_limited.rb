module RateLimited
  extend ActiveSupport::Concern

  # AI 呼び出しレート制限：ユーザーごと、過去 1 分間に AI_RATE_LIMIT 回まで。
  AI_RATE_LIMIT = 10
  AI_RATE_WINDOW = 1.minute

  private

  def enforce_ai_rate_limit!
    return unless Current.user

    count = Current.user.ai_generations
                       .where(created_at: AI_RATE_WINDOW.ago..)
                       .count
    return if count < AI_RATE_LIMIT

    render json: {
      errors: [
        {
          code: "rate_limit_exceeded",
          message: "1 分間の AI 利用上限（#{AI_RATE_LIMIT} 回）を超えました。少し時間をおいて再度お試しください。"
        }
      ]
    }, status: :too_many_requests
  end
end
