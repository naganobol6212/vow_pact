require "rails_helper"

RSpec.describe StreakCalculator, type: :service do
  let(:user) { create(:user, streak_count: 0, longest_streak: 0) }

  # コールバックの自動再計算と独立して挙動を検証したいので、
  # save 時のコールバックをスキップしてレコードを直接作る。
  def add_check_in(pact:, on:, status: :kept)
    pact.check_ins.new(checked_on: on, status: status).save!(validate: false)
  end

  describe "#call" do
    context "チェックインが 0 件のとき" do
      it "streak_count = 0、longest_streak = 0" do
        described_class.new(user).call
        expect(user.reload.streak_count).to eq(0)
        expect(user.longest_streak).to eq(0)
      end
    end

    context "今日 kept がある場合" do
      it "streak_count = 1" do
        pact = create(:pact, user: user, signed_at: 7.days.ago)
        add_check_in(pact: pact, on: Date.current, status: :kept)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(1)
      end
    end

    context "今日と昨日 kept があれば" do
      it "streak_count = 2" do
        pact = create(:pact, user: user, signed_at: 7.days.ago)
        add_check_in(pact: pact, on: Date.current - 1, status: :kept)
        add_check_in(pact: pact, on: Date.current,     status: :kept)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(2)
      end
    end

    context "今日も昨日も kept が無いなら" do
      it "streak_count = 0（古い連続は失効）" do
        pact = create(:pact, user: user, signed_at: 10.days.ago)
        # 一昨日まで連続 kept だが、昨日と今日は kept 無し
        add_check_in(pact: pact, on: Date.current - 5, status: :kept)
        add_check_in(pact: pact, on: Date.current - 4, status: :kept)
        add_check_in(pact: pact, on: Date.current - 3, status: :kept)
        add_check_in(pact: pact, on: Date.current - 2, status: :kept)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(0)
      end
    end

    context "起点が「昨日」の場合（今日まだ kept していない）" do
      it "昨日から逆順に kept が連続している日数を返す" do
        pact = create(:pact, user: user, signed_at: 10.days.ago)
        add_check_in(pact: pact, on: Date.current - 3, status: :kept)
        add_check_in(pact: pact, on: Date.current - 2, status: :kept)
        add_check_in(pact: pact, on: Date.current - 1, status: :kept)
        # 今日はまだチェックインしていない

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(3)
      end
    end

    context "broken が間に挟まると連続が切れる" do
      it "broken の翌日以降の連続だけがカウント" do
        pact = create(:pact, user: user, signed_at: 10.days.ago)
        add_check_in(pact: pact, on: Date.current - 3, status: :kept)
        add_check_in(pact: pact, on: Date.current - 2, status: :broken)  # ← ここで切れる
        add_check_in(pact: pact, on: Date.current - 1, status: :kept)
        add_check_in(pact: pact, on: Date.current,     status: :kept)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(2)
      end
    end

    context "skipped は streak を切らないが伸ばさない" do
      it "間に skipped があっても連続は維持" do
        pact = create(:pact, user: user, signed_at: 10.days.ago)
        add_check_in(pact: pact, on: Date.current - 3, status: :kept)
        add_check_in(pact: pact, on: Date.current - 2, status: :skipped) # ← 伸ばさず切らず
        add_check_in(pact: pact, on: Date.current - 1, status: :kept)
        add_check_in(pact: pact, on: Date.current,     status: :kept)

        described_class.new(user).call
        # 当日 + 昨日 + skipped 飛ばし + 一昨々日 kept = 3 日カウント
        expect(user.reload.streak_count).to eq(3)
      end

      it "全部 skipped の日が続いても streak は伸びない" do
        pact = create(:pact, user: user, signed_at: 10.days.ago)
        add_check_in(pact: pact, on: Date.current - 1, status: :skipped)
        add_check_in(pact: pact, on: Date.current,     status: :skipped)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(0)
      end
    end

    context "複数契約があっても 1 日 1 カウント" do
      it "同日に契約 A も B も kept なら 1 日として扱う" do
        pact_a = create(:pact, user: user, signed_at: 7.days.ago)
        pact_b = create(:pact, user: user, signed_at: 7.days.ago)
        add_check_in(pact: pact_a, on: Date.current, status: :kept)
        add_check_in(pact: pact_b, on: Date.current, status: :kept)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(1)
      end
    end

    context "abandoned / completed 契約のチェックインも履歴として含める" do
      it "過去達成は奪わない（abandoned 後もその日数はカウント）" do
        pact = create(:pact, user: user, signed_at: 10.days.ago)
        add_check_in(pact: pact, on: Date.current - 1, status: :kept)
        add_check_in(pact: pact, on: Date.current,     status: :kept)
        # 後から契約を abandon
        pact.update!(status: :abandoned)

        described_class.new(user).call
        expect(user.reload.streak_count).to eq(2)
      end
    end

    context "longest_streak の更新" do
      it "現在 streak が過去最長を超えたら更新する" do
        user.update!(longest_streak: 1)
        pact = create(:pact, user: user, signed_at: 7.days.ago)
        add_check_in(pact: pact, on: Date.current - 2, status: :kept)
        add_check_in(pact: pact, on: Date.current - 1, status: :kept)
        add_check_in(pact: pact, on: Date.current,     status: :kept)

        described_class.new(user).call
        expect(user.reload.longest_streak).to eq(3)
      end

      it "現在 streak が過去最長を下回るときは過去最長を維持する" do
        user.update!(longest_streak: 10)
        pact = create(:pact, user: user, signed_at: 7.days.ago)
        add_check_in(pact: pact, on: Date.current, status: :kept)

        described_class.new(user).call
        expect(user.reload.longest_streak).to eq(10)
      end
    end

    context "別ユーザーの check_in は自分の streak に影響しない" do
      it "他人の kept はカウントされない" do
        other = create(:user)
        other_pact = create(:pact, user: other, signed_at: 7.days.ago)
        add_check_in(pact: other_pact, on: Date.current, status: :kept)

        # 自分は何も check_in していない
        described_class.new(user).call
        expect(user.reload.streak_count).to eq(0)
      end
    end
  end
end
