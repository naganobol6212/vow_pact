require "rails_helper"

RSpec.describe "Api::V1::Auth::Users", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           nickname: "テスト",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) do
    { email: "test@example.com", password: "password123" }
  end

  describe "GET /api/v1/auth/me" do
    context "ログイン中の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返し、ログイン中ユーザーの情報を返す" do
        get "/api/v1/auth/me", as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["email"]).to eq("test@example.com")
        expect(response.parsed_body["nickname"]).to eq("テスト")
        expect(response.parsed_body).not_to have_key("password_digest")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        get "/api/v1/auth/me", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/auth/me" do
    context "ログイン中で有効な値の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返し、nickname / avatar_url / is_public を更新する" do
        patch "/api/v1/auth/me", params: {
          nickname: "新しい名前",
          avatar_url: "https://example.com/avatar.png",
          is_public: false
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["nickname"]).to eq("新しい名前")
        expect(response.parsed_body["avatar_url"]).to eq("https://example.com/avatar.png")
        expect(response.parsed_body["is_public"]).to eq(false)
      end
    end

    context "ログイン中で nickname が空の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "422 を返し、ユーザーを更新しない" do
        patch "/api/v1/auth/me", params: { nickname: "" }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "nickname" }).to be true
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        patch "/api/v1/auth/me", params: { nickname: "x" }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    # Active Storage の avatar が添付されているとき、avatar_image_url が
    # 正しい絶対 URL（host + protocol が分離されたもの）を返すことを保証する。
    # 旧実装は host: にスキーム込み URL を渡しており URL が壊れていた。
    context "アバター画像が添付されている場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        user.avatar.attach(
          io: StringIO.new("dummy-png"),
          filename: "avatar.png",
          content_type: "image/png"
        )
      end

      it "avatar_image_url が rails_blob_url の形式で返る" do
        get "/api/v1/auth/me", as: :json

        expect(response).to have_http_status(:ok)
        url = response.parsed_body["avatar_image_url"]
        expect(url).to be_a(String)
        # 絶対 URL（http(s):// で始まる）
        expect(url).to match(%r{\Ahttps?://})
        # 重複したスキーム（http://https://...）が混入していない
        expect(url).not_to match(%r{//https?://})
        # Active Storage のパス
        expect(url).to include("/rails/active_storage/")
      end
    end
  end

  describe "PATCH /api/v1/auth/email" do
    context "ログイン中で現パスワードと新メールが有効な場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返し、メールアドレスを更新する" do
        patch "/api/v1/auth/email", params: {
          current_password: "password123",
          email: "newemail@example.com"
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["email"]).to eq("newemail@example.com")
      end
    end

    context "現パスワードが間違っている場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "401 Unauthorized を返す" do
        patch "/api/v1/auth/email", params: {
          current_password: "wrong",
          email: "newemail@example.com"
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(response.parsed_body["errors"][0]["code"]).to eq("invalid_password")
      end
    end

    context "新メールが無効な形式の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "422 を返す" do
        patch "/api/v1/auth/email", params: {
          current_password: "password123",
          email: "invalid"
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "email" }).to be true
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        patch "/api/v1/auth/email", params: {
          current_password: "password123",
          email: "newemail@example.com"
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
