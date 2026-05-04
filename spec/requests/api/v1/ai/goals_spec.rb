require "rails_helper"

RSpec.describe "Api::V1::Ai::Goals", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) { { email: "test@example.com", password: "password123" } }

  describe "POST /api/v1/ai/goals" do
    let(:fake_openai_response) do
      {
        "choices" => [
          {
            "message" => {
              "content" => '{"goals": ["毎日30分読書する", "早起きを習慣化する", "週3回運動する"]}'
            }
          }
        ]
      }
    end

    context "ログイン中で theme が有効な場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return(fake_openai_response)
      end

      it "200 OK を返し、目標案 3 つを返す" do
        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["goals"]).to eq([
          "毎日30分読書する",
          "早起きを習慣化する",
          "週3回運動する"
        ])
      end
    end

    context "OpenAI が不正な JSON を返した場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return({
          "choices" => [ { "message" => { "content" => "これは JSON ではない" } } ]
        })
      end

      it "502 Bad Gateway を返す" do
        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json

        expect(response).to have_http_status(:bad_gateway)
        expect(response.parsed_body["errors"][0]["code"]).to eq("ai_parse_error")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
