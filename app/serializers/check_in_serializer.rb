class CheckInSerializer
  include Alba::Resource

  attributes :id,
             :pact_id,
             :checked_on,
             :status,
             :note,
             :created_at,
             :updated_at
end
