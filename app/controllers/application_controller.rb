class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  include Authentication

  # ActionController::API は allow_forgery_protection を持たないため
  # config.action_controller.allow_forgery_protection = false（test.rb）が効かない。
  # test 環境では protect_from_forgery 自体を呼ばないことで request spec を簡潔に保つ。
  protect_from_forgery with: :exception unless Rails.env.test?
end
