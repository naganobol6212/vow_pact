require "rails_helper"

RSpec.describe "Api::V1::Ai::Titles", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) { { email: "test@example.com", password: "password123" } }

  describe "POST /api/v1/ai/titles" do
    let(:fake_openai_response) do
      {
        "choices" => [
          {
            "message" => {
              "content" => '{"titles": ["読書の誓いを刻みし者", "知の戦士", "書見の覚者"]}'
            }
          }
        ]
      }
    end

    context "ログイン中で goal / difficulty が有効な場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return(fake_openai_response)
      end

      it "200 OK を返し、称号案 3 つを返す" do
        post "/api/v1/ai/titles", params: {
          goal: "毎日30分読書する",
          difficulty: 4
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["titles"]).to eq([
          "読書の誓いを刻みし者",
          "知の戦士",
          "書見の覚者"
        ])
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/ai/titles", params: {
          goal: "毎日30分読書する",
          difficulty: 4
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
