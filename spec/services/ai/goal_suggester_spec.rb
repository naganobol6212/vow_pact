require "rails_helper"

# GoalSuggester がプロンプト・パラメータを期待通り組み立てて OpenAI client に渡すか。
# 実 API は叩かない（client をモック）。
RSpec.describe Ai::GoalSuggester do
  let(:client) { instance_double(OpenAI::Client) }
  let(:fake_response) do
    {
      "choices" => [
        { "message" => { "content" => '{"goals": ["案 1", "案 2", "案 3"]}' } }
      ]
    }
  end

  subject(:suggester) { described_class.new(client: client) }

  describe "#suggest" do
    it "OpenAI に temperature 0.95 + presence/frequency penalty を渡す" do
      expect(client).to receive(:chat) do |arg|
        params = arg[:parameters]
        expect(params[:temperature]).to eq(0.95)
        expect(params[:presence_penalty]).to eq(0.4)
        expect(params[:frequency_penalty]).to eq(0.5)
        expect(params[:response_format]).to eq({ type: "json_object" })
        fake_response
      end
      suggester.suggest(theme: "健康")
    end

    it "theme があれば themed prompt として渡る" do
      expect(client).to receive(:chat) do |arg|
        prompt = arg[:parameters][:messages].first[:content]
        expect(prompt).to include("健康")
        expect(prompt).to include("テーマで")
        fake_response
      end
      suggester.suggest(theme: "健康")
    end

    it "theme が空なら random prompt として渡る" do
      expect(client).to receive(:chat) do |arg|
        prompt = arg[:parameters][:messages].first[:content]
        expect(prompt).to include("テーマを指定していません")
        fake_response
      end
      suggester.suggest(theme: "")
    end

    it "genre を指定するとプロンプトにジャンルヒントが含まれる" do
      expect(client).to receive(:chat) do |arg|
        prompt = arg[:parameters][:messages].first[:content]
        expect(prompt).to include("健康")
        expect(prompt).to include("身体作り")
        fake_response
      end
      suggester.suggest(theme: "朝の習慣", genre: "健康")
    end

    it "未サポートの genre は無視される（プロンプトにジャンル句が出ない）" do
      expect(client).to receive(:chat) do |arg|
        prompt = arg[:parameters][:messages].first[:content]
        expect(prompt).not_to include("このジャンルに寄せる")
        fake_response
      end
      suggester.suggest(theme: "朝の習慣", genre: "存在しないジャンル")
    end

    it "few-shot 例文プールから毎回ランダムに抽出する" do
      seen_orthodox = Set.new
      allow(client).to receive(:chat) do |arg|
        prompt = arg[:parameters][:messages].first[:content]
        # heredoc <<~ で indent は除去される。プレフィックスは "- 王道: " になる。
        line = prompt.lines.find { |l| l.start_with?("- 王道:") }
        seen_orthodox << line if line
        fake_response
      end
      30.times { suggester.suggest(theme: "テスト") }
      # 30 回試行で 2 種以上のラインを見られるはず（プールから 2 個サンプル × 12 例なので大抵 5 種以上）
      expect(seen_orthodox.size).to be >= 2
    end

    it "返却は最初の 3 件まで" do
      allow(client).to receive(:chat).and_return({
        "choices" => [
          {
            "message" => {
              "content" => '{"goals": ["案 1", "案 2", "案 3", "案 4", "案 5"]}'
            }
          }
        ]
      })
      result = suggester.suggest(theme: "健康")
      expect(result).to eq([ "案 1", "案 2", "案 3" ])
    end
  end
end
