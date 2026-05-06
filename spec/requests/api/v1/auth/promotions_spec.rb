require "rails_helper"

RSpec.describe "Api::V1::Auth::Promotions", type: :request do
  describe "PATCH /api/v1/auth/promote" do
    let(:promote_params) do
      {
        email: "real@example.com",
        password: "password123",
        password_confirmation: "password123",
        nickname: "勇者"
      }
    end

    context "ゲストユーザーがログイン中" do
      before { post "/api/v1/auth/guest", as: :json }

      it "200 OK を返し、is_guest=false / 入力した email & nickname に更新される" do
        patch "/api/v1/auth/promote", params: promote_params, as: :json

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["email"]).to eq("real@example.com")
        expect(body["nickname"]).to eq("勇者")
        expect(body["is_guest"]).to be false
      end

      it "promote 後は新しい email / password でログインできる" do
        patch "/api/v1/auth/promote", params: promote_params, as: :json
        expect(response).to have_http_status(:ok)

        delete "/api/v1/auth/logout"
        post "/api/v1/auth/login", params: {
          email: "real@example.com", password: "password123"
        }, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "promote 前に作った Pact が引き継がれる" do
        post "/api/v1/pacts", params: {
          goal: "目標", constraint_text: "制約", difficulty: 3,
          deadline: 30.days.from_now.to_date.to_s
        }, as: :json
        expect(response).to have_http_status(:created)
        pact_id = response.parsed_body["id"]

        patch "/api/v1/auth/promote", params: promote_params, as: :json
        expect(response).to have_http_status(:ok)

        # 同じセッションでそのまま自分の Pact を取得できる
        get "/api/v1/pacts/#{pact_id}"
        expect(response).to have_http_status(:ok)
      end
    end

    context "登録済みユーザーがログイン中" do
      let!(:user) do
        create(:user, email: "existing@example.com",
               password: "password123", password_confirmation: "password123", is_guest: false)
      end

      before { post "/api/v1/auth/login", params: { email: "existing@example.com", password: "password123" }, as: :json }

      it "422 Unprocessable Content + not_a_guest コードを返す" do
        patch "/api/v1/auth/promote", params: promote_params, as: :json
        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"][0]["code"]).to eq("not_a_guest")
      end
    end

    context "未ログイン" do
      it "401 Unauthorized" do
        patch "/api/v1/auth/promote", params: promote_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "バリデーションエラー（email 重複）" do
      before do
        create(:user, email: "taken@example.com", is_guest: false)
        post "/api/v1/auth/guest", as: :json
      end

      it "422 + 既存の RecordInvalid 形式のエラーレスポンス" do
        patch "/api/v1/auth/promote", params: promote_params.merge(email: "taken@example.com"), as: :json
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
