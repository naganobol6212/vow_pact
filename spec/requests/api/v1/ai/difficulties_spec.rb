require "rails_helper"

RSpec.describe "Api::V1::Ai::Difficulties", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) { { email: "test@example.com", password: "password123" } }

  describe "POST /api/v1/ai/difficulties" do
    let(:fake_openai_response) do
      {
        "choices" => [
          {
            "message" => {
              "content" => '{"difficulty": 4, "reason": "毎日継続が必要で、複数の制約が連動するため高い"}'
            }
          }
        ]
      }
    end

    context "ログイン中で goal / constraint_text / deadline が有効な場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return(fake_openai_response)
      end

      it "200 OK を返し、難易度 1〜5 と理由を返す" do
        post "/api/v1/ai/difficulties", params: {
          goal: "毎日30分読書する",
          constraint_text: "スマホを別室に置く",
          deadline: 30.days.from_now.to_date.to_s
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["difficulty"]).to eq(4)
        expect(response.parsed_body["reason"]).to be_a(String)
        expect(response.parsed_body["reason"]).not_to be_empty
      end
    end

    context "OpenAI が範囲外の難易度を返した場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return({
          "choices" => [ { "message" => { "content" => '{"difficulty": 99, "reason": "..."}' } } ]
        })
      end

      it "1〜5 の範囲にクランプして返す" do
        post "/api/v1/ai/difficulties", params: {
          goal: "x", constraint_text: "y", deadline: 30.days.from_now.to_date.to_s
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["difficulty"]).to eq(5)
      end
    end

    context "OpenAI が不正な JSON を返した場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return({
          "choices" => [ { "message" => { "content" => "JSON ではない" } } ]
        })
      end

      it "502 Bad Gateway を返し ai_parse_error を返す" do
        post "/api/v1/ai/difficulties", params: {
          goal: "x", constraint_text: "y", deadline: 30.days.from_now.to_date.to_s
        }, as: :json

        expect(response).to have_http_status(:bad_gateway)
        expect(response.parsed_body["errors"][0]["code"]).to eq("ai_parse_error")
      end
    end

    context "OpenAI への接続でネットワークエラーが発生した場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat)
          .and_raise(Faraday::ConnectionFailed.new("connection refused"))
      end

      it "502 Bad Gateway を返し ai_upstream_error を返す" do
        post "/api/v1/ai/difficulties", params: {
          goal: "x", constraint_text: "y", deadline: 30.days.from_now.to_date.to_s
        }, as: :json

        expect(response).to have_http_status(:bad_gateway)
        expect(response.parsed_body["errors"][0]["code"]).to eq("ai_upstream_error")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/ai/difficulties", params: {
          goal: "x", constraint_text: "y", deadline: 30.days.from_now.to_date.to_s
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
