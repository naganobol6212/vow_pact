FactoryBot.define do
  factory :password_reset_token do
    association :user
    token { SecureRandom.urlsafe_base64(32) }
    expires_at { 30.minutes.from_now }
    used_at { nil }
  end
end
