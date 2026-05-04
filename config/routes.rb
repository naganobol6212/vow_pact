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
      end

      resources :pacts, only: [ :index, :create ]
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
