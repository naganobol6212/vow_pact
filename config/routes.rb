Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

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
      end

      resources :pacts, only: [ :index, :create, :show, :update, :destroy ] do
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
    end
  end

  root "home#index"
  get "*path", to: "home#index", constraints: ->(req) { !req.path.start_with?("/api",
  "/up", "/rails") }
  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
