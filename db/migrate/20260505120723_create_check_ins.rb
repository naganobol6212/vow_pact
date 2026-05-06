class CreateCheckIns < ActiveRecord::Migration[8.1]
  def change
    create_table :check_ins do |t|
      t.references :pact, null: false, foreign_key: true
      t.date :checked_on, null: false
      t.integer :status, null: false
      t.text :note

      t.timestamps
    end

    # 1 日 1 契約 1 件を DB レベルで強制（同時 POST race も unique violation で弾く）
    add_index :check_ins, [ :pact_id, :checked_on ], unique: true
    # 連続日数計算 / 管理画面で日付集計するときの index
    add_index :check_ins, :checked_on
  end
end
