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
  end

  describe "GET /api/v1/rankings/streak" do
    let!(:user_streak_10) do
      create(:user, email: "s10@example.com", nickname: "S10", is_public: true, streak_count: 10)
    end
    let!(:user_streak_20) do
      create(:user, email: "s20@example.com", nickname: "S20", is_public: true, streak_count: 20)
    end
    let!(:user_streak_15_private) do
      create(:user, email: "p15@example.com", nickname: "P15", is_public: false, streak_count: 15)
    end

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
  end
end
