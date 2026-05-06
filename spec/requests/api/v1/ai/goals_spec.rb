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

      it "ai_generations に success ログが記録される" do
        expect {
          post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json
        }.to change(AiGeneration, :count).by(1)

        ai = AiGeneration.last
        expect(ai.user).to eq(user)
        expect(ai.generation_type).to eq("goal_suggestion")
        expect(ai.status).to eq("success")
        expect(ai.input_data).to eq("theme" => "健康")
        expect(ai.model).to eq("gpt-5.4-nano")
        expect(ai.latency_ms).to be >= 0
      end
    end

    context "レート制限（1 分間に AI_RATE_LIMIT 回まで）" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        allow_any_instance_of(OpenAI::Client).to receive(:chat).and_return(fake_openai_response)
      end

      it "上限を超えると 429 Too Many Requests を返す" do
        # 過去 1 分以内の AI ログを 10 件作る
        RateLimited::AI_RATE_LIMIT.times do
          create(:ai_generation, user: user, generation_type: :goal_suggestion, created_at: 30.seconds.ago)
        end

        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json

        expect(response).to have_http_status(:too_many_requests)
        expect(response.parsed_body["errors"][0]["code"]).to eq("rate_limit_exceeded")
      end

      it "1 分以上前のログはカウントしない（窓のリセット）" do
        # 1 分以上前のログ 10 件は対象外
        RateLimited::AI_RATE_LIMIT.times do
          create(:ai_generation, user: user, generation_type: :goal_suggestion, created_at: 2.minutes.ago)
        end

        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json
        expect(response).to have_http_status(:ok)
      end

      it "他ユーザーのログはカウントしない" do
        other_user = create(:user, email: "other@example.com")
        RateLimited::AI_RATE_LIMIT.times do
          create(:ai_generation, user: other_user, generation_type: :goal_suggestion, created_at: 30.seconds.ago)
        end

        post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json
        expect(response).to have_http_status(:ok)
      end
    end

    context "失敗時のロギング" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
      end

      it "Faraday エラー時は failed ステータスで AiGeneration が記録され、502 が返る" do
        allow_any_instance_of(OpenAI::Client).to receive(:chat)
          .and_raise(Faraday::ConnectionFailed.new("connection refused"))

        expect {
          post "/api/v1/ai/goals", params: { theme: "健康" }, as: :json
        }.to change(AiGeneration, :count).by(1)

        expect(response).to have_http_status(:bad_gateway)
        expect(AiGeneration.last.status).to eq("failed")
        expect(AiGeneration.last.error_message).to include("Faraday::ConnectionFailed")
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
