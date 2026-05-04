module Ai
  # 達成した契約に対して、中世ファンタジー風の称号案を 3 つ生成する。
  # 達成済み契約に付与される「○○の誓いを刻みし者」のような称号。
  class TitleGenerator < BaseSuggester
    def generate(goal:, difficulty:)
      result = chat_json(build_prompt(goal, difficulty))
      Array(result["titles"]).first(3)
    end

    private

    def build_prompt(goal, difficulty)
      <<~PROMPT
        あなたは中世ファンタジー世界の語り部です。
        以下の契約を達成したユーザーに与える称号を 3 つ提案してください。

        - 達成した目標: #{goal}
        - 難易度（1〜5）: #{difficulty}

        称号は以下の条件を満たすこと:
        - 中世ファンタジー風の格調高い日本語
        - 15 文字以内
        - 「○○の誓いを刻みし者」「○○の覚者」「○○の戦士」「○○の盟主」など
        - 難易度が高いほど威厳のある称号にする

        以下の JSON 形式で返してください:
        {"titles": ["称号 1", "称号 2", "称号 3"]}
      PROMPT
    end
  end
end
