# OpenAI クライアント設定
# 環境変数 OPENAI_API_KEY から API キーを読み込む。
# テスト環境ではモックを使うため、API キーが空でも動作する。

OpenAI.configure do |config|
  config.access_token = ENV.fetch("OPENAI_API_KEY", "")
  config.log_errors = Rails.env.development?
end
