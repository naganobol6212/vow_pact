module Ai
  # AI サービスの共通基底クラス。
  # OpenAI chat completion を JSON モードで呼び出し、結果を Hash で返す。
  # 各 Suggester（Goal / Constraint / Difficulty / Title）はこれを継承して
  # build_prompt と extract_result だけ実装すればよい。
  #
  # バリエーションを増やすため、デフォルトで温度を高く（0.95）し、
  # presence_penalty / frequency_penalty を入れて「同じ語彙の繰り返し」を抑制する。
  class BaseSuggester
    MODEL = "gpt-5.4-nano"
    # 温度: 0.7 だと毎回同じ文言になりがちだったため、創造性を上げて 0.95 に。
    # 過去フィードバック「毎回やっていると同じ文言ばかり」への対応。
    DEFAULT_TEMPERATURE = 0.95
    # presence_penalty: 0 に近いと既出語彙を再利用しやすくなる。0.4 で
    # 「新しい話題に踏み込む」傾向を強める。
    DEFAULT_PRESENCE_PENALTY = 0.4
    # frequency_penalty: 同一レスポンス内での同じ語の繰り返しを抑制。
    DEFAULT_FREQUENCY_PENALTY = 0.5

    class JsonParseError < StandardError; end

    def initialize(client: OpenAI::Client.new)
      @client = client
    end

    private

    # サブクラスからは「prompt と必要ならパラメータ上書き」だけ渡せばよい。
    # temperature 等を渡さなければ DEFAULT_* が使われる。
    def chat_json(prompt, temperature: DEFAULT_TEMPERATURE,
                          presence_penalty: DEFAULT_PRESENCE_PENALTY,
                          frequency_penalty: DEFAULT_FREQUENCY_PENALTY)
      response = @client.chat(parameters: {
        model: MODEL,
        messages: [ { role: "user", content: prompt } ],
        response_format: { type: "json_object" },
        temperature: temperature,
        presence_penalty: presence_penalty,
        frequency_penalty: frequency_penalty
      })

      content = response.dig("choices", 0, "message", "content")
      raise JsonParseError, "OpenAI returned no content" if content.blank?

      JSON.parse(content)
    rescue JSON::ParserError => e
      raise JsonParseError, "OpenAI returned invalid JSON: #{e.message}"
    end
  end
end
