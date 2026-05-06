module CheckIns
  # 「同日の check_in があれば更新、無ければ作成」を行うサービス。
  # pact.with_lock で同時 POST race を直列化し、UNIQUE 制約違反を防ぐ。
  # 戻り値は [check_in, created]（created は新規=true / 訂正=false）。
  class Upsert
    def self.call(pact:, status:, note: nil)
      pact.with_lock do
        check_in = pact.check_ins.find_or_initialize_by(checked_on: Time.zone.today)
        created = check_in.new_record?
        check_in.update!(status: status, note: note)
        [ check_in, created ]
      end
    end
  end
end
