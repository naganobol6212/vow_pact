module Ai
  # 目標 + 制約 + 期日から難易度（1〜5）と理由を判定する。
  class DifficultyJudge < BaseSuggester
    DIFFICULTY_RANGE = (1..5)

    def judge(goal:, constraint_text:, deadline:)
      result = chat_json(build_prompt(goal, constraint_text, deadline))
      {
        difficulty: clamp(result["difficulty"]),
        reason: result["reason"].to_s
      }
    end

    private

    def clamp(value)
      n = value.to_i
      n.clamp(DIFFICULTY_RANGE.first, DIFFICULTY_RANGE.last)
    end

    def build_prompt(goal, constraint_text, deadline)
      <<~PROMPT
        あなたはユーザーの自己鍛錬を支援する AI です。
        以下の契約の難易度を 1〜5 の整数で評価してください。

        - 目標: #{goal}
        - 試練（制約）: #{constraint_text}
        - 期日: #{deadline}

        評価基準:
        - 1: 容易（数日で達成、軽い習慣）
        - 2: やや容易
        - 3: 標準（多くの人が挑戦するレベル）
        - 4: やや困難
        - 5: 極めて困難（長期間の継続 + 厳しい制約）

        以下の JSON 形式で返してください:
        {"difficulty": 数値, "reason": "難易度判定の理由（50 文字以内の日本語）"}
      PROMPT
    end
  end
end
