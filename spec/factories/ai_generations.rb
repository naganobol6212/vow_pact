FactoryBot.define do
  factory :ai_generation do
    association :user
    pact { nil }
    generation_type { :goal_suggestion }
    input_data { { theme: "健康" } }
    output_data { { goals: [ "毎日 30 分歩く", "週 3 回筋トレ", "23 時に寝る" ] } }
    model { "gpt-5.4-nano" }
    tokens_used { 120 }
    latency_ms { 850 }
    status { :success }
    error_message { nil }
  end
end
