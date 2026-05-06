# Vow Pact アーキテクチャ — 設計判断の記録

> **「なぜそうしたか」**を時間が経っても思い出せるための記録。
> 何を作ったかは README とコードに書いてある。

---

## 目次

- [全体構成](#全体構成)
- [ハイブリッド構成（Rails + Vite + React）](#ハイブリッド構成rails--vite--react)
- [コントローラーの継承構造](#コントローラーの継承構造)
- [認証・セキュリティ](#認証セキュリティ)
- [サービス層の方針](#サービス層の方針)
- [データ整合性の方針](#データ整合性の方針)
- [v1.1 機能の連鎖（チェックイン → 達成 → 紋章）](#v11-機能の連鎖チェックイン--達成--紋章)
- [AI 機能の方針](#ai-機能の方針)
- [検討した代替案](#検討した代替案)
- [将来の再評価ポイント](#将来の再評価ポイント)

---

## 全体構成

```
┌──────────────────────────────────────────────────────────┐
│                  Render Web Service                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Rails 8.1 (Puma)                       │ │
│  │  ┌──────────────────┐  ┌─────────────────────────┐ │ │
│  │  │ HomeController   │  │ Api::V1::BaseController │ │ │
│  │  │ (Base, HTML)     │  │ (API, JSON)             │ │ │
│  │  │ SPA shell 配信   │  │ 認証 + CSRF + 共通エラー  │ │ │
│  │  └────────┬─────────┘  └────────┬────────────────┘ │ │
│  │           │                     │                   │ │
│  │           ↓                     ↓                   │ │
│  │  ┌────────────────────────────────────────────┐    │ │
│  │  │ Models / Services / Serializers (alba)     │    │ │
│  │  └─────────────────┬──────────────────────────┘    │ │
│  └────────────────────┼─────────────────────────────────┘ │
│                       ↓                                   │
└───────────────────────┼───────────────────────────────────┘
                        ↓
                  ┌──────────────┐
                  │ Neon Postgres│
                  └──────────────┘

[ブラウザ]  GET /             → HomeController#index → SPA HTML
[ブラウザ]  GET /api/v1/...   → Api::V1::* (JSON)
```

**1 サービス・1 コードベースで完結**。Rails が「SPA の shell 配信」と「JSON API」を兼任する。

---

## ハイブリッド構成（Rails + Vite + React）

### 構成

- `ApplicationController < ActionController::API`（軽量、API 用）
- `HomeController < ActionController::Base`（HTML 配信のみ、SPA shell）
- `Api::V1::BaseController < ApplicationController`（共通基底）
- フロントエンドは `app/frontend/` に置き、`vite_rails` で統合

### なぜこの構成か

**完全分離（Vercel + Render）でも完全 HTML（Rails のみ）でもない、中間案を選んだ。**

| 観点                     | 採用根拠                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| **デプロイ単位**         | Render Free 1 サービスで完結 → 運用コスト最小                        |
| **CORS / Cookie 設定**   | 同一オリジンなので **CORS 実質不要 + Cookie 認証が単純**             |
| **環境変数管理**         | バックエンドとフロントで env を共有しない単純さ                      |
| **vite_rails の利点**    | Vite の HMR + Rails の ERB / asset_path ヘルパーが自然に動く        |
| **将来の API 切り出し**  | `/api/v1/` namespace に閉じてあるので、後で完全分離可能              |

### Codex レビューで指摘されたポイント

> 「`config.api_only = true` ではないので、これは『API-only Rails』ではなく『通常 Rails アプリ内で API controller だけ ActionController::API にしている構成』」

→ **正確には「ハイブリッド構成」**。Rails の `config.api_only` は使っていない。
これは将来的に HTML 経由の OAuth コールバックなどを足したくなった場合の柔軟性を残すため。

### トレードオフ

- ❌ コントローラーの継承元が 2 種類で初見の混乱がある
- ❌ `ApplicationController` の名前が一般的 Rails と意味がズレる（API 専用になっている）
- ✅ MVP のデプロイ・運用コストは最小
- ✅ 将来の段階的分離（モバイル展開時など）が可能

---

## コントローラーの継承構造

```
ActionController::API                       ActionController::Base
        │                                          │
        ↓                                          ↓
ApplicationController                       HomeController
  - Authentication concern                    - 認証なし
  - RequestForgeryProtection                  - SPA shell の HTML だけ返す
        │
        ↓
Api::V1::BaseController
  - rescue_from ActiveRecord::RecordNotFound → 404
  - rescue_from ActiveRecord::RecordInvalid  → 422 + { errors: [...] }
        │
        ↓
Api::V1::Auth::*Controller         ← 認証スキップ済み（signup / login）
Api::V1::PactsController           ← 認証必須
Api::V1::CheckInsController        ← 認証必須 + 二段階認可
Api::V1::RankingsController        ← 認証必須
Api::V1::Ai::BaseController        ← include RateLimited + before_action
  ├─ Api::V1::Ai::GoalsController
  ├─ Api::V1::Ai::ConstraintsController
  ├─ Api::V1::Ai::DifficultiesController
  └─ Api::V1::Ai::TitlesController
```

### 設計判断

- **`ApplicationController` を API 専用化**したのは「全 API の共通処理を最上位で集約」するため
- **`HomeController` は別系統**にして、SPA 配信に必要最小限のサポート（ERB / asset_path / Vite ヘルパー）を保持
- **`Api::V1::BaseController` で `rescue_from` を集約**して、エラーレスポンス形式 `{ errors: [{ code, field, message }] }` を強制

---

## 認証・セキュリティ

### 認証方式

- **Rails 8 標準ジェネレータ**（セッション Cookie + has_secure_password + Bcrypt）
- Devise は使わない（Rails 8 標準で十分、依存を減らす）

### Cookie の設定

| 項目          | 値                          | 理由                                                     |
| ------------- | --------------------------- | -------------------------------------------------------- |
| HttpOnly      | true                        | XSS で JavaScript から盗めない                          |
| Secure        | true（本番のみ）            | HTTPS 通信のみで送信                                     |
| SameSite      | Lax                         | 同一サイト OK、cross-site POST はブロック              |
| 有効期限      | セッション（ブラウザ閉じるまで） | -                                                  |

### CSRF 対策

`ActionController::API` は通常の `protect_from_forgery` 前提ではないため、`ActionController::RequestForgeryProtection` を `ApplicationController` に明示 include。

```ruby
class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  protect_from_forgery with: :exception unless Rails.env.test?
end
```

React 側は `<meta name="csrf-token">` から取得して `X-CSRF-Token` ヘッダーで送信。

### チート対策（時刻系はサーバ確定）

クライアント時計の改ざん対策として、**時刻系の値はサーバ側で確定**する：

| 値           | 確定タイミング              |
| ------------ | --------------------------- |
| `signed_at`  | Pact 作成時に `Time.current` |
| `checked_on` | CheckIn 作成時に `Date.current`（before_validation） |
| `completed_at` | PactCompleter が完了化する時に `Time.current` |

クライアント値はコントローラの strong parameters から除外。

---

## サービス層の方針

### 配置

```
app/services/
├── pact_completer.rb           # 達成判定
├── streak_calculator.rb        # 連続日数の再計算
├── crest_generator.rb          # 紋章のレアリティ計算 + パーツ抽選
├── check_ins/
│   └── upsert.rb               # CheckIn の作成 / 訂正（with_lock 内）
└── ai/
    ├── base_suggester.rb       # OpenAI 呼び出しの共通基底
    ├── goal_suggester.rb
    ├── constraint_suggester.rb
    ├── difficulty_judge.rb
    ├── title_generator.rb
    └── logger.rb               # AI 呼び出しの全件ログ記録（横断関心）
```

### 命名規則

- **クラス名は動作を表す名詞**（Completer / Calculator / Generator / Suggester / Logger / Upsert）
- **メインメソッドは `call`**（Service Object パターンの慣習に統一）
- 例外はサービス内で握りつぶさず、必要なら **再 raise** して上位で処理

### サービスを切り出す基準

以下のどれかに当てはまるロジックは controller / model から切り出す：

1. **複数のモデルを跨ぐ操作**（PactCompleter は Pact + CheckIn）
2. **計算ロジックが重い**（StreakCalculator は履歴走査）
3. **同じロジックが複数箇所で必要**（CheckIns::Upsert は API + 将来のジョブから）
4. **横断関心**（Ai::Logger はすべての AI 呼び出しに掛かる）

### 横断関心はブロック形式で表現

```ruby
Ai::Logger.call(user:, type:, model:, input:) do
  Ai::GoalSuggester.new.suggest(theme: theme)
end
```

→ 本来の処理を変えずに、**前後で何かしたい**（ログ / 計測 / トランザクション / ロック）パターンの定石。

---

## データ整合性の方針

### 二層 / 三層防御

| 制約                                     | 防御層 1（DB）              | 防御層 2（Rails）            | 防御層 3（コード）           |
| ---------------------------------------- | --------------------------- | ---------------------------- | ---------------------------- |
| 1 契約 1 紋章                            | UNIQUE INDEX (pact_id)      | validates uniqueness         | has_one + dependent          |
| 1 日 1 契約 1 チェックイン               | UNIQUE INDEX (pact_id, checked_on) | validates uniqueness  | with_lock                    |
| active 契約はユーザーごと最大 7 つ        | -                           | カスタムバリデーション       | -                            |
| `checked_on` のクライアント値受け付けない | -                           | before_validation で強制     | strong params で除外         |

**「DB レベルで弾けない race condition」と「Rails レベルで分かりやすい validation」の両方を仕掛ける**。

### `with_lock` を使う場面

```ruby
pact.with_lock do
  check_in = pact.check_ins.find_or_initialize_by(checked_on: Time.zone.today)
  check_in.update!(...)
end
```

→ **`SELECT FOR UPDATE`** で行ロックを取り、同一リソースへの並行更新を直列化。

特に「同時 POST が来ても 1 件だけ」を保証したい場面で必須。

### `update_columns` の使いどころ

`StreakCalculator#call` は `with_lock` 内で `update_columns` を使う：

```ruby
@user.with_lock do
  new_streak = calculate_current_streak
  @user.update_columns(streak_count: new_streak, longest_streak: ...)
end
```

- **callback 走らせない**（再帰 streak 更新を防ぐ）
- **同一 transaction で UPDATE 発行**（外側 rollback で巻き戻る）
- **validation skip**（streak は内部計算なのでバリデーション不要）

---

## v1.1 機能の連鎖（チェックイン → 達成 → 紋章）

```
[ユーザーが POST /pacts/:id/check_ins]
    ↓
[CheckIns::Upsert]
  - pact.with_lock 内で find_or_initialize_by + update!
  - 戻り値: [check_in, created?]
    ↓ created/updated → CheckIn.after_save 発火
[StreakCalculator#call]
  - users.with_lock で streak_count / longest_streak を更新
  - kept / broken / skipped の状態判定（skipped は伸ばさず切らず）
    ↓ controller transaction で続けて
[PactCompleter#call]
  - active かつ deadline 到達 + compliance_rate >= 0.5 で
    Pact.status = completed + completed_at = Time.current
  - completed は不可逆（後の訂正で active に戻らない）
    ↓ completed になったら
[CrestGenerator#call]
  - rarity 計算（difficulty × compliance_rate × period_score）
  - period_score は 0.5..6.0 にクランプ（爆発防止）
  - パーツ抽選（base_shape / central_motif / decoration / color_palette / shimmer_level）
  - Crest 保存 🏆
    ↓
[API レスポンス: { check_in, pact, achieved: true/false }]
    ↓
[FE: 達成画面遷移 + 紋章表示]
```

### 計算ロジックの統一

- **PactCompleter** と **CrestGenerator** で `compliance_rate` の分母を **「期間日数」**で統一
  - `kept_days / (deadline - signed_at + 1).days`
  - 「check_in 件数」を分母にすると「1 回 kept で 100%」のチートが可能になるため
- **`period_score` は 0.5..6.0 にクランプ**
  - 1 日契約や 1000 日契約で score が爆発しないように

### dense rank（ランキング）

- 同点は同順位、tie breaker は `score desc → updated_at asc → id asc`
- ページ更新で順序がブレないように

---

## AI 機能の方針

### モデル選定

- **OpenAI `gpt-5.4-nano`**（軽量・高速・安価、2026 年 3 月リリース）
- 4 機能：目標案 / 制約案 / 難易度判定 / 称号生成

### プロンプトの方針

- **目標 / 制約 / 難易度判定**：現代日本語の自然な表現（理解しやすさ優先）
- **称号生成**：中世ファンタジー風（達成後の演出として世界観を残す）

### ロギング（コスト分析・問題再現）

すべての AI 呼び出しを `ai_generations` テーブルに記録：

- input（プロンプト + パラメータ）
- output（レスポンス全文）
- status（success / failed / filtered）
- latency_ms / error_message
- generation_type（4 種類の enum）

### レート制限（濫用防止）

- 1 ユーザー 1 分 10 回（`ai_generations` の `(user_id, created_at)` INDEX を活用）
- 上限超過は 429 Too Many Requests + `{ errors: [{ code: "rate_limit_exceeded" }] }`

### MVP では同期処理

- OpenAI レスポンスは 1〜3 秒で完結
- ユーザー数が増えてレスポンスタイムが UX 上問題になったら Solid Queue で非同期化（将来）

---

## 検討した代替案

### 1. 完全分離（Vercel + Render）

| 項目                  | メリット                  | デメリット                                    |
| --------------------- | ------------------------- | --------------------------------------------- |
| デプロイ単位          | フロント / API 独立        | サービス 2 つで運用コスト 2 倍                 |
| CORS                  | 必須                      | Cookie 認証が複雑化、SameSite 問題             |
| 環境変数              | 二重管理                  | -                                              |
| 学習コスト            | -                         | env / preview deploy / 運用 2 倍                |

→ **MVP には過剰**。将来的にユーザー数が増えて CDN や preview deploy が欲しくなったら検討。

### 2. 完全 HTML mode（Rails のみ、SPA なし）

| 項目                  | メリット                  | デメリット                                    |
| --------------------- | ------------------------- | --------------------------------------------- |
| 学習コスト            | Rails 経験者には楽         | 中世ファンタジーの動的な演出が難しい           |
| 開発速度              | フォーム送信が単純         | チェックイン UI などのインタラクションが弱い   |
| モバイル展開          | 困難                      | -                                              |

→ Vow Pact の **「演出を効かせたい」プロダクト性質**に合わない。

### 3. Inertia.js（Rails + React の中間案）

| 項目                  | メリット                  | デメリット                                    |
| --------------------- | ------------------------- | --------------------------------------------- |
| 認証 / CSRF           | Rails 既定が動く           | -                                              |
| API 契約              | 不要（Rails が JSON 構築） | **モバイル展開時に JSON API が必要**           |
| エコシステム          | 比較的小                  | Vite + React の知見が直接活かせない             |

→ **モバイル展開を見越して `/api/v1/` の JSON API を持っておきたい**ので不採用。

### 4. Devise（認証 gem）

| 項目                  | メリット                  | デメリット                                    |
| --------------------- | ------------------------- | --------------------------------------------- |
| 機能                  | 豊富                      | パスワードリセット程度なら Rails 8 標準で十分 |
| 学習コスト            | -                         | Devise の規約を覚える必要                     |
| 依存                  | -                         | gem 依存が増える                              |

→ Rails 8 ジェネレータで十分。Devise は不採用。

### 5. Sidekiq（バックグラウンドジョブ）

| 項目                  | メリット                  | デメリット                                    |
| --------------------- | ------------------------- | --------------------------------------------- |
| パフォーマンス        | 高速                      | **Redis 必須 → Render Free では別 dyno 必要** |
| 機能                  | 豊富                      | -                                              |

→ Rails 8 標準の **Solid Queue**（PostgreSQL 上で動く）を採用。Redis 不要、1 サービスで完結。

---

## 将来の再評価ポイント

| トリガー                                             | 検討すべきこと                                          |
| ---------------------------------------------------- | ------------------------------------------------------- |
| ユーザー数 1000+ / レスポンスタイムが UX 問題         | フロント分離（Vercel）/ Solid Queue 非同期化           |
| モバイルアプリ展開                                   | Bearer token 認証併用（Cookie + Token のハイブリッド）|
| AI ジョブが重い（画像生成等）                         | Solid Queue worker の専用 dyno 分離                    |
| チームが 3 人以上に                                  | OpenAPI / rswag で API 契約を可視化                   |
| Render Free の月間枠が苦しくなる                     | Render Standard or Fly.io / Railway 移行               |
| データ量が増えて Neon Free の上限                    | Neon Scale プラン or 別 PostgreSQL                     |

---

## 参考リンク

- [Rails API-only guide](https://guides.rubyonrails.org/api_app.html)
- [Rails Security guide](https://guides.rubyonrails.org/security.html)
- [vite_ruby Rails integration](https://vite-ruby.netlify.app/guide/rails.html)
- [`docs/data_model.md`](data_model.md) — テーブル仕様
- [`docs/api_design.md`](api_design.md) — API 設計判断
- [`CLAUDE.md`](../CLAUDE.md) — プロジェクト全体規約
