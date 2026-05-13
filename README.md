# 誓約 ⚔ 契約 — Vow Pact

> **目標と試練を「誓い」に変え、達成すれば紋章を得る。**
> 自分との契約を形にする、中世ファンタジー風の自己鍛錬 SPA。

[![Production](https://img.shields.io/badge/production-vow--pact.onrender.com-8b1a1a)](https://vow-pact.onrender.com)
[![Ruby](https://img.shields.io/badge/Ruby-3.4-c01136)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-8.1-cc0000)](https://rubyonrails.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)

---

## 目次

- [コンセプト](#コンセプト)
- [使い方](#使い方)
- [主要機能](#主要機能)
- [技術スタック](#技術スタック)
- [プロジェクト構造](#プロジェクト構造)

---

## コンセプト

「TODO」より重く、「誓い」として刻む自己鍛錬アプリ。

ユーザーは **目標 + 制約 + 期日** を契約として誓い、毎日チェックインで進捗を記録する。
契約期間中の遵守率が一定を超えると **紋章（4 段階レアリティ）** が授与される。

### 差別化ポイント

- **制約の明示**：単なる目標ではなく「やらないこと」もセットで誓う（例：「毎日 30 分読書する」+「夜 22 時以降スマホを触らない」）
- **紋章・称号付与**：達成体験をゲーム性で強化（common / rare / epic / legendary）
- **中世ファンタジー世界観**：羊皮紙風のデザインで「誓い」の重みを演出

本番デモ：**https://vow-pact.onrender.com**

---

## 使い方

### 1. アカウント登録

トップページから「新規登録」を選び、メールアドレスとパスワードでアカウントを作成する。

### 2. 契約を結ぶ（4 ステップ）

「新たな誓約を結ぶ」から、以下の順で進める：

| Step | 内容       | 補助                                                     |
| ---- | ---------- | -------------------------------------------------------- |
| 1    | 目標を決める | テーマを入れて AI に提案してもらえる / おまかせも可  |
| 2    | 制約を決める | 目標に合った制約を AI に提案してもらえる              |
| 3    | 期日と難易度 | 期日を選ぶと AI が難易度（⚔ 1〜5）を判定           |
| 4    | 内容を確認  | 「ここに誓う」で締結 → 𝕏 でシェアもできる           |

### 3. 毎日チェックインする

契約期間中、その日の状態を 1 日 1 回記録する：

- ⚔ **守れた**（kept）— 連続記録が伸びる
- ✗ **破れた**（broken）— 連続記録が途切れる
- — **休戦**（skipped）— 連続記録は途切れず、伸びもしない

同じ日に再度チェックインすると **訂正（上書き）** される。

### 4. 達成すると紋章が授与される 🏆

期日まで来て、契約期間中の遵守率が **半分以上** なら自動的に達成扱いとなり、
**紋章（common / rare / epic / legendary）** が授与される。

レアリティは「難易度 × 遵守率 × 期間」から計算される。

### 5. ホームで自分の歩みを一望する

ログイン中は **ホーム（`/`）がそのままダッシュボード**になる。

- 統計ブロック（達成数 / 連続日数 / 最長記録）
- 進行中の契約カード + 達成済みの紋章カード（フィルタ・ソート対応）
- 紋章カタログ（取得済み / 未取得を一覧表示）

### 6. 他の誓約者の歩みを覗く（広場 `/explore`）

公開された他ユーザーの契約を **新着順** で閲覧できる。
誓約のテーマや制約の発想を借りたいときの参考に。

### 7. ランキングで他のユーザーと競う

公開ユーザー同士で 2 軸のランキング：

- **月間達成数**：今月 completed になった契約の数
- **連続記録**：日々のチェックインが連続している日数

自分の順位は非公開設定でも自分には見える。

---

## 主要機能

| 機能                 | 内容                                                              |
| -------------------- | ----------------------------------------------------------------- |
| 認証                 | メール + パスワード（Cookie セッション、Devise 不採用）          |
| 契約作成             | 4 ステップ（目標 → 制約 → 期日と難易度 → 確認）                   |
| AI 提案              | テーマ→目標案 / 目標→制約案 / 難易度判定 / おまかせランダム提案   |
| チェックイン         | 1 日 1 契約 1 件、訂正は同日 POST で UPDATE                       |
| 連続記録             | StreakCalculator が `users.streak_count` を自動更新                |
| 達成判定             | PactCompleter が compliance_rate ≥ 0.5 で `completed` 化         |
| 紋章生成             | CrestGenerator がレアリティ計算 + パーツ抽選で紋章を自動生成      |
| ホーム ダッシュボード | ログイン時に統計 / 進行中契約 / 達成紋章 / 紋章カタログを集約    |
| 公開フィード         | `/explore` で他ユーザーの公開契約を新着順に閲覧                  |
| シェア用ページ       | `/p/:id` で OGP メタを HTML 直埋め込み → X カード対応             |
| 使い方ページ         | `/how-it-works` でコンセプトと操作手順を説明                      |
| 進捗の可視化         | ProgressGrass（GitHub commit 風の 7×N グリッド）で日々の状態を表示 |
| ランキング           | 月間達成数ランキング / 連続記録ランキング（dense rank）           |
| 𝕏 シェア             | 契約締結時に X 投稿画面を開く                                     |
| AI ロギング          | 全 AI 呼び出しを ai_generations に記録（コスト分析・問題再現）   |
| レート制限           | 1 ユーザー 1 分 10 回（429 で弾く）                              |

---

## 技術スタック

### バックエンド

| カテゴリ           | 採用                                    | 不採用                       |
| ------------------ | --------------------------------------- | ---------------------------- |
| 言語 / FW          | Ruby 3.4 / Rails 8.1                    | -                            |
| DB                 | PostgreSQL 18（dev: Docker / prod: Neon）| -                            |
| 認証               | Rails 8 標準ジェネレータ                | Devise                       |
| Job / Cache        | Solid Queue / Solid Cache               | Sidekiq / Redis              |
| Serializer         | alba                                    | active_model_serializers     |
| Test / Lint        | RSpec / factory_bot / faker / RuboCop   | Minitest                     |
| AI                 | OpenAI（gpt-5.4-nano）                  | -                            |

### フロントエンド

| カテゴリ           | 採用                                       |
| ------------------ | ------------------------------------------ |
| 言語 / FW          | TypeScript 5 / React 19                    |
| ビルド             | Vite + vite_rails（Rails 統合）            |
| ルーティング       | React Router v7                            |
| 状態管理           | TanStack Query v5（サーバ状態）/ React Context（ローカル状態）|
| スタイリング       | Tailwind CSS v4（CSS 変数で羊皮紙系 3 層階調を定義）|
| アニメーション     | Framer Motion（ページ遷移 / 締結演出 / `useReducedMotion` 尊重）|
| Test / Lint        | Vitest + Testing Library / ESLint + Prettier|

### インフラ / 開発環境

| カテゴリ           | 採用                                       |
| ------------------ | ------------------------------------------ |
| 開発環境           | Docker Compose                             |
| 本番アプリ         | Render Free                                |
| 本番 DB            | Neon Free（PostgreSQL）                    |
| CI / CD            | GitHub Actions（lint + scan + Render auto-deploy）|

設計判断の詳細は [`docs/architecture.md`](docs/architecture.md) を参照。

---

## プロジェクト構造

```
vow_pact/
├── app/
│   ├── controllers/
│   │   ├── api/v1/                  # API エンドポイント（auth, pacts, check_ins, rankings, ai, explore）
│   │   ├── concerns/                # 認証 / レート制限など横断関心
│   │   ├── public_pacts_controller.rb # /p/:id 公開契約シェアページ（OGP 埋め込み）
│   │   └── home_controller.rb       # SPA shell（HTML 配信のみ）
│   ├── models/                      # users, pacts, check_ins, crests, ai_generations, sessions
│   ├── services/
│   │   ├── pact_completer.rb        # compliance_rate ≥ 0.5 で completed 化
│   │   ├── streak_calculator.rb     # 連続記録の集計
│   │   ├── crest_generator.rb       # レアリティ計算 + パーツ抽選
│   │   ├── pact_og_image_generator.rb # 動的 OG 画像（現在は静的 PNG にフォールバック）
│   │   ├── check_ins/               # チェックイン関連サービス
│   │   └── ai/                      # GoalSuggester, ConstraintSuggester, DifficultyJudge, TitleGenerator, Logger
│   ├── serializers/                 # alba ベース
│   ├── views/layouts/               # OGP メタタグを埋め込む application.html.erb
│   └── frontend/                    # vite_rails 規約
│       ├── pages/                   # HomePage(ダッシュボード), ExplorePage(広場), HowItWorksPage,
│       │                            # AuthPage, CreatePactStep1〜4, SignedPage, PactDetailPage,
│       │                            # PublicPactPage, RankingsPage, SettingsPage,
│       │                            # ForgotPasswordPage, ResetPasswordPage
│       ├── components/              # Layout, BottomTabs, Footer, RequireAuth,
│       │                            # Button, FormField, Modal, ShareButton,
│       │                            # HeraldicCrest(盾形紋章 SVG), PactSeal(蝋印 SVG),
│       │                            # ProgressGrass(草式進捗), ContractCard(契約書カード),
│       │                            # CornerOrnament, StarDivider,
│       │                            # HallContent / HallStatsBlock / HallFilterBar / CrestCatalog
│       ├── hooks/                   # useAuth, useAi
│       ├── contexts/                # CreatePactContext
│       ├── lib/                     # api fetch wrapper, share builder
│       ├── constants/               # 文言テンプレート
│       ├── styles/                  # application.css（@theme で羊皮紙系トークン定義）
│       └── types/                   # TypeScript 型定義
│
├── public/
│   ├── og.png                       # ブランド OGP 画像（1200×630、静的）
│   └── robots.txt                   # Twitterbot / facebookexternalhit 等に明示的 Allow
│
├── spec/                            # RSpec
│   ├── models/
│   ├── requests/api/v1/
│   ├── services/
│   └── factories/
│
├── docs/
│   ├── architecture.md              # アーキテクチャと設計判断
│   ├── data_model.md                # ER 図 + テーブル仕様
│   ├── api_design.md                # API 設計判断記録
│   ├── setup_guide.md               # 詳細セットアップ手順
│   └── VowPact_mock/                # デザインモック（jsx）
│
├── docker-compose.yml
├── render.yaml                      # 本番デプロイ設定
├── CLAUDE.md                        # プロジェクトガイド
└── README.md                        # ← この文書
```
