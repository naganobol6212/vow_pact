class CreatePacts < ActiveRecord::Migration[8.1]
  def change
    create_table :pacts do |t|
      t.references :user, null: false, foreign_key: true
      t.text :goal, null: false
      t.text :constraint_text, null: false
      t.integer :difficulty, null: false
      t.text :difficulty_reason
      t.date :deadline, null: false
      t.integer :status, null: false, default: 0
      t.string :title
      t.datetime :signed_at, null: false
      t.datetime :completed_at

      t.timestamps
    end

    add_index :pacts, :status
    add_index :pacts, [ :user_id, :status ]
    add_index :pacts, :deadline
  end
end
