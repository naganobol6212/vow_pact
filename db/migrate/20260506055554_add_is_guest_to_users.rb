class AddIsGuestToUsers < ActiveRecord::Migration[8.1]
  def change
    # is_guest = true なら「お試しモード」のユーザー。
    # 本登録（promote）すると false に切り替わり、メアド・パスワードが本物に置き換わる。
    add_column :users, :is_guest, :boolean, null: false, default: false
    # 30 日経過した未昇格ゲストをクリーンアップする Job 用 INDEX
    add_index :users, [ :is_guest, :created_at ]
  end
end
