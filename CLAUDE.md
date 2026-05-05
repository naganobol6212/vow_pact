# CLAUDE.md — Vow Pact 開発ガイド

Claude Code がプロジェクトのコンテキストを理解するためのガイド。

---

## 1. 最重要ルール

### 禁止事項

- `.permit!`（必ず `.permit(:attr1, ...)` 明示）
- N+1 クエリ（`includes` / `preload`）
- 複数 DB 操作のトランザクションなし
- ハードコードされた機密情報
- テストなしで機能実装
- `binding.pry` / `console.log` を本番に残す
- 機密情報（`password_digest` 等）を API レスポンスに含める

### 必須作業

- コミット前: `bundle exec rubocop -a` + `bundle exec rspec`
- PR マージ前: `gh pr checks <PR番号>`（CI 通過必須）

### 言語ルール

- コード: 英語 / コミット: 日本語
- PR 本文・コメント: 日本語 / Claude Code の応答: 日本語

### コミット注意

- `Co-Authored-By: Claude` を含めない
- PR 本文に `🤖 Generated with Claude Code` を含めない

---

## 2. プロジェクト概要

**Vow Pact**（誓約契約）: 中世ファンタジー × モダン UI の自己鍛錬アプリ。

ユーザーは「目標 + 試練（制約）+ 期日」を契約として誓い、達成すると紋章が付与される。

差別化: 制約の明示 / 紋章・称号付与 / 中世ファンタジー世界観。

---

## 3. 技術スタック

| カテゴリ          | 内容                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ruby / FW         | Ruby 3.4 / Rails 8.1（通常モード + ApplicationController を `ActionController::API` 化、SPA 配信用 HomeController のみ `ActionController::Base`） |
| DB / Job / Cache  | PostgreSQL 18（Neon Free）/ Solid Queue / Solid Cache                                                                                             |
| 認証 / Serializer | Rails 8 標準ジェネレータ（セッション） / alba                                                                                                     |
| Test / Lint（BE） | RSpec + factory_bot + faker / RuboCop（rails-omakase）                                                                                            |
| Frontend          | React 18+ / TypeScript 5+ / Vite / Tailwind CSS                                                                                                   |
| FE 状態 / Routing | TanStack Query / React Router                                                                                                                     |
| Test / Lint（FE） | Vitest / ESLint + Prettier                                                                                                                        |
| AI                | OpenAI `gpt-5.4-nano`（軽量・高速・最新、2026 年 3 月リリース）、Solid Queue 非同期（v1.1）、ログを `ai_generations` に記録（v1.1）                |
| Infra             | Docker Compose（dev）/ Render Free（prod app）/ Neon Free（prod DB）/ GitHub Actions                                                              |
| **使わない**      | Devise / Sidekiq / Redis / Webpack / Sprockets / Hotwire                                                                                          |

AI 詳細: MVP は同期処理（200 OK で即時返却）。v1.1 で 202 Accepted + `job_id` → ポーリング、レート制限 1 ユーザー 1 分 10 回。

---

## 4. ディレクトリ構成

```
app/
├── controllers/api/v1/  # auth/, pacts, check_ins, ai/, rankings
├── models/               # users, pacts, check_ins, crests, ai_generations
├── services/             # PactCompleter, CrestGenerator, StreakCalculator, ai/*
├── serializers/          # alba ベース
├── jobs/                 # Solid Queue
└── frontend/             # vite_ruby 規約（entrypoints, pages, components, hooks, lib, types）

spec/  # models, requests/api/v1/, services, factories
docs/  # data_model, api_design, design_guide, design_prompts, VowPact_mock/
```

詳細: `docs/data_model.md`, `docs/api_design.md`

---

## 5. 世界観・デザイン

**モダン × 中世ファンタジー**。

| 色        | コード    | 用途             |
| --------- | --------- | ---------------- |
| Parchment | `#f4e8d0` | 背景             |
| Ink       | `#2c1810` | テキスト         |
| Seal      | `#8b1a1a` | アクセント・CTA  |
| Gold      | `#c9a961` | 装飾・レアリティ |

フォント: Noto Sans JP（UI）/ Noto Serif JP（契約書本文）。

文言ルール:

- **世界観風（演出が活きる場面に限定）**: 契約締結「ここに誓う」、X シェア「𝕏で天下に宣する / 歩みを刻む / 栄光を示す」、達成見出し「誓いは刻まれた」「成就せり」「誓約の殿堂」、称号
- **現代語**: 章タイトル / 説明文 / AI 操作ボタン（「AI に提案してもらう」「おまかせで提案してもらう」など）/ 入力欄ラベル / ナビ / ステータス / エラー
- 「天啓を受ける」のような世界観風の操作ボタンは**理解しづらい**ため現代語化済み。世界観は演出（CTA・達成画面・装飾）で出す方針。
- 難読漢字は ruby タグでふりがな

