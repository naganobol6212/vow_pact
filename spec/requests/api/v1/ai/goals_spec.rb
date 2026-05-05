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

    context "ログイン中で theme が空（おまかせ／ランダムモード）の場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
      end

      it "theme なしでも 200 OK を返し、目標案 3 つを返す" do
        # GoalSuggester がランダムモードのプロンプトで呼ばれることを期待
        expect_any_instance_of(::Ai::GoalSuggester).to receive(:suggest)
          .with(theme: "")
          .and_return([ "朝5時に起きる", "毎日1ページ哲学書を読む", "週1で新しい料理に挑戦" ])

        post "/api/v1/ai/goals", params: {}, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["goals"].size).to eq(3)
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

    context "OpenAI への接続でネットワークエラーが発生した場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat)
          .and_raise(Faraday::ConnectionFailed.new("connection refused"))
      end

      it "502 Bad Gateway を返し ai_upstream_error を返す" do
        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json

        expect(response).to have_http_status(:bad_gateway)
        expect(response.parsed_body["errors"][0]["code"]).to eq("ai_upstream_error")
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
