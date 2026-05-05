module Ai
  # ユーザーの目標に対し、達成のための「試練（制約）」案を 3 つ生成する。
  class ConstraintSuggester < BaseSuggester
    def suggest(goal:)
      result = chat_json(build_prompt(goal))
      Array(result["constraints"]).first(3)
    end

    private

    def build_prompt(goal)
      <<~PROMPT
        あなたはユーザーの自己鍛錬を支援する AI です。
        ユーザーは「#{goal}」という目標を立てました。
        この目標を達成するために自らに課す制約（やらないこと / 控えること）を 3 つ提案してください。

        条件:
        - 現代日本語の自然な表現で書く（中世ファンタジー風の表現は使わない）
        - 1 文（30 文字以内）
        - 具体的で毎日実行できる内容
        - 例：「夜 22 時以降スマホを触らない」「平日のお酒を控える」

        以下の JSON 形式で返してください:
        {"constraints": ["制約案 1", "制約案 2", "制約案 3"]}
      PROMPT
    end
  end
end