詳細: `docs/design_guide.md`

---

## 6. コーディング規約

- Ruby: クラス UpperCamelCase / メソッド snake_case / 定数 UPPER_SNAKE_CASE
- TS: コンポーネント PascalCase / Hook `use` + camelCase / 関数 camelCase / 型 PascalCase
- サービスクラス: `app/services/` に配置、命名は動作を表す名詞、メインメソッド `call`
- Thin Controller / Fat Model、N+1 回避、Strong Parameters 必須、バリデーションはモデル層
- コメントは WHY を書く（自明な処理には不要）

---

## 7. 重要な設計判断

### Pact（契約）

- active 契約はユーザーごと **最大 7 つ**（8 つ目は 422）
- 1 契約 = 1 制約
- 編集可: `goal`, `constraint_text` のみ（`deadline` / `difficulty` / `signed_at` 不可）
- 削除は論理削除（`status: abandoned`）

### CheckIn

- 1 日 1 契約 1 件（DB UNIQUE 制約）
- `checked_on` はサーバー側で自動設定（チート防止）
- 訂正は UPDATE（同日 2 回 POST = 上書き）

### 達成判定 / Crest

- 寛容モード: `broken` 日があっても記録があれば達成扱い
- チェックイン作成時に自動判定 / 手動: `POST /pacts/:id/complete`
- 達成 → status: completed + completed_at + Crest 生成
- 1 契約 = 1 紋章（DB UNIQUE）、failed には紋章なし
- レアリティ: `difficulty × compliance_rate × period_score`

### Ranking

- 公平性: 「今月の達成数」「連続チェックイン日数」のみ
- `is_public=true` のみ表示、自分の順位は常に見える

### Enum

- `Pact.status`: active(0) / completed(1) / failed(2) / abandoned(3)
- `CheckIn.status`: kept(0) / broken(1) / skipped(2)
- `Crest.rarity`: common(0) / rare(1) / epic(2) / legendary(3)
- `AiGeneration.generation_type`: goal_suggestion(0) / constraint_suggestion(1) / difficulty_judgment(2) / title_generation(3)

### API

- URL: `/api/v1/` プレフィックス
- レスポンス: データ直接返す（`data` キーラップなし）
- エラー: `{ errors: [{ code, field, message }] }`
- 認証: セッション Cookie（HttpOnly + Secure + SameSite=Lax）
- **CSRF 対策必須**: Cookie 認証なので `ActionController::RequestForgeryProtection` を `ApplicationController` に include。React 側は `<meta name="csrf-token">` から取得して `X-CSRF-Token` ヘッダーで送る
- API 共通基底: `Api::V1::BaseController < ApplicationController`（認証・CSRF・エラー整形・rescue_from を集約）

詳細: `docs/api_design.md`

---

## 8. 実装方針

新概念は短く解説してから実装（全体像 1〜3 行 + 採用理由 1〜2 行 + 実装）。**TDD**（Red → Green → Refactor）。

テストカテゴリ:

- モデル: バリデーション、アソシエーション、スコープ、メソッド
- リクエスト: 正常系・異常系・認可
- サービス: ユニット

実装前: 関連設計書を確認 / 既存コード把握 / 調査に 5 分以上使わない / 同じファイルを 2 回読まない / 不明点は実装しながら確認。

---

## 9. Git ワークフロー

GitHub Flow（main + feature/\*）。機能ブランチは必ず main から分岐。

```bash
git switch main && git pull origin main
git switch -c feature/xxx
# 開発、コミット...
git fetch origin main && git merge origin/main   # 1 日 1 回以上
gh pr create --title "..."
gh pr checks <PR番号> && gh pr merge <PR番号>
git switch main && git pull origin main
```

---

## 10. 主要コマンド

```bash
# Docker
docker compose up -d
docker compose exec web bash
docker compose exec web bin/rails console

# Rails
docker compose exec web bin/rails db:migrate
docker compose exec web bundle exec rspec
docker compose exec web bundle exec rubocop -a

# Frontend
docker compose exec web npm run test
docker compose exec web npm run lint
```

`~/.zshrc` で `alias dcw="docker compose exec web"` 推奨。

---

## 11. 参照先

| カテゴリ     | 参照先                  |
| ------------ | ----------------------- |
| データモデル | `docs/data_model.md`    |
| API 設計     | `docs/api_design.md`    |
| デザイン詳細 | `docs/design_guide.md`  |
| モックアップ | `docs/VowPact_mock/`    |
| 環境変数     | `.env.example`          |
| Rails ガイド | https://railsguides.jp/ |

---

## 12. 迷ったら

1. 設計書を見る（`docs/data_model.md`, `docs/api_design.md`）
2. Rails ガイド: https://railsguides.jp/
3. 同じ修正を 2 回したらこのファイルにルール追加

---

**最終更新**: 2026-05-03
