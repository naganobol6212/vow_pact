FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    nickname { Faker::Name.first_name }
    avatar_url { nil }
    is_public { true }
    streak_count { 0 }
    longest_streak { 0 }
  end
end
