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
        具体的で実行可能な目標案を 3 つ提案してください。

        条件:
        - 現代日本語の自然な表現で書く（中世ファンタジー風の表現は使わない）
        - 1 文（30 文字以内）
        - 数値や頻度などを含めて行動が明確になるようにする
        - 例：「毎日 30 分読書する」「週 3 回ジョギングする」

        以下の JSON 形式で返してください:
        {"goals": ["目標案 1", "目標案 2", "目標案 3"]}
      PROMPT
    end
  end
end
