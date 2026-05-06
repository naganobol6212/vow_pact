class CreateAiGenerations < ActiveRecord::Migration[8.1]
  def change
    create_table :ai_generations do |t|
      t.references :user, null: false, foreign_key: true
      # pact がまだ無い段階の AI 呼び出し（目標案 / 制約案）も記録するため nullable
      t.references :pact, null: true, foreign_key: true
      t.integer :generation_type, null: false
      t.jsonb :input_data, null: false, default: {}
      t.jsonb :output_data, null: false, default: {}
      t.string :model, null: false
      t.integer :tokens_used
      t.integer :latency_ms
      t.integer :status, null: false
      t.text :error_message

      t.timestamps
    end

    # 種類別の集計（コスト分析・成功率計算）
    add_index :ai_generations, :generation_type
    # ユーザーごとの履歴を時系列で取得 / レート制限判定（v1.1 #43）にも使う
    add_index :ai_generations, [ :user_id, :created_at ]
  end
end
