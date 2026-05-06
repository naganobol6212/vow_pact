class CreatePasswordResetTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :password_reset_tokens do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, null: false
      t.datetime :expires_at, null: false
      t.datetime :used_at  # nil なら未使用、値ありなら使用済み

      t.timestamps
    end

    # トークン検索を高速化（リセット時に GET /passwords/:token で叩く）
    add_index :password_reset_tokens, :token, unique: true
    # レート制限：1 ユーザー 1 時間あたりの発行回数を SQL 1 発で取れるように
    add_index :password_reset_tokens, [ :user_id, :created_at ]
  end
end
