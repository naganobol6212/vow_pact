module Ai
  # 達成した契約に対して、中世ファンタジー風の称号案を 3 つ生成する。
  # 達成済み契約に付与される「○○の誓いを刻みし者」のような称号。
  #
  # バリエーション拡充: 構文パターンの few-shot プールから毎回ランダム抽出して
  # 「いつも同じ語尾」になるのを防ぐ。
  class TitleGenerator < BaseSuggester
    # 称号の語尾パターン例。`○○の◯◯◯◯◯` の形でバリエーションを稼ぐ。
    EXAMPLES_PATTERNS = [
      "○○の誓いを刻みし者",
      "○○の覚者",
      "○○の戦士",
      "○○の盟主",
      "○○を制せし英傑",
      "○○の継承者",
      "○○の煌めき",
      "○○の道を歩みし者",
      "○○の灯を守りし者",
      "○○を成し遂げし者",
      "○○の探求者",
      "○○を貫きし剣"
    ].freeze

    def generate(goal:, difficulty:)
      result = chat_json(build_prompt(goal, difficulty))
      Array(result["titles"]).first(3)
    end

    private

    def build_prompt(goal, difficulty)
      patterns = EXAMPLES_PATTERNS.sample(4)
      <<~PROMPT
        あなたは中世ファンタジー世界の語り部です。
        以下の契約を達成したユーザーに与える称号を 3 つ提案してください。

        - 達成した目標: #{goal}
        - 難易度（1〜5）: #{difficulty}

        参考にする構文パターン（これらの言い回しはそのまま使わず別の言葉で）:
        - #{patterns.join("\n        - ")}

        称号は以下の条件を満たすこと:
        - 中世ファンタジー風の格調高い日本語
        - 15 文字以内
        - 難易度が高いほど威厳のある称号にする
        - 3 案で語尾や構文が被らないようにする
        - 上の参考例の言い回しを使い回さない（パターンとして参考にしつつ別の言葉で）

        以下の JSON 形式で返してください:
        {"titles": ["称号 1", "称号 2", "称号 3"]}
      PROMPT
    end
  end
end
