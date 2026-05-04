module Ai
  # ユーザーが入力したテーマに対し、自己鍛錬の目標案を 3 つ生成する。
  class GoalSuggester < BaseSuggester
    def suggest(theme:)
      result = chat_json(build_prompt(theme))
      Array(result["goals"]).first(3)
    end

    private

    def build_prompt(theme)
      <<~PROMPT
        あなたはユーザーの自己鍛錬を支援する AI です。
        ユーザーが「#{theme}」というテーマで自己鍛錬の目標を立てたいと考えています。
        中世ファンタジー風の世界観に合うよう、誓約として相応しい具体的な目標案を 3 つ提案してください。
        各目標は 1 文（30 文字以内）で、日本語で書いてください。

        以下の JSON 形式で返してください:
        {"goals": ["目標案 1", "目標案 2", "目標案 3"]}
      PROMPT
    end
  end
end
