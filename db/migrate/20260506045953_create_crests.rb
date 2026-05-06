class CreateCrests < ActiveRecord::Migration[8.1]
  def change
    create_table :crests do |t|
      # references は自動で index を貼るので、unique 指定だけ追加して 1 契約 1 紋章を強制
      t.references :pact, null: false, foreign_key: true, index: { unique: true }
      t.jsonb :crest_data, null: false, default: {}
      t.integer :rarity, null: false
      t.datetime :generated_at, null: false

      t.timestamps
    end

    # レアリティ別表示・集計用
    add_index :crests, :rarity
  end
end
