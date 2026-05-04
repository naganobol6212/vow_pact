require "rails_helper"

RSpec.describe "Api::V1::Pacts", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) { { email: "test@example.com", password: "password123" } }

  describe "POST /api/v1/pacts" do
    let(:valid_params) do
      {
        goal: "毎日30分読書する",
        constraint_text: "スマホを別室に置く",
        difficulty: 3,
        deadline: 30.days.from_now.to_date.to_s,
        signed_at: Time.current.iso8601
      }
    end

    context "ログイン中で有効なパラメータの場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "201 Created を返し、契約を作成する" do
        expect {
          post "/api/v1/pacts", params: valid_params, as: :json
        }.to change(Pact, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["goal"]).to eq("毎日30分読書する")
        expect(response.parsed_body["status"]).to eq("active")
        expect(response.parsed_body["user_id"]).to eq(user.id)
      end
    end

    context "active な契約が既に 3 つある場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        3.times { create(:pact, user: user, status: :active) }
      end

      it "422 を返し、4 つ目を作成しない" do
        expect {
          post "/api/v1/pacts", params: valid_params, as: :json
        }.not_to change(Pact, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "base" }).to be true
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/pacts", params: valid_params, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/pacts" do
    context "ログイン中の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      let!(:my_pact_active) { create(:pact, user: user, status: :active, goal: "自分の active") }
      let!(:my_pact_completed) { create(:pact, user: user, status: :completed, goal: "自分の完了", completed_at: 1.day.ago) }
      let!(:other_user_pact) do
        other_user = create(:user)
        create(:pact, user: other_user, status: :active, goal: "他人の契約")
      end

      it "200 OK を返し、自分の契約のみを返す" do
        get "/api/v1/pacts", as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to be_an(Array)
        expect(response.parsed_body.size).to eq(2)

        goals = response.parsed_body.map { |p| p["goal"] }
        expect(goals).to include("自分の active", "自分の完了")
        expect(goals).not_to include("他人の契約")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        get "/api/v1/pacts", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
