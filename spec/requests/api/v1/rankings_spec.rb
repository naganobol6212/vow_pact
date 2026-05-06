require "rails_helper"

RSpec.describe "Api::V1::Rankings", type: :request do
  let!(:me) do
    create(:user, email: "me@example.com", nickname: "Me",
                  password: "password123", password_confirmation: "password123",
                  is_public: true, streak_count: 5)
  end
  let(:login_params) { { email: "me@example.com", password: "password123" } }

  before { post "/api/v1/auth/login", params: login_params, as: :json }

  # validation skip して completed pact を作るヘルパー
  def make_completed_pact(user:, completed_at:)
    p = build(:pact, user: user, signed_at: 10.days.ago, deadline: 1.day.ago.to_date,
                      status: :completed, completed_at: completed_at)
    p.save!(validate: false)
    p
  end

  # validation skip で pact を作るヘルパー（ランキング母集団に含めるため）
  def make_active_pact(user:)
    p = build(:pact, user: user)
    p.save!(validate: false)
    p
  end

  describe "GET /api/v1/rankings/monthly" do
    let!(:public_user_a) { create(:user, email: "a@example.com", nickname: "A", is_public: true) }
    let!(:public_user_b) { create(:user, email: "b@example.com", nickname: "B", is_public: true) }
    let!(:private_user)  { create(:user, email: "c@example.com", nickname: "C", is_public: false) }

    before do
      # 今月の completed pact を各ユーザーに付与
      3.times { make_completed_pact(user: public_user_a, completed_at: 1.day.ago) }
      2.times { make_completed_pact(user: public_user_b, completed_at: 1.day.ago) }
      5.times { make_completed_pact(user: private_user,  completed_at: 1.day.ago) }
      1.times { make_completed_pact(user: me, completed_at: 1.day.ago) }
      # 先月の completed は対象外
      make_completed_pact(user: public_user_a, completed_at: 2.months.ago)
    end

    it "200 OK で月情報・ランキング配列・my_rank を返す" do
      get "/api/v1/rankings/monthly"
      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body["month"]).to eq(Time.zone.today.strftime("%Y-%m"))
      expect(body["rankings"]).to be_an(Array)
      expect(body["my_rank"]).to be_a(Hash)
    end

    it "is_public=true のユーザーのみ rankings に含まれる（private user は除外）" do
      get "/api/v1/rankings/monthly"
      ranked_ids = response.parsed_body["rankings"].map { |r| r["user"]["id"] }
      expect(ranked_ids).not_to include(private_user.id)
    end

    it "achievement_count 降順で並ぶ（A=3 > B=2 > Me=1）" do
      get "/api/v1/rankings/monthly"
      list = response.parsed_body["rankings"]
      expect(list.first["user"]["id"]).to eq(public_user_a.id)
      expect(list.first["achievement_count"]).to eq(3)
    end

    it "my_rank には自分の今月達成数が含まれる（自分が public でランクインしていれば rank も）" do
      get "/api/v1/rankings/monthly"
      my_rank = response.parsed_body["my_rank"]
      expect(my_rank["achievement_count"]).to eq(1)
      expect(my_rank["rank"]).to be_a(Integer) # 3 位想定（A=3, B=2, Me=1）
    end

    it "未ログインなら 401" do
      delete "/api/v1/auth/logout"
      get "/api/v1/rankings/monthly"
      expect(response).to have_http_status(:unauthorized)
    end

    context "dense rank / タイブレーク / TOP_LIMIT 仕様" do
      it "achievement_count 同点は dense rank で同順位、updated_at asc → id asc で並ぶ" do
        # me / public_user_a / public_user_b の既存データはクリア
        Pact.delete_all
        # 同点（達成数 2）のユーザーを 2 人用意（updated_at に差をつける）
        u_old = create(:user, email: "old@example.com", nickname: "Old",
                              is_public: true, updated_at: 2.days.ago)
        u_new = create(:user, email: "new@example.com", nickname: "New",
                              is_public: true, updated_at: 1.day.ago)
        2.times { make_completed_pact(user: u_old, completed_at: 1.day.ago) }
        2.times { make_completed_pact(user: u_new, completed_at: 1.day.ago) }

        get "/api/v1/rankings/monthly"
        list = response.parsed_body["rankings"]
        # 同点のスコアを持つユーザーは dense rank（同順位）
        same_score = list.select { |r| r["achievement_count"] == 2 }
        expect(same_score.size).to eq(2)
        expect(same_score.map { |r| r["rank"] }.uniq.size).to eq(1)
        # tie breaker: updated_at が古い方が先
        expect(same_score.map { |r| r["user"]["id"] }).to eq([ u_old.id, u_new.id ])
      end

      it "上位 10 件まで表示（同点タイは超過 OK だが基本は TOP_LIMIT）" do
        Pact.delete_all
        # 達成数を 1〜15 で用意（全員 public、is_public=true）
        15.times do |i|
          u = create(:user, email: "u#{i}@example.com", nickname: "U#{i}", is_public: true)
          (i + 1).times { make_completed_pact(user: u, completed_at: 1.day.ago) }
        end

        get "/api/v1/rankings/monthly"
        list = response.parsed_body["rankings"]
        # me は Pact.delete_all で pact が無くなるため母集団外。15 ユーザー中上位 10。
        expect(list.size).to eq(10)
        expect(list.first["achievement_count"]).to eq(15)
        expect(list.last["achievement_count"]).to eq(6)
      end
    end

    context "母集団: 契約を持つ public ユーザー" do
      it "達成 0 件でも、契約を 1 件以上持つ public ユーザーは母集団に含まれる" do
        Pact.delete_all
        u_zero = create(:user, email: "zeroa@example.com", nickname: "ZeroA", is_public: true)
        make_active_pact(user: u_zero) # active な pact のみ（completed なし）

        get "/api/v1/rankings/monthly"
        list = response.parsed_body["rankings"]
        ids = list.map { |r| r["user"]["id"] }
        expect(ids).to include(u_zero.id)
        zero_entry = list.find { |r| r["user"]["id"] == u_zero.id }
        expect(zero_entry["achievement_count"]).to eq(0)
      end

      it "契約を 1 件も持たない public ユーザーは母集団から除外される" do
        Pact.delete_all
        u_no_pact = create(:user, email: "noptm@example.com", nickname: "NoPactM", is_public: true)

        get "/api/v1/rankings/monthly"
        ids = response.parsed_body["rankings"].map { |r| r["user"]["id"] }
        expect(ids).not_to include(u_no_pact.id)
      end
    end
  end

  describe "GET /api/v1/rankings/streak" do
    let!(:user_streak_10) do
      u = create(:user, email: "s10@example.com", nickname: "S10", is_public: true, streak_count: 10)
      make_active_pact(user: u)
      u
    end
    let!(:user_streak_20) do
      u = create(:user, email: "s20@example.com", nickname: "S20", is_public: true, streak_count: 20)
      make_active_pact(user: u)
      u
    end
    let!(:user_streak_15_private) do
      u = create(:user, email: "p15@example.com", nickname: "P15", is_public: false, streak_count: 15)
      make_active_pact(user: u)
      u
    end

    # me（streak_count: 5、is_public: true）にも pact を 1 件付与（母集団に入れるため）
    before { make_active_pact(user: me) }

    it "200 OK で rankings 配列と my_rank を返す" do
      get "/api/v1/rankings/streak"
      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body["rankings"]).to be_an(Array)
      expect(body["my_rank"]).to be_a(Hash)
    end

    it "is_public=false のユーザーは rankings に含まれない" do
      get "/api/v1/rankings/streak"
      ranked_ids = response.parsed_body["rankings"].map { |r| r["user"]["id"] }
      expect(ranked_ids).not_to include(user_streak_15_private.id)
    end

    it "streak_count 降順（S20=20 が 1 位）" do
      get "/api/v1/rankings/streak"
      list = response.parsed_body["rankings"]
      expect(list.first["user"]["id"]).to eq(user_streak_20.id)
      expect(list.first["streak_count"]).to eq(20)
    end

    it "my_rank には自分の streak_count が含まれる（rank も）" do
      get "/api/v1/rankings/streak"
      my_rank = response.parsed_body["my_rank"]
      expect(my_rank["streak_count"]).to eq(5)
      # 自分の上位 = S20(20), S10(10) → 自分は 3 位
      expect(my_rank["rank"]).to eq(3)
    end

    it "未ログインなら 401" do
      delete "/api/v1/auth/logout"
      get "/api/v1/rankings/streak"
      expect(response).to have_http_status(:unauthorized)
    end

    context "dense rank / タイブレーク / TOP_LIMIT 仕様" do
      it "streak_count 同点は dense rank で同順位、updated_at asc → id asc で並ぶ" do
        # 既存ユーザーは別スコアなので、新規に同点ユーザーを 2 人作る（pact 必須）
        u_old = create(:user, email: "tiel@example.com", nickname: "TieOld",
                              is_public: true, streak_count: 7, updated_at: 2.days.ago)
        u_new = create(:user, email: "tien@example.com", nickname: "TieNew",
                              is_public: true, streak_count: 7, updated_at: 1.day.ago)
        make_active_pact(user: u_old)
        make_active_pact(user: u_new)

        get "/api/v1/rankings/streak"
        list = response.parsed_body["rankings"]
        same_score = list.select { |r| r["streak_count"] == 7 }
        expect(same_score.size).to eq(2)
        expect(same_score.map { |r| r["rank"] }.uniq.size).to eq(1)
        expect(same_score.map { |r| r["user"]["id"] }).to eq([ u_old.id, u_new.id ])
      end

      it "上位 10 件まで表示" do
        # 既存ユーザーをクリアしないので 15 人分追加（全員 pact を持つ）
        15.times do |i|
          u = create(:user, email: "us#{i}@example.com", nickname: "US#{i}",
                            is_public: true, streak_count: 100 + i)
          make_active_pact(user: u)
        end

        get "/api/v1/rankings/streak"
        list = response.parsed_body["rankings"]
        expect(list.size).to eq(10)
        # 一番大きい streak（100+14=114）が 1 位
        expect(list.first["streak_count"]).to eq(114)
      end
    end

    context "母集団: 契約を持つ public ユーザー" do
      it "streak_count = 0 でも、契約を 1 件以上持っていれば母集団に含まれる" do
        u_zero = create(:user, email: "zerost@example.com", nickname: "ZeroSt",
                                is_public: true, streak_count: 0)
        make_active_pact(user: u_zero)

        get "/api/v1/rankings/streak"
        ids = response.parsed_body["rankings"].map { |r| r["user"]["id"] }
        expect(ids).to include(u_zero.id)
        zero_entry = response.parsed_body["rankings"].find { |r| r["user"]["id"] == u_zero.id }
        expect(zero_entry["streak_count"]).to eq(0)
      end

      it "契約を 1 件も持たない public ユーザーは母集団から除外される" do
        u_no_pact = create(:user, email: "nopst@example.com", nickname: "NoPactSt",
                                  is_public: true, streak_count: 50)

        get "/api/v1/rankings/streak"
        ids = response.parsed_body["rankings"].map { |r| r["user"]["id"] }
        expect(ids).not_to include(u_no_pact.id)
      end
    end
  end
end
