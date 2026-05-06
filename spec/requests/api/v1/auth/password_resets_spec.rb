require "rails_helper"

RSpec.describe "Api::V1::Auth::PasswordResets", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "oldpass1234",
           password_confirmation: "oldpass1234")
  end

  describe "POST /api/v1/auth/password_resets" do
    it "存在する email に対して 202 Accepted を返し、トークンを発行 + メールを enqueue" do
      expect {
        expect {
          post "/api/v1/auth/password_resets", params: { email: "test@example.com" }, as: :json
        }.to have_enqueued_mail(PasswordsMailer, :reset)
      }.to change(PasswordResetToken, :count).by(1)

      expect(response).to have_http_status(:accepted)
    end

    it "存在しない email でも 202 Accepted を返す（user enumeration 防止）" do
      expect {
        post "/api/v1/auth/password_resets", params: { email: "nope@example.com" }, as: :json
      }.not_to change(PasswordResetToken, :count)

      expect(response).to have_http_status(:accepted)
    end

    it "ゲストユーザーには発行しない（is_guest=true）" do
      guest = User.create_guest!
      expect {
        post "/api/v1/auth/password_resets", params: { email: guest.email }, as: :json
      }.not_to change(PasswordResetToken, :count)

      expect(response).to have_http_status(:accepted)
    end

    it "email の大文字 / 余白を吸収する" do
      expect {
        post "/api/v1/auth/password_resets", params: { email: "  TEST@EXAMPLE.COM  " }, as: :json
      }.to change(PasswordResetToken, :count).by(1)
    end

    it "レート制限：1 時間に RESET_RATE_LIMIT 回を超えるとそれ以上発行しない（が 202 は返す）" do
      Api::V1::Auth::PasswordResetsController::RESET_RATE_LIMIT.times do
        create(:password_reset_token, user: user, created_at: 30.minutes.ago)
      end

      expect {
        post "/api/v1/auth/password_resets", params: { email: "test@example.com" }, as: :json
      }.not_to change(PasswordResetToken, :count)

      expect(response).to have_http_status(:accepted)
    end
  end

  describe "GET /api/v1/auth/password_resets/:token" do
    it "有効なトークンなら 200 OK + valid: true" do
      token = PasswordResetToken.issue_for!(user)
      get "/api/v1/auth/password_resets/#{token.token}"
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["valid"]).to be true
    end

    it "存在しないトークンなら 404" do
      get "/api/v1/auth/password_resets/nonexistent"
      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["errors"][0]["code"]).to eq("invalid_or_expired_token")
    end

    it "期限切れトークンなら 404" do
      token = PasswordResetToken.issue_for!(user)
      token.update_columns(expires_at: 1.minute.ago)
      get "/api/v1/auth/password_resets/#{token.token}"
      expect(response).to have_http_status(:not_found)
    end

    it "使用済みトークンなら 404" do
      token = PasswordResetToken.issue_for!(user)
      token.update_columns(used_at: Time.current)
      get "/api/v1/auth/password_resets/#{token.token}"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PATCH /api/v1/auth/password_resets/:token" do
    let(:new_password_params) do
      { password: "newpass1234", password_confirmation: "newpass1234" }
    end

    it "有効なトークンで 204 を返し、パスワードを更新する" do
      token = PasswordResetToken.issue_for!(user)
      patch "/api/v1/auth/password_resets/#{token.token}", params: new_password_params, as: :json

      expect(response).to have_http_status(:no_content)
      expect(user.reload.authenticate("newpass1234")).to eq(user)
    end

    it "更新後はトークンが used_at 付きで使用済みになる" do
      token = PasswordResetToken.issue_for!(user)
      patch "/api/v1/auth/password_resets/#{token.token}", params: new_password_params, as: :json

      expect(token.reload.used_at).to be_present
    end

    it "存在しないトークンなら 404" do
      patch "/api/v1/auth/password_resets/nonexistent", params: new_password_params, as: :json
      expect(response).to have_http_status(:not_found)
    end

    it "期限切れトークンなら 422 + invalid_or_expired_token" do
      token = PasswordResetToken.issue_for!(user)
      token.update_columns(expires_at: 1.minute.ago)
      patch "/api/v1/auth/password_resets/#{token.token}", params: new_password_params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body["errors"][0]["code"]).to eq("invalid_or_expired_token")
    end

    it "使用済みトークンなら 422" do
      token = PasswordResetToken.issue_for!(user)
      token.update_columns(used_at: Time.current)
      patch "/api/v1/auth/password_resets/#{token.token}", params: new_password_params, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "password と confirmation が一致しないと 422" do
      token = PasswordResetToken.issue_for!(user)
      patch "/api/v1/auth/password_resets/#{token.token}",
            params: { password: "newpass1234", password_confirmation: "different" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it "短すぎるパスワードは 422" do
      token = PasswordResetToken.issue_for!(user)
      patch "/api/v1/auth/password_resets/#{token.token}",
            params: { password: "12345", password_confirmation: "12345" }, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
