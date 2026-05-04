require "rails_helper"

RSpec.describe "Api::V1::Ai::Constraints", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) { { email: "test@example.com", password: "password123" } }

  describe "POST /api/v1/ai/constraints" do
    let(:fake_openai_response) do
      {
        "choices" => [
          {
            "message" => {
              "content" => '{"constraints": ["スマホを別室に置く", "甘いものを断つ", "TVを見ない"]}'
            }
          }
        ]
      }
    end

    context "ログイン中で goal が有効な場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return(fake_openai_response)
      end

      it "200 OK を返し、制約案 3 つを返す" do
        post "/api/v1/ai/constraints", params: { goal: "毎日30分読書する" }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["constraints"]).to eq([
          "スマホを別室に置く",
          "甘いものを断つ",
          "TVを見ない"
        ])
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
        post "/api/v1/ai/constraints", params: { goal: "毎日30分読書する" }, as: :json

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
        post "/api/v1/ai/constraints", params: { goal: "毎日30分読書する" }, as: :json

        expect(response).to have_http_status(:bad_gateway)
        expect(response.parsed_body["errors"][0]["code"]).to eq("ai_upstream_error")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/ai/constraints", params: { goal: "毎日30分読書する" }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
