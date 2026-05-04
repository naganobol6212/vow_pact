require "rails_helper"

RSpec.describe "Api::V1::Auth::Passwords", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) do
    { email: "test@example.com", password: "password123" }
  end

  describe "PATCH /api/v1/auth/password" do
    context "ログイン中で現パスワードと新パスワードが有効な場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "204 No Content を返し、新パスワードでログインできる" do
        patch "/api/v1/auth/password", params: {
          current_password: "password123",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }, as: :json

        expect(response).to have_http_status(:no_content)

        # ログアウトして新パスワードでログイン
        delete "/api/v1/auth/logout", as: :json
        post "/api/v1/auth/login",
             params: { email: "test@example.com", password: "newpassword456" },
             as: :json
        expect(response).to have_http_status(:ok)
      end
    end

    context "現パスワードが間違っている場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "401 Unauthorized を返す" do
        patch "/api/v1/auth/password", params: {
          current_password: "wrong",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["errors"][0]["code"]).to eq("invalid_password")
      end
    end

    context "新パスワードが短すぎる場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "422 を返す" do
        patch "/api/v1/auth/password", params: {
          current_password: "password123",
          password: "abc",
          password_confirmation: "abc"
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "password" }).to be true
      end
    end

    context "新パスワードと確認が一致しない場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "422 を返す" do
        patch "/api/v1/auth/password", params: {
          current_password: "password123",
          password: "newpassword456",
          password_confirmation: "different789"
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "password_confirmation" }).to be true
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        patch "/api/v1/auth/password", params: {
          current_password: "password123",
          password: "newpassword456",
          password_confirmation: "newpassword456"
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
