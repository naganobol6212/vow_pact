FactoryBot.define do
  factory :pact do
    association :user
    goal { Faker::Lorem.sentence(word_count: 5) }
    constraint_text { Faker::Lorem.sentence(word_count: 5) }
    difficulty { 3 }
    deadline { 30.days.from_now.to_date }
    status { :active }
    signed_at { Time.current }
    completed_at { nil }
    title { nil }
  end
end
