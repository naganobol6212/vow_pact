class AddIsPublicToPacts < ActiveRecord::Migration[8.1]
  def change
    # 個別契約の公開/非公開フラグ。デフォルトは非公開（オプトイン公開）。
    # 公開ページ（/p/:id）と OGP は is_public=true のみ許可する。
    add_column :pacts, :is_public, :boolean, null: false, default: false
    add_index :pacts, :is_public
  end
end
