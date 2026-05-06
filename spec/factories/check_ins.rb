FactoryBot.define do
  factory :check_in do
    association :pact
    checked_on { Date.current }
    status { :kept }
    note { nil }
  end
end
