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
        この目標達成のために自らに課す「制約（やらないこと / 控えること）」を 3 つ提案してください。

        意識してほしいこと:
        - 1 つは「王道で効果が高い」制約（例: 夜 22 時以降スマホを触らない）
        - 1 つは「ちょっと変わっていてニヤッとする」制約（例: 言い訳を 3 つ並べる前に行動する）
        - 1 つは「斬新で達成感が出る」制約（例: 1 日 1 回「ありがとう」より先に文句を言わない）

        条件:
        - 現代日本語の自然な表現（中世ファンタジー風の表現は使わない）
        - 1 文（30 文字以内）
        - 毎日実行できる具体性
        - 真面目すぎず、ユーモアや意外性も歓迎（ただし下品・攻撃的なものは避ける）
        - 3 案でトーンが被らないようにする

        以下の JSON 形式で返してください:
        {"constraints": ["王道案", "ひねり案", "斬新案"]}
      PROMPT
    end
  end
end
