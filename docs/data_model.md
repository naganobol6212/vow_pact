# Vow Pact - データモデル設計

このドキュメントは、目標達成アプリ「Vow Pact（誓約契約）」のデータベーステーブル設計をまとめたものです。

## 目次

- [概要](#概要)
- [テーブル一覧](#テーブル一覧)
- [リレーション全体図](#リレーション全体図)
- [テーブル詳細](#テーブル詳細)
  - [users](#users)
  - [pacts](#pacts)
  - [check_ins](#check_ins)
  - [crests](#crests)
  - [ai_generations](#ai_generations)
- [設計判断の記録](#設計判断の記録)

---

## 概要

### 技術スタック

- **DBエンジン**: PostgreSQL 18（Neon Free Plan）
- **ORM**: Active Record（Rails 8）
- **マイグレーション管理**: Rails 標準
- **テスト**: RSpec + factory_bot

### 設計方針

- **正規化を基本**とするが、表示頻度の高い情報はキャッシュとして保持
- **DB レベルのバリデーション** + **Rails レベルのバリデーション**を併用
- **enum** で状態管理を明確化
- **インデックス**は頻出クエリパターンに合わせて設計
- **JSONb** はパーツ組み合わせや構造可変なデータに使用

---

## テーブル一覧

| テーブル名 | 役割 | 概算データ量（1ユーザー1年） |
|---|---|---|
| `users` | ユーザー情報、認証、プロフィール | 1件 |
| `pacts` | 契約（アプリの中心） | 数十件 |
| `check_ins` | 日々のチェックイン履歴 | 数百〜千件 |
| `crests` | 達成時に生成される紋章 | 数件〜十数件 |
| `ai_generations` | AI 生成履歴（ログ用） | 数百件 |

---

## リレーション全体図

```
┌─────────────┐
│   users     │
│             │
│ id (PK)     │
└──────┬──────┘
       │ 1
       │
       │ N (最大7つの active)
       ▼
┌─────────────┐  1     1  ┌──────────────┐
│   pacts     │◀──────────│   crests     │
│             │           │              │
│ id (PK)     │           │ id (PK)      │
│ user_id (FK)│           │ pact_id (FK) │
└──────┬──────┘           └──────────────┘
       │ 1
       │
       │ N (1日1契約1件)
       ▼
┌─────────────┐
│ check_ins   │
│             │
│ id (PK)     │
│ pact_id (FK)│
└─────────────┘

┌──────────────────┐
│ ai_generations   │  ← User と Pact に関連（独立的なログ）
│                  │
│ id (PK)          │
│ user_id (FK)     │
│ pact_id (FK,NULL)│
└──────────────────┘
```

### Rails モデルでの表現

```ruby
class User < ApplicationRecord
  has_many :pacts, dependent: :destroy
  has_many :check_ins, through: :pacts
  has_many :ai_generations, dependent: :destroy
end

class Pact < ApplicationRecord
  belongs_to :user
  has_many :check_ins, dependent: :destroy
  has_one :crest, dependent: :destroy
  has_many :ai_generations, dependent: :nullify
end

class CheckIn < ApplicationRecord
  belongs_to :pact
end

class Crest < ApplicationRecord
  belongs_to :pact
end

class AiGeneration < ApplicationRecord
  belongs_to :user
  belongs_to :pact, optional: true
end
```

---

## テーブル詳細

### users

ユーザー情報、認証、プロフィールを管理。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | bigint | PRIMARY KEY | レコードID |
| email | string | NOT NULL, UNIQUE | ログイン用メールアドレス |
| password_digest | string | NOT NULL | ハッシュ化されたパスワード |
| nickname | string | NOT NULL | 契約者名（表示用） |
| avatar_url | string | NULLABLE | アバター画像URL |
| is_public | boolean | NOT NULL, default: true | プロフィール公開設定 |
| streak_count | integer | NOT NULL, default: 0 | 現在の連続記録（キャッシュ） |
| longest_streak | integer | NOT NULL, default: 0 | 過去最長の連続記録（キャッシュ） |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

#### インデックス

- `email` (UNIQUE INDEX、ログイン高速化)

#### バリデーション（Rails レベル）

- `email`: 必須、形式チェック、UNIQUE
- `nickname`: 必須、文字数制限（1-30文字）
- `password`: 必須（has_secure_passwordで自動）、最小長（6文字以上）
- `avatar_url`: 形式チェック（URLとして有効か、NULLは許容）

#### 設計上の注意

- **streak_count はキャッシュ**: CheckIn から計算可能だが、表示頻度が高いためキャッシュ
- **キャッシュ更新**: CheckIn の after_create / after_destroy で自動更新する（ロジック必須）
- **avatar_url の方針**: MVPではURL保存のみ。ファイルアップロード機能は将来的にActive Storageで実装

#### マイグレーション例

```ruby
class CreateUsers < ActiveRecord::Migration[8.0]
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
```

---

### pacts

契約。アプリの中心となるテーブル。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | bigint | PRIMARY KEY | レコードID |
| user_id | bigint | NOT NULL, FK→users.id | 契約者 |
| goal | text | NOT NULL | 目標 |
| constraint_text | text | NOT NULL | 試練（制約） |
| difficulty | integer | NOT NULL | 試練の格 (1-5) |
| difficulty_reason | text | NULLABLE | 難易度判定理由 (AI) |
| deadline | date | NOT NULL | 期日 |
| status | integer | NOT NULL, default: 0 | ステータス (enum) |
| title | string | NULLABLE | 称号 |
| signed_at | datetime | NOT NULL | 契約締結日時 |
| completed_at | datetime | NULLABLE | 達成日時 |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

#### enum 定義

```ruby
enum :status, {
  active: 0,      # 進行中
  completed: 1,   # 達成
  failed: 2,      # 期日切れで未達成
  abandoned: 3    # ユーザーが破棄
}
```

#### インデックス

- `user_id` (B-tree、ユーザーの契約一覧取得)
- `status` (B-tree、ステータス別フィルター)
- `(user_id, status)` 複合インデックス（最頻クエリ用）
- `deadline` (B-tree、期日切れチェックジョブ用)

#### バリデーション

- `goal`: 必須、1-500文字
- `constraint_text`: 必須、1-500文字
- `difficulty`: 必須、1-5の範囲
- `deadline`: 必須、未来の日付
- `status`: enum値のみ
- **active 状態の契約はユーザーごとに最大7つまで**（カスタムバリデーション）

#### カスタムバリデーション例

```ruby
class Pact < ApplicationRecord
  MAX_ACTIVE_PACTS = 7

  validate :active_pacts_limit, if: -> { active? }

  private

  def active_pacts_limit
    return unless user

    active_count = user.pacts.where(status: :active).where.not(id: id).count
    return if active_count < MAX_ACTIVE_PACTS

    errors.add(:base, "active な契約は#{MAX_ACTIVE_PACTS}つまでです")
  end
end
```

#### 編集権限

仕様により、契約締結後の編集制限あり：

- **編集可能**: `goal`, `constraint_text`
- **編集不可**: `deadline`, `difficulty`, `signed_at`
- **削除**: 物理削除ではなく、`status: abandoned` への論理削除

#### マイグレーション例

```ruby
class CreatePacts < ActiveRecord::Migration[8.0]
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
    add_index :pacts, [:user_id, :status]
    add_index :pacts, :deadline
  end
end
```

---

### check_ins

日々のチェックイン履歴。1日1契約1チェックインを保証。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | bigint | PRIMARY KEY | レコードID |
| pact_id | bigint | NOT NULL, FK→pacts.id | 契約ID |
| checked_on | date | NOT NULL | チェックイン日 |
| status | integer | NOT NULL | 結果 (enum) |
| note | text | NULLABLE | ユーザーのメモ |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

#### enum 定義

```ruby
enum :status, {
  kept: 0,      # 守れた
  broken: 1,    # 守れなかった
  skipped: 2    # スキップ
}
```

#### インデックス

- `pact_id` (B-tree、契約のチェックイン履歴取得)
- `(pact_id, checked_on)` **UNIQUE INDEX**（1日1契約1チェックインを強制）
- `checked_on` (B-tree、ユーザー全体の連続日数計算用)

#### バリデーション

- `pact_id`: 必須
- `checked_on`: 必須、未来の日付不可、契約のsigned_at以降
- `status`: enum値のみ
- **1日1契約1チェックイン**（DB レベルで保証 + Rails レベルでも検証）

#### 設計上の注意

- **訂正は UPDATE で実装**: 1日1件しか作れないので、再度チェックインすると既存レコードが更新される
- **連続記録の更新**: after_create/after_update/after_destroy で User.streak_count を再計算

#### 訂正の実装パターン

```ruby
def check_in(pact, status, note = nil)
  check_in = pact.check_ins.find_or_initialize_by(checked_on: Date.current)
  check_in.update!(status: status, note: note)
end
```

#### マイグレーション例

```ruby
class CreateCheckIns < ActiveRecord::Migration[8.0]
  def change
    create_table :check_ins do |t|
      t.references :pact, null: false, foreign_key: true
      t.date :checked_on, null: false
      t.integer :status, null: false
      t.text :note

      t.timestamps
    end

    add_index :check_ins, [:pact_id, :checked_on], unique: true
    add_index :check_ins, :checked_on
  end
end
```

---

### crests

達成時に生成される紋章。1契約に対して1紋章。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | bigint | PRIMARY KEY | レコードID |
| pact_id | bigint | NOT NULL, FK→pacts.id, UNIQUE | 契約ID（1契約1紋章） |
| crest_data | jsonb | NOT NULL | 紋章の見た目データ |
| rarity | integer | NOT NULL | レアリティ (enum) |
| generated_at | datetime | NOT NULL | 生成日時 |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

#### enum 定義

```ruby
enum :rarity, {
  common: 0,      # コモン
  rare: 1,        # レア
  epic: 2,        # エピック
  legendary: 3    # レジェンダリー
}
```

#### crest_data の JSON 構造

```json
{
  "base_shape": "shield_round",
  "central_motif": "sword",
  "decoration": "wings",
  "color_palette": "crimson_gold",
  "shimmer_level": 3
}
```

- `base_shape`: 5種類（盾の形）
- `central_motif`: 10種類（剣、月、炎、目、書物など）
- `decoration`: 5種類（翼、鎖、植物、星、雷）
- `color_palette`: 10種類
- `shimmer_level`: レアリティに応じた装飾レベル

#### インデックス

- `pact_id` (UNIQUE INDEX、1契約1紋章を強制 + 高速検索)
- `rarity` (B-tree、レアリティ別表示・集計用)

#### バリデーション

- `pact_id`: 必須、UNIQUE
- `crest_data`: 必須、JSONスキーマ検証（必須キーが揃っているか）
- `rarity`: enum値のみ
- **紋章は対応する Pact が completed 状態のときのみ作成可**（カスタムバリデーション）

#### レアリティ計算ロジック

PactCompleter と分母を統一して、`compliance_rate = kept_days / 期間日数`。
1 日だけ kept すれば 100% 扱いになるチート（旧仕様の check_in 件数分母）を防ぐ。

```ruby
def calculate_rarity(pact)
  difficulty = pact.difficulty                                          # 1-5
  expected_days = (pact.deadline - pact.signed_at.to_date).to_i + 1
  kept_days = pact.check_ins.kept
                  .where(checked_on: pact.signed_at.to_date..pact.deadline)
                  .distinct
                  .count(:checked_on)
  compliance_rate = expected_days.positive? ? [ kept_days.to_f / expected_days, 1.0 ].min : 0.0
  # 短すぎる契約・長すぎる契約で score が爆発しないようクランプ
  period_score = (expected_days / 30.0).clamp(0.5, 6.0)

  total_score = difficulty * compliance_rate * period_score

  case total_score
  when 0..1.0   then :common
  when 1.0..2.5 then :rare
  when 2.5..4.0 then :epic
  else               :legendary
  end
end
```

#### 設計上の注意

- **計算データは保存しない**: difficulty, compliance_rate, period_days などは Pact / CheckIn から計算可能なので保存不要（YAGNI 原則）
- **rarity は永久に保護**: レアリティ計算ロジックが変わっても、過去に確定した rarity は変わらない
- **compliance_rate の分母は期間日数**: PactCompleter と統一。check_in 件数分母にすると「1 回 kept で 100%」のチートが可能になるため

#### マイグレーション例

```ruby
class CreateCrests < ActiveRecord::Migration[8.0]
  def change
    create_table :crests do |t|
      t.references :pact, null: false, foreign_key: true
      t.jsonb :crest_data, null: false
      t.integer :rarity, null: false
      t.datetime :generated_at, null: false

      t.timestamps
    end

    add_index :crests, :pact_id, unique: true
    add_index :crests, :rarity
  end
end
```

---

### ai_generations

AI 生成履歴のログテーブル。デバッグ・コスト分析・改善のため。

| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | bigint | PRIMARY KEY | レコードID |
| user_id | bigint | NOT NULL, FK→users.id | リクエスト者 |
| pact_id | bigint | NULLABLE, FK→pacts.id | 関連契約（あれば） |
| generation_type | integer | NOT NULL | 生成タイプ (enum) |
| input_data | jsonb | NOT NULL | 入力データ |
| output_data | jsonb | NOT NULL | 出力データ |
| model | string | NOT NULL | 使用モデル名 |
| tokens_used | integer | NULLABLE | 消費トークン数 |
| latency_ms | integer | NULLABLE | 応答時間 (ms) |
| status | integer | NOT NULL | 成功/失敗 (enum) |
| error_message | text | NULLABLE | エラーメッセージ |
| created_at | datetime | NOT NULL | |
| updated_at | datetime | NOT NULL | |

#### enum 定義

```ruby
enum :generation_type, {
  goal_suggestion: 0,         # 目標案
  constraint_suggestion: 1,   # 制約案
  difficulty_judgment: 2,     # 難易度判定
  title_generation: 3         # 称号生成
}

enum :status, {
  success: 0,
  failed: 1,
  filtered: 2  # コンテンツフィルタで弾かれた
}
```

#### input_data / output_data の構造例

**目標生成（goal_suggestion）**

```json
{
  "input_data": {
    "user_input": "英語を頑張る",
    "system_prompt": "あなたは古き賢者として、契約者に天啓を授ける役割です。...",
    "model": "gpt-4o-mini",
    "temperature": 0.7
  },
  "output_data": {
    "generated_options": [
      "TOEIC 800点を3ヶ月で達成する",
      "英会話アプリを毎日30分続ける",
      "英語の本を5冊読破する"
    ],
    "raw_response": "天啓により、汝の進むべき道は3つあり。..."
  }
}
```

#### インデックス

- `user_id` (B-tree、ユーザーごとの履歴取得)
- `created_at` (B-tree、時系列分析用)
- `generation_type` (B-tree、タイプ別集計用)
- `(user_id, created_at)` 複合インデックス（ユーザー履歴の時系列取得）

#### バリデーション

- `user_id`: 必須
- `generation_type`: enum値のみ
- `input_data`, `output_data`: 必須、JSON形式
- `status`: enum値のみ
- `model`: 必須

#### データ保持ポリシー

- MVP段階では削除なし
- 将来的に「90日以上前のログは削除」のバッチを追加予定
- プライバシー対応として、ユーザー削除時は AiGeneration の user_id を NULL に（または削除）

#### マイグレーション例

```ruby
class CreateAiGenerations < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_generations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :pact, foreign_key: true, null: true
      t.integer :generation_type, null: false
      t.jsonb :input_data, null: false
      t.jsonb :output_data, null: false
      t.string :model, null: false
      t.integer :tokens_used
      t.integer :latency_ms
      t.integer :status, null: false
      t.text :error_message

      t.timestamps
    end

    add_index :ai_generations, :generation_type
    add_index :ai_generations, [:user_id, :created_at]
  end
end
```

---

## 設計判断の記録

設計を進める中で行った重要な判断と、その理由を記録します。

### 判断1: streak_count を User にキャッシュ

**選択**: User テーブルに streak_count を持つ（CheckIn から都度計算ではなく）

**理由**:
- ホーム画面、ランキング、殿堂など複数箇所で表示される
- CheckIn からの集計は重い（日付グループ化、連続性判定）
- チェックインの更新頻度は低い（1日1回程度）

**注意点**:
- キャッシュずれ対策として、CheckIn の after_create/after_destroy で更新ロジック必須
- TDD でキャッシュ更新ロジックを保護する

### 判断2: Crest を Pact から分離

**選択**: Crest を別テーブルとして独立

**理由**:
- 達成時のみ生成される（NULL を扱う必要がなくなる）
- 紋章の属性（レアリティ、SVGデータ）を独立して管理できる
- 責務が分離される（契約と紋章で別概念）

### 判断3: crest_data を JSONB で保存

**選択**: 紋章のパーツ情報を JSONB の単一カラムに

**理由**:
- 紋章のパーツは将来追加される可能性が高い（柔軟性重視）
- パーツでの検索・集計は不要（rarity だけインデックスがあれば十分）
- カラム追加のマイグレーションを避けられる

### 判断4: 1契約に対して1日1チェックイン（UNIQUE 制約）

**選択**: `(pact_id, checked_on)` に UNIQUE INDEX

**理由**:
- 仕様で「1日1回チェックイン」と決めている
- バグでの2重登録を DB レベルで防ぐ
- 連続記録の計算が単純になる
- 訂正は UPDATE で実装可能（INSERT を増やす必要はない）

### 判断5: Pact の編集制限

**選択**: goal, constraint_text のみ編集可、deadline / difficulty は編集不可

**理由**:
- 仕様議論でゲーム性とランキング公平性のため
- タイポ修正のニーズには応えつつ、無限延長などの抜け道を防ぐ
- 期日変更したい場合は「破棄して再契約」で対応

### 判断6: AiGeneration を別テーブルで履歴保存

**選択**: AI 生成履歴を AiGeneration テーブルに保存

**理由**:
- バグ調査時のリクエスト/レスポンス再現
- API コストの分析（tokens_used）
- プロンプト改善のためのデータ収集
- 失敗パターンの分析（status, error_message）

### 判断7: レアリティ計算データは保存しない

**選択**: difficulty_at_completion, compliance_rate などの計算元データは Crest に保存しない

**理由**:
- 必要な情報は Pact / CheckIn から計算可能（正規化原則）
- 表示する UI が現状ない（YAGNI 原則）
- rarity カラムだけで「結果」は永久に保証される

### 判断8: ランキングは公平性重視

**選択**: 「今月の達成数」と「連続チェックイン日数」のみ採用、累計レアリティは個人記録としてのみ

**理由**:
- 「早く始めた人が有利」を防ぐ
- 新規ユーザーも楽しめる
- 月次リセットで全員が同じ土俵に立てる

---

## 今後の拡張案（参考）

MVP では実装しないが、将来的に追加するかもしれない要素を記録しておく。

### 拡張1: 通知機能

- `notifications` テーブル：期日が近いリマインダー、達成お祝いなど
- メール / プッシュ通知の連携

### 拡張2: ソーシャル機能

- `follows` テーブル：ユーザー同士のフォロー関係
- `likes` テーブル：紋章への「いいね」

### 拡張3: バッジ・実績システム

- `achievements` テーブル：「初めての達成」「10連続成功」などの実績解除

### 拡張4: 内部カテゴリタグ

- AI による自動タグ付け（学習、健康、創作 など）
- カテゴリ別ランキング

### 拡張5: プッシュ通知設定

- `notification_preferences` テーブル：通知のオン/オフ設定

---

## 参考資料

- [Rails 8 ガイド](https://guides.rubyonrails.org/)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [factory_bot](https://github.com/thoughtbot/factory_bot)
- 過去の議論ログ: `docs/design_prompts.md`（Claude Design用プロンプト集）

---

**最終更新**: 2026年5月2日
