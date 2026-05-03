class ChangeUsersEmailIndexToCaseInsensitive < ActiveRecord::Migration[8.1]
  def up
    remove_index :users, :email
    add_index :users, "LOWER(email)", unique: true, name: "index_users_on_lower_email"
  end

  def down
    remove_index :users, name: "index_users_on_lower_email"
    add_index :users, :email, unique: true
  end
end
