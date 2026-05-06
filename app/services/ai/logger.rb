module Ai
  # AI 呼び出しの input / output / latency / error をすべて ai_generations に記録する。
  # ブロックを渡して使う：
  #
  #   Ai::Logger.call(user:, type:, model:, input:) { ... AI 呼び出し ... }
  #
  # ブロックの戻り値はそのまま返り値になる。
  # 例外は ai_generations に failed 記録した上で再 raise する（呼び出し元で別途 rescue 可能）。
  class Logger
    def self.call(user:, type:, model:, input:, pact: nil, &block)
      started_at = Time.current
      output = nil
      status = :success
      error_message = nil

      begin
        output = block.call
      rescue => e
        status = :failed
        error_message = "#{e.class}: #{e.message}"
        raise
      ensure
        AiGeneration.create!(
          user: user,
          pact: pact,
          generation_type: type,
          input_data: input || {},
          # output_data は jsonb（Hash 必須）。output の形に応じてラップする。
          output_data: wrap_output(output),
          model: model,
          latency_ms: ((Time.current - started_at) * 1000).to_i,
          status: status,
          error_message: error_message
        )
      end

      output
    end

    def self.wrap_output(output)
      case output
      when Hash  then output
      when Array then { "items" => output }
      when nil   then {}
      else            { "value" => output }
      end
    end
  end
end
