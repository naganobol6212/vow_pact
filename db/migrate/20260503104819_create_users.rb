class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :nickname, null: false
      t.string :avatar_url
      t.boolean :is_public, null: false, default: true
      t.integer :streak_count, null: false, default: 0
      t.integer :longest_streak, null: false, default: 0

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
