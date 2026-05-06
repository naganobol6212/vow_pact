require "rails_helper"

RSpec.describe Ai::Logger, type: :service do
  let(:user) { create(:user) }
  let(:input) { { theme: "健康" } }

  describe ".call" do
    context "block が成功した場合" do
      it "block の結果を返す" do
        result = described_class.call(
          user: user, type: :goal_suggestion, model: "gpt-5.4-nano", input: input
        ) { [ "毎日 30 分歩く" ] }
        expect(result).to eq([ "毎日 30 分歩く" ])
      end

      it "AiGeneration を success ステータスで作成する" do
        expect {
          described_class.call(
            user: user, type: :goal_suggestion, model: "gpt-5.4-nano", input: input
          ) { { goals: [ "A", "B" ] } }
        }.to change(AiGeneration, :count).by(1)

        ai = AiGeneration.last
        expect(ai.user).to eq(user)
        expect(ai.generation_type).to eq("goal_suggestion")
        expect(ai.model).to eq("gpt-5.4-nano")
        expect(ai.status).to eq("success")
        expect(ai.input_data).to eq("theme" => "健康")
        expect(ai.output_data["goals"]).to eq([ "A", "B" ])
        expect(ai.error_message).to be_nil
        expect(ai.latency_ms).to be >= 0
      end

      it "pact が指定されていれば紐付けて記録する" do
        pact = create(:pact, user: user)
        described_class.call(
          user: user, pact: pact,
          type: :difficulty_judgment, model: "gpt-5.4-nano", input: input
        ) { { difficulty: 3, reason: "妥当" } }

        expect(AiGeneration.last.pact_id).to eq(pact.id)
      end
    end

    context "block 内で Faraday エラーが発生した場合" do
      it "AiGeneration を failed ステータス + error_message 付きで作成し、例外を再 raise" do
        expect {
          described_class.call(
            user: user, type: :goal_suggestion, model: "gpt-5.4-nano", input: input
          ) { raise Faraday::ConnectionFailed.new("connection refused") }
        }.to change(AiGeneration, :count).by(1).and raise_error(Faraday::ConnectionFailed)

        ai = AiGeneration.last
        expect(ai.status).to eq("failed")
        expect(ai.error_message).to include("Faraday::ConnectionFailed")
        expect(ai.error_message).to include("connection refused")
      end
    end

    context "block 内で JSON パースエラーが発生した場合" do
      it "failed ステータスで記録される" do
        expect {
          described_class.call(
            user: user, type: :goal_suggestion, model: "gpt-5.4-nano", input: input
          ) { raise JSON::ParserError.new("unexpected token") }
        }.to raise_error(JSON::ParserError)

        ai = AiGeneration.last
        expect(ai.status).to eq("failed")
        expect(ai.error_message).to include("JSON::ParserError")
      end
    end
  end
end
