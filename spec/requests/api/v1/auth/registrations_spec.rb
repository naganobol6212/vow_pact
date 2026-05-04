require "rails_helper"

RSpec.describe "Api::V1::Auth::Registrations", type: :request do
  describe "POST /api/v1/auth/signup" do
    context "有効なパラメータの場合" do
      let(:valid_params) do
        {
          email: "newuser@example.com",
          nickname: "新規ユーザー",
          password: "password123",
          password_confirmation: "password123"
        }
      end

      it "201 Created を返し、ユーザーを作成する" do
        expect {
          post "/api/v1/auth/signup", params: valid_params, as: :json
        }.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["email"]).to eq("newuser@example.com")
        expect(response.parsed_body["nickname"]).to eq("新規ユーザー")
        expect(response.parsed_body).not_to have_key("password_digest")
      end
    end

    context "email が空の場合" do
      let(:invalid_params) do
        {
          email: "",
          nickname: "新規ユーザー",
          password: "password123",
          password_confirmation: "password123"
        }
      end

      it "422 Unprocessable Content を返し、ユーザーを作成しない" do
        expect {
          post "/api/v1/auth/signup", params: invalid_params, as: :json
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"]).to be_an(Array)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "email" }).to be true
      end
    end

    context "email が重複する場合" do
      before { create(:user, email: "newuser@example.com") }

      let(:duplicate_params) do
        {
          email: "newuser@example.com",
          nickname: "別のユーザー",
          password: "password123",
          password_confirmation: "password123"
        }
      end

      it "422 を返し、ユーザーを作成しない" do
        expect {
          post "/api/v1/auth/signup", params: duplicate_params, as: :json
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "email" }).to be true
      end
    end

    context "password が短い場合（6 文字未満）" do
      let(:short_password_params) do
        {
          email: "shortpw@example.com",
          nickname: "新規ユーザー",
          password: "abc",
          password_confirmation: "abc"
        }
      end

      it "422 を返し、ユーザーを作成しない" do
        expect {
          post "/api/v1/auth/signup", params: short_password_params, as: :json
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "password" }).to be true
      end
    end

    context "password と password_confirmation が一致しない場合" do
      let(:mismatch_params) do
        {
          email: "mismatch@example.com",
          nickname: "新規ユーザー",
          password: "password123",
          password_confirmation: "different456"
        }
      end

      it "422 を返し、ユーザーを作成しない" do
        expect {
          post "/api/v1/auth/signup", params: mismatch_params, as: :json
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "password_confirmation" }).to be true
      end
    end
  end
end
