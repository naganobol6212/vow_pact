require "rails_helper"

RSpec.describe "Api::V1::Auth::Guests", type: :request do
  describe "POST /api/v1/auth/guest" do
    it "201 Created を返し、is_guest=true のユーザーを作成 + ログイン状態にする" do
      expect {
        post "/api/v1/auth/guest", as: :json
      }.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      body = response.parsed_body
      expect(body["nickname"]).to eq(User::GUEST_NICKNAME)
      expect(body["is_guest"]).to be true

      # 即時ログイン状態：/me が 200 を返す
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:ok)
    end

    it "未認証でも 401 にならない（ゲスト作成は誰でも可能）" do
      post "/api/v1/auth/guest", as: :json
      expect(response).not_to have_http_status(:unauthorized)
    end

    it "ゲストユーザーで Pact を作成できる" do
      post "/api/v1/auth/guest", as: :json
      expect(response).to have_http_status(:created)

      post "/api/v1/pacts", params: {
        goal: "毎日 30 分歩く",
        constraint_text: "夜 22 時以降スマホを触らない",
        difficulty: 3,
        deadline: 30.days.from_now.to_date.to_s
      }, as: :json

      expect(response).to have_http_status(:created)
    end
  end
end
