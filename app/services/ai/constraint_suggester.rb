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
        この目標を達成するために自らに課す「試練（制約）」を 3 つ提案してください。

        制約は以下の条件を満たすこと:
        - 1 文（30 文字以内）の日本語
        - 具体的で日々実行できる内容
        - 中世ファンタジー風の世界観に合うニュアンス（誓い・断ち・退ける 等）

        以下の JSON 形式で返してください:
        {"constraints": ["制約案 1", "制約案 2", "制約案 3"]}
      PROMPT
    end
  end
end
