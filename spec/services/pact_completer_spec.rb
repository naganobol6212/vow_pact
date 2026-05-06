require "rails_helper"

RSpec.describe PactCompleter, type: :service do
  let(:user) { create(:user) }

  # check_in を意図的に過去日で作るため validation を skip するヘルパー
  def add_kept(pact:, on:)
    pact.check_ins.new(checked_on: on, status: :kept).save!(validate: false)
  end

  # deadline_must_be_in_the_future（on: :create）を回避して、
  # 「deadline が今日や過去」の pact をテスト用に作るヘルパー。
  def build_pact(signed_at:, deadline:, status: :active, completed_at: nil)
    pact = build(:pact, user: user, signed_at: signed_at, deadline: deadline,
                         status: status, completed_at: completed_at)
    pact.save!(validate: false)
    pact
  end

  describe "#call" do
    context "deadline 未到達のとき" do
      it "completed にしない（active のまま、戻り値は pact）" do
        pact = create(:pact, user: user, signed_at: 5.days.ago, deadline: 5.days.from_now.to_date)
        add_kept(pact: pact, on: Time.zone.today - 1)

        result = described_class.new(pact).call
        expect(result.reload.status).to eq("active")
      end
    end

    context "deadline 当日に compliance_rate が 0.5 以上のとき" do
      it "completed にする（completed_at が設定される）" do
        pact = build_pact(signed_at: 9.days.ago.beginning_of_day, deadline: Time.zone.today)
        # 期待日数 = 10 日（9 日前 .. 今日）。kept 6 日 = 60% で達成
        6.times { |i| add_kept(pact: pact, on: pact.signed_at.to_date + i) }

        described_class.new(pact).call
        pact.reload
        expect(pact.status).to eq("completed")
        expect(pact.completed_at).to be_within(5.seconds).of(Time.current)
      end
    end

    context "compliance_rate が 0.5 未満のとき" do
      it "completed にしない" do
        pact = build_pact(signed_at: 9.days.ago.beginning_of_day, deadline: Time.zone.today)
        # 10 日中 4 日だけ kept = 40%
        4.times { |i| add_kept(pact: pact, on: pact.signed_at.to_date + i) }

        described_class.new(pact).call
        expect(pact.reload.status).to eq("active")
      end
    end

    context "kept が 0 日のとき" do
      it "deadline 到達でも completed にしない" do
        pact = build_pact(signed_at: 1.day.ago.beginning_of_day, deadline: Time.zone.today)
        # check_in 自体無し
        described_class.new(pact).call
        expect(pact.reload.status).to eq("active")
      end
    end

    context "既に completed の pact" do
      it "再度 call しても何もしない（completed 不可逆）" do
        pact = build_pact(signed_at: 9.days.ago.beginning_of_day, deadline: Time.zone.today,
                          status: :completed, completed_at: 1.hour.ago)
        original_completed_at = pact.completed_at

        result = described_class.new(pact).call
        expect(result.reload.status).to eq("completed")
        expect(result.completed_at).to be_within(1.second).of(original_completed_at)
      end
    end

    context "abandoned / failed の pact" do
      it "completed にしない" do
        pact = build_pact(signed_at: 9.days.ago.beginning_of_day, deadline: Time.zone.today,
                          status: :abandoned)
        4.times { |i| add_kept(pact: pact, on: pact.signed_at.to_date + i) }

        described_class.new(pact).call
        expect(pact.reload.status).to eq("abandoned")
      end
    end

    context "期間内に同日 kept が 2 つ（複数契約ではないが念のため）" do
      it "distinct で 1 日扱いになる" do
        pact = build_pact(signed_at: 1.day.ago.beginning_of_day, deadline: Time.zone.today)
        # 同じ日に 2 件 kept があっても 1 日としてカウントされる前提
        # ただし UNIQUE 制約で同じ pact では同日 1 件のみ → ここは scenario として異常系
        add_kept(pact: pact, on: Time.zone.today)
        # 2 日中 1 日 kept = 50% で達成
        described_class.new(pact).call
        expect(pact.reload.status).to eq("completed")
      end
    end

    it "completable な場合に Crest 生成 hook（enqueue_crest_generation_later）が呼ばれる" do
      pact = build_pact(signed_at: 1.day.ago.beginning_of_day, deadline: Time.zone.today)
      add_kept(pact: pact, on: Time.zone.today)

      service = described_class.new(pact)
      expect(service).to receive(:enqueue_crest_generation_later)
      service.call
    end
  end
end
