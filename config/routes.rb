Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # 開発時の送信メール確認 UI（本番では mount しない）
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  # API ルート
  namespace :api do
    namespace :v1 do
      namespace :auth do
        post   "signup",   to: "registrations#create"
        post   "login",    to: "sessions#create"
        delete "logout",   to: "sessions#destroy"
        get    "me",       to: "users#show"
        patch  "me",       to: "users#update"
        patch  "email",    to: "users#update_email"
        patch  "password", to: "passwords#update"
        # ゲストモード（お試し用）
        post   "guest",    to: "guests#create"
        # ゲスト → 本登録ユーザーへの昇格（既存データを引き継ぐ）
        patch  "promote",  to: "promotions#update"
        # パスワード再設定（メール経由）
        post  "password_resets",        to: "password_resets#create"
        get   "password_resets/:token", to: "password_resets#show",   as: :show_password_reset
        patch "password_resets/:token", to: "password_resets#update", as: :update_password_reset
      end

      resources :pacts, only: [ :index, :create, :show, :update, :destroy ] do
        # 称号生成: AI で称号案を生成 → 1 つ採用 → pact.title に保存 → Pact を返す。
        # 既に title が設定済みなら再生成しない（idempotent）。
        member do
          post :title, action: :generate_title
        end
        # ネストしたチェックイン（必ず特定 pact 配下）
        resources :check_ins, only: [ :index, :create, :destroy ]
      end

      namespace :ai do
        post "goals",        to: "goals#create"
        post "constraints",  to: "constraints#create"
        post "difficulties", to: "difficulties#create"
        post "titles",       to: "titles#create"
      end

      # ランキング
      get "rankings/monthly", to: "rankings#monthly"
      get "rankings/streak",  to: "rankings#streak"

      # 公開エンドポイント（認証不要、is_public=true の契約のみ）
      namespace :public do
        get "pacts/:id",        to: "pacts#show",     as: :pact
        get "pacts/:id/og.png", to: "og_images#show", as: :pact_og_image
      end
    end
  end

  # 公開契約ページ。X クローラーは JS を実行しないため、og:image / twitter:card 等の OGP meta を
  # サーバーサイドで HTML に埋め込む必要がある。SPA fallback より前に定義する。
  get "/p/:id", to: "home#public_pact", constraints: { id: /\d+/ }, as: :public_pact_share

  root "home#index"
  get "*path", to: "home#index", constraints: ->(req) {
    !req.path.start_with?("/api", "/up", "/rails", "/letter_opener")
  }
  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
