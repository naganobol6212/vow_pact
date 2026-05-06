class CrestSerializer
  include Alba::Resource

  attributes :id,
             :pact_id,
             :crest_data,
             :rarity,
             :generated_at,
             :created_at,
             :updated_at
end
