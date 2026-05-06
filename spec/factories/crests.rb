FactoryBot.define do
  factory :crest do
    association :pact
    rarity { :common }
    generated_at { Time.current }
    crest_data do
      {
        "base_shape" => "shield_round",
        "central_motif" => "sword",
        "decoration" => "wings",
        "color_palette" => "crimson_gold",
        "shimmer_level" => 1
      }
    end
  end
end
