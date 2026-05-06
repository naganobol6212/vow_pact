require "rails_helper"

RSpec.describe "Api::V1::Auth::Sessions", type: :request do
  describe "POST /api/v1/auth/login" do
    let!(:user) do
      create(:user,
             email: "test@example.com",
             password: "password123",
             password_confirmation: "password123")
    end

    context "有効な認証情報の場合" do
      let(:valid_params) do
        {
          email: "test@example.com",
          password: "password123"
        }
      end

      it "200 OK を返し、ユーザー情報を返す" do
        post "/api/v1/auth/login", params: valid_params, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["email"]).to eq("test@example.com")
        expect(response.parsed_body).not_to have_key("password_digest")
      end
    end

    context "email が存在しない場合" do
      let(:invalid_email_params) do
        {
          email: "nonexistent@example.com",
          password: "password123"
        }
      end

      it "401 Unauthorized を返す" do
        post "/api/v1/auth/login", params: invalid_email_params, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["errors"][0]["code"]).to eq("invalid_credentials")
      end
    end

    context "password が間違っている場合" do
      let(:wrong_password_params) do
        {
          email: "test@example.com",
          password: "wrongpassword"
        }
      end

      it "401 Unauthorized を返す" do
        post "/api/v1/auth/login", params: wrong_password_params, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["errors"][0]["code"]).to eq("invalid_credentials")
      end
    end
  end

  describe "DELETE /api/v1/auth/logout" do
    let!(:user) do
      create(:user,
             email: "test@example.com",
             password: "password123",
             password_confirmation: "password123")
    end

    context "ログイン中の場合" do
      before do
        post "/api/v1/auth/login",
             params: { email: "test@example.com", password: "password123" },
             as: :json
      end

      it "204 No Content を返す" do
        delete "/api/v1/auth/logout", as: :json

        expect(response).to have_http_status(:no_content)
      end
    end

    context "未ログインの場合" do
      it "204 No Content を返す（idempotent ログアウト）" do
        # 未ログインで叩いても 401 にせず 204 を返すことで、二重押し / セッション期限切れ後でも
        # クライアントは安全に「ログアウト済み状態」へ遷移できる。
        delete "/api/v1/auth/logout", as: :json

        expect(response).to have_http_status(:no_content)
      end
    end
  end
end
