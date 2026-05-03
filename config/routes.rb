Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API ルート（Issue #17 以降で実装）
  namespace :api do
    namespace :v1 do
      # 認証（Issue #17）
      # post   "auth/signup", to: "auth/registrations#create"
      # post   "auth/login",  to: "auth/sessions#create"
      # delete "auth/logout", to: "auth/sessions#destroy"
      # get    "auth/me",     to: "auth/sessions#show"
    end
  end

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
