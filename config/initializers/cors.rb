# Cross-Origin Resource Sharing（CORS）設定
# React フロントエンド（別オリジン）から /api/* への通信を許可する。
# Cookie によるセッション認証を使うため credentials: true が必須。

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_ORIGIN", "http://localhost:3036")

    resource "/api/*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options ],
      credentials: true
  end
end
