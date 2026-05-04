module Ai
  # AI サービスの共通基底クラス。
  # OpenAI gpt-4o-mini を JSON モードで呼び出し、結果を Hash で返す。
  # 各 Suggester（Goal / Constraint / Difficulty / Title）はこれを継承して
  # build_prompt と extract_result だけ実装すればよい。
  class BaseSuggester
    MODEL = "gpt-5.4-nano"
    TEMPERATURE = 0.7

    class JsonParseError < StandardError; end

    def initialize(client: OpenAI::Client.new)
      @client = client
    end

    private

    def chat_json(prompt)
      response = @client.chat(parameters: {
        model: MODEL,
        messages: [ { role: "user", content: prompt } ],
        response_format: { type: "json_object" },
        temperature: TEMPERATURE
      })

      content = response.dig("choices", 0, "message", "content")
      raise JsonParseError, "OpenAI returned no content" if content.blank?

      JSON.parse(content)
    rescue JSON::ParserError => e
      raise JsonParseError, "OpenAI returned invalid JSON: #{e.message}"
    end
  end
end
