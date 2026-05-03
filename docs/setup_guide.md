# Vow Pact セットアップガイド（Docker 版）

このガイドは、Vow Pact プロジェクトを **Docker 環境** で開発するためのセットアップ手順書です。
設計フェーズで決めた技術スタックを Docker で動くプロジェクトとして立ち上げます。

## ゴール

このガイドを完了すると、以下の状態になります：

- Docker Compose で Rails 8.1 + React + TypeScript + PostgreSQL 18 が起動する
- ローカルマシンには Ruby 3.4 のみ追加インストール（PostgreSQL はコンテナ内）
- GitHub リポジトリが作成され、初回コミット済み
- Neon との本番 DB 接続準備完了
- Render へのデプロイ準備完了
- GitHub Actions の CI 設定済み

つまり「Docker でコードを書き始められる状態」がゴールです。

## 想定所要時間

3〜5時間（休憩込み、Docker 学習込み）

## 進め方

各フェーズを順番に実行してください。各フェーズの最後に **✅ チェックポイント** があるので、そこで動作確認をしてから次に進みます。

エラーが出た場合は、最後の「12. トラブルシューティング」を参照してください。

## このガイドの方針

- **ローカル開発は Docker で完結**（PostgreSQL はコンテナ内）
- **ローカルにも Ruby 3.4 をインストール**（IDE 補完と `rails new` 用）
- **本番デプロイは Render の標準フロー**（Docker は使わない、Render のビルドプロセス）

---

## 目次

1. [前提条件](#1-前提条件)
2. [Ruby 3.4 のインストール（mise）](#2-ruby-34-のインストールmise)
3. [Rails プロジェクトの新規作成](#3-rails-プロジェクトの新規作成)
4. [Docker 環境の構築](#4-docker-環境の構築)
5. [データベース接続設定](#5-データベース接続設定)
6. [Gem の追加とセットアップ](#6-gem-の追加とセットアップ)
7. [フロントエンド環境の構築](#7-フロントエンド環境の構築)
8. [テスト・Lint 環境の整備](#8-テストlint-環境の整備)
9. [GitHub リポジトリの作成](#9-github-リポジトリの作成)
10. [Render デプロイ準備](#10-render-デプロイ準備)
11. [CI/CD（GitHub Actions）の設定](#11-cicdgithub-actionsの設定)
12. [動作確認](#12-動作確認)
13. [トラブルシューティング](#13-トラブルシューティング)

---

## 1. 前提条件

### ローカル環境の確認

以下のツールがインストールされているか確認します。

```bash
# Docker Desktop の確認
docker --version
# 期待値: Docker version 24.x.x 以上

docker compose version
# 期待値: Docker Compose version v2.x.x 以上

# Node.js のバージョン確認（Vite が要求するバージョン、開発機にも入れておく）
node --version
# 期待値: v20.x 以上

# Git の確認
git --version
# 期待値: git version 2.x

# GitHub CLI の確認
gh --version
# 期待値: gh version 2.x.x
```

**注意**: Ruby は次のフェーズでインストールします。
**注意**: PostgreSQL はローカルにインストール不要（Docker コンテナ内で動かすため）。

### Docker Desktop の起動確認

Mac のメニューバーにクジラのアイコンが表示されているか確認。表示されていない場合は Docker Desktop アプリを起動してください。

```bash
# Docker が動いているか確認
docker ps
# エラーが出なければ OK
```

### 必要なアカウント

以下のアカウントを事前に作成してください：

- [GitHub](https://github.com/) - ソースコード管理
- [Neon](https://neon.tech/) - 本番データベースホスティング
- [Render](https://render.com/) - アプリケーションホスティング
- [OpenAI](https://platform.openai.com/) - AI API

### ✅ チェックポイント1

- [ ] Docker Desktop が起動している
- [ ] `docker ps` がエラーなく実行できる
- [ ] Node.js 20+ が動く
- [ ] Git、GitHub CLI が使える
- [ ] 必要なアカウントを作成済み

---

## 2. Ruby 3.4 のインストール（mise）

ローカルマシンに Ruby 3.4 を入れます。`rails new` の実行と IDE の補完用です。

### mise のインストール

mise は複数言語のバージョン管理ツールで、最近の主流です。

```bash
# Homebrew で mise をインストール
brew install mise

# シェル設定（zsh の場合、~/.zshrc に追加）
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc

# 設定を反映
source ~/.zshrc

# 確認
mise --version
```

### Ruby 3.4 のインストール

```bash
# Ruby 3.4 の最新版をインストール
mise install ruby@3.4

# グローバル設定（マシン全体のデフォルト）
mise use --global ruby@3.4

# 確認
ruby --version
# 期待値: ruby 3.4.x
```

### Rails 8.1 のインストール

```bash
# Rails 8.1 をインストール
gem install rails -v 8.1.3

# 確認
rails --version
# 期待値: Rails 8.1.3
```

### ✅ チェックポイント2

- [ ] `mise --version` が動く
- [ ] `ruby --version` が 3.4.x を表示
- [ ] `rails --version` が 8.1.3 を表示

---

## 3. Rails プロジェクトの新規作成

### プロジェクトディレクトリの準備

開発用ディレクトリ（例：`~/Projects`）に移動します。

```bash
cd ~/Projects
```

### rails new コマンド

以下のコマンドで Vow Pact プロジェクトを新規作成します。

```bash
rails new vow_pact \
  --javascript=vite \
  --css=tailwind \
  --database=postgresql \
  --skip-test \
  --skip-jbuilder
```

**各オプションの説明**：

- `--javascript=vite`: フロントエンドのビルドに Vite を使用
- `--css=tailwind`: Tailwind CSS を最初からセットアップ
- `--database=postgresql`: DB を PostgreSQL に設定
- `--skip-test`: 標準の Minitest をスキップ（後で RSpec を入れる）
- `--skip-jbuilder`: jbuilder をスキップ（alba を使う）

実行が完了すると、`~/Projects/vow_pact/` ディレクトリが作成されます。

### プロジェクトディレクトリへ移動

```bash
cd vow_pact
```

### ✅ チェックポイント3

- [ ] `~/Projects/vow_pact/` ディレクトリが作成された
- [ ] 中に Gemfile、app/、config/ などのファイル・ディレクトリがある

```bash
# 確認
ls -la
```

---

## 4. Docker 環境の構築

ここから Docker の出番です。

### 4.1 Dockerfile.dev の作成

開発用の Dockerfile を作成します。プロジェクトルートに `Dockerfile.dev` を作成：

```dockerfile
# Dockerfile.dev
# 開発用 Dockerfile

FROM ruby:3.4-slim

# 必要なパッケージのインストール
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    npm \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Node.js を新しいバージョンに更新（n を使う）
RUN npm install -g n && n stable && hash -r

# 作業ディレクトリ
WORKDIR /app

# Gemfile を先にコピー（Docker キャッシュを活用）
COPY Gemfile Gemfile.lock ./
RUN bundle install

# package.json も先にコピー
COPY package.json package-lock.json* ./
RUN npm install || true

# アプリケーションのソースをコピー
COPY . .

# ポート公開
EXPOSE 3000 5173

# 起動コマンド（docker-compose.yml で上書きされる）
CMD ["bin/dev"]
```

**この Dockerfile の解説**：

- `ruby:3.4-slim`: 軽量な Ruby 3.4 公式イメージ
- `apt-get install`: PostgreSQL クライアント、Node.js、Git などをインストール
- `n stable`: より新しい Node.js に更新（apt のは古い）
- `WORKDIR /app`: コンテナ内の作業ディレクトリ
- `Gemfile を先にコピー`: Docker のレイヤーキャッシュを活用、ソース変更時に bundle install を再実行しない
- `EXPOSE 3000 5173`: Rails サーバーと Vite の両方のポート

### 4.2 docker-compose.yml の作成

プロジェクトルートに `docker-compose.yml` を作成：

```yaml
# docker-compose.yml

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"  # Rails サーバー
      - "5173:5173"  # Vite dev サーバー
    volumes:
      - .:/app:cached  # ホストとコンテナでソースを共有（cached モード）
      - bundle_cache:/usr/local/bundle  # gem のキャッシュを保持
      - node_modules:/app/node_modules  # node_modules を分離
    environment:
      DATABASE_URL: postgresql://vow_pact:password@db:5432/vow_pact_development
      RAILS_ENV: development
      BINDING: 0.0.0.0  # コンテナ外からアクセス可能に
    depends_on:
      db:
        condition: service_healthy
    tty: true
    stdin_open: true

  db:
    image: postgres:18
    environment:
      POSTGRES_USER: vow_pact
      POSTGRES_PASSWORD: password
      POSTGRES_DB: vow_pact_development
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"  # ホストからも接続可能（GUI ツール用）
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vow_pact"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:    # DB データを永続化
  bundle_cache:     # gem のキャッシュを永続化
  node_modules:     # node_modules を永続化
```

**この docker-compose.yml の解説**：

- `services.web`: Rails アプリのコンテナ
  - `build.dockerfile`: Dockerfile.dev を使う
  - `ports`: ホストの 3000 と 5173 をコンテナの同ポートにマップ
  - `volumes`: ソースを共有（コードを書き換えればコンテナ内に反映）
  - `cached`: Mac での I/O パフォーマンス改善
  - `bundle_cache`: gem のインストール先を分離（コンテナ削除しても残る）
  - `depends_on`: db が healthy になってから起動
- `services.db`: PostgreSQL 18 コンテナ
  - `volumes`: DB データを永続化
  - `ports`: ホストからも接続可能（TablePlus などで覗ける）
  - `healthcheck`: DB が起動しきったか定期チェック
- `volumes`: 名前付きボリューム（コンテナ削除しても残る）

### 4.3 .dockerignore の作成

Docker イメージに含めたくないファイルを指定。プロジェクトルートに `.dockerignore` を作成：

```
# .dockerignore

.git
.gitignore
.dockerignore
Dockerfile*
docker-compose*.yml
README.md

# Rails
log/*
tmp/*
storage/*
node_modules
.bundle
vendor/bundle
public/assets
public/packs
public/vite

# 環境変数
.env
.env.*
!.env.example

# OS
.DS_Store
Thumbs.db

# エディタ
.vscode/
.idea/
*.swp

# テスト
coverage/
spec/examples.txt
```

### 4.4 BINDING 環境変数の対応

Rails サーバーがコンテナ外からアクセス可能になるよう、`Procfile.dev` を確認・編集します。

`Procfile.dev`：

```
web: bin/rails server -p 3000 -b 0.0.0.0
vite: bin/vite dev --host 0.0.0.0
```

`-b 0.0.0.0` がポイント。これがないと、コンテナ内の `localhost` だけがリスンされ、ホストから繋がりません。

### 4.5 Vite の設定（コンテナ用）

`vite.config.js` を編集。HMR（ホットリロード）が Docker でも効くようにします。

```javascript
// vite.config.js

import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'

export default defineConfig({
  plugins: [
    RubyPlugin(),
  ],
  server: {
    host: '0.0.0.0',  // コンテナ外からアクセス可能に
    port: 5173,
    hmr: {
      host: 'localhost',
    },
  },
})
```

### 4.6 コンテナのビルドと起動

初回はイメージのビルドが必要です。

```bash
# イメージのビルド（初回のみ、5〜10分かかる）
docker compose build

# コンテナの起動
docker compose up
```

ログが流れて、最後に Rails サーバーが起動するメッセージが見えれば成功です。

```
web-1  | * Listening on http://0.0.0.0:3000
```

### 4.7 動作確認

ブラウザで http://localhost:3000 を開きます。
ただし、まだ DB の作成をしていないので、エラー画面が出るはずです。
これは正常です（次のフェーズで対処）。

`Ctrl + C` でコンテナを停止します。

### よく使う Docker コマンド

これから何度も使うコマンドを覚えておきましょう。

```bash
# コンテナ起動（フォアグラウンド）
docker compose up

# バックグラウンドで起動
docker compose up -d

# ログを見る
docker compose logs -f web

# コンテナ内でコマンド実行
docker compose exec web bash             # シェルに入る
docker compose exec web bin/rails console  # Rails コンソール
docker compose exec web bundle exec rspec  # RSpec 実行

# コンテナを止める
docker compose down

# コンテナを止めて、ボリュームも削除（DBデータも消える）
docker compose down -v

# イメージを再ビルド
docker compose build --no-cache
```

### エイリアスの設定（オプション、便利）

`docker compose exec web` は長いので、`~/.zshrc` にエイリアスを追加すると楽です。

```bash
# ~/.zshrc に追加
alias dce="docker compose exec"
alias dcw="docker compose exec web"
alias dcrails="docker compose exec web bin/rails"
alias dcrspec="docker compose exec web bundle exec rspec"
alias dcrubocop="docker compose exec web bundle exec rubocop"
alias dcbundle="docker compose exec web bundle"

# 設定を反映
source ~/.zshrc
```

これで `dcw bash` や `dcrails console` のように短く書けます。

### ✅ チェックポイント4

- [ ] `Dockerfile.dev` が作成された
- [ ] `docker-compose.yml` が作成された
- [ ] `.dockerignore` が作成された
- [ ] `docker compose build` が完了した
- [ ] `docker compose up` で起動できる
- [ ] http://localhost:3000 にアクセスできる（DBエラーは正常）

---

## 5. データベース接続設定

### 5.1 config/database.yml の修正

開発環境では Docker の PostgreSQL、本番では Neon を使う設定に変更します。

```yaml
# config/database.yml

default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  url: <%= ENV.fetch("DATABASE_URL") %>

test:
  <<: *default
  url: <%= ENV.fetch("DATABASE_URL", "postgresql://vow_pact:password@db:5432/vow_pact_test") %>

production:
  <<: *default
  url: <%= ENV.fetch("DATABASE_URL") %>
```

開発環境では `docker-compose.yml` で設定した `DATABASE_URL` を使います。

### 5.2 DB の作成

コンテナを起動した状態で、別ターミナルから DB を作成します。

```bash
# コンテナを起動（バックグラウンドで）
docker compose up -d

# DB の作成
docker compose exec web bin/rails db:create
# または、エイリアスを設定済みなら：
# dcrails db:create

# テスト DB の作成（後で必要）
docker compose exec web bin/rails db:create RAILS_ENV=test
```

成功すると以下のメッセージが表示されます：

```
Created database 'vow_pact_development'
Created database 'vow_pact_test'
```

### 5.3 動作確認

ブラウザで http://localhost:3000 を再読み込み。
Rails の初期画面が表示されれば成功です。

### 5.4 .env ファイルの準備（本番用）

本番環境（Render）と OpenAI API 用の環境変数の準備をします。

```bash
# .env.example（git管理する）
touch .env.example

# .env（git管理しない）
touch .env
```

`.env.example` に以下を記載：

```bash
# .env.example

# Database (本番用、Neon)
DATABASE_URL=postgresql://USER:PASSWORD@HOST/vow_pact_production?sslmode=require

# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxx

# Rails
RAILS_MASTER_KEY=（config/master.key の内容）

# Frontend
FRONTEND_URL=http://localhost:5173
```

`.env` には実際の値を記載（後で Neon の接続情報、OpenAI の API キーが揃ってから）。

### 5.5 .gitignore の確認

`.env` が git 管理外になっているか確認。なければ追加：

```bash
# .gitignore に以下が含まれていることを確認
.env
.env.local
```

### ✅ チェックポイント5

- [ ] `config/database.yml` が更新された
- [ ] `bin/rails db:create` が成功した
- [ ] http://localhost:3000 で Rails の初期画面が見える
- [ ] `.env.example` と `.env` が作成された
- [ ] `.env` が `.gitignore` に含まれている

---

## 6. Gem の追加とセットアップ

### 6.1 必要な gem を Gemfile に追加

`Gemfile` を編集して、以下の gem を追加：

```ruby
# Gemfile

# 既存の gem に加えて、以下を追加

# Authentication（Rails 8 標準ジェネレータで使用）
gem 'bcrypt', '~> 3.1.7'

# Serializer
gem 'alba'

# OpenAI API クライアント
gem 'ruby-openai'

# CORS 対応
gem 'rack-cors'

# テスト用
group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'dotenv-rails'
end

# 開発用
group :development do
  gem 'rubocop-rails-omakase', require: false
end
```

### 6.2 bundle install（コンテナ内で）

```bash
docker compose exec web bundle install
```

実行後、コンテナを再起動して新しい gem が読み込まれるようにします。

```bash
docker compose restart web
```

### 6.3 認証ジェネレータの実行

```bash
docker compose exec web bin/rails generate authentication
```

以下が生成されます：

- `app/models/user.rb`
- `app/models/session.rb`
- `app/controllers/sessions_controller.rb`
- `app/controllers/passwords_controller.rb`
- `db/migrate/xxxx_create_users.rb`
- `db/migrate/xxxx_create_sessions.rb`
- 関連するビューやメーラー

### 6.4 認証ジェネレータの調整（API mode）

API mode では HTML ビューが不要なので削除します。

```bash
# コンテナ外（ホスト）で実行
rm -rf app/views/sessions
rm -rf app/views/passwords
rm -rf app/views/passwords_mailer
```

メール認証用の mailer 関連は残します（パスワードリセットで使う）。

### 6.5 マイグレーションの実行

```bash
docker compose exec web bin/rails db:migrate
```

### 6.6 RSpec のセットアップ

```bash
docker compose exec web bin/rails generate rspec:install
```

以下のファイルが生成されます：

- `.rspec`
- `spec/spec_helper.rb`
- `spec/rails_helper.rb`

### 6.7 RSpec の設定

`spec/rails_helper.rb` を編集して、factory_bot ヘルパーを使えるようにします。

```ruby
# spec/rails_helper.rb の RSpec.configure ブロック内に追加

config.include FactoryBot::Syntax::Methods
```

### 6.8 ApplicationController の設定（API mode）

`app/controllers/application_controller.rb` を編集：

```ruby
# app/controllers/application_controller.rb

class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :authenticate_user!

  private

  def authenticate_user!
    return if current_user.present?

    render json: {
      errors: [{ code: 'unauthorized', field: nil, message: 'ログインが必要です' }]
    }, status: :unauthorized
  end

  def current_user
    @current_user ||= authenticate_user_from_session
  end

  def authenticate_user_from_session
    session_token = cookies.signed[:session_token]
    return nil unless session_token

    session = Session.find_by(token: session_token)
    session&.user
  end
end
```

### 6.9 CORS の設定

`config/initializers/cors.rb` を作成：

```ruby
# config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('FRONTEND_URL', 'http://localhost:5173')

    resource '*',
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: true
  end
end
```

### 6.10 OpenAI クライアントの設定

`config/initializers/openai.rb` を作成：

```ruby
# config/initializers/openai.rb

OpenAI.configure do |config|
  config.access_token = ENV.fetch('OPENAI_API_KEY', '')
  config.log_errors = Rails.env.development?
end
```

`OPENAI_API_KEY` が無い場合でも起動できるように、空文字列をデフォルトにしています（実際の AI 機能を使うときには必要）。

### ✅ チェックポイント6

- [ ] `bundle install` が成功
- [ ] 認証ジェネレータが実行され、users/sessions テーブルが作成された
- [ ] RSpec がセットアップされた
- [ ] CORS と OpenAI クライアントの設定が完了
- [ ] `bin/rails console` で `User` クラスが見える

```bash
# 確認
docker compose exec web bin/rails console
# > User
# # => User(id: integer, ...)
# > exit
```

---

## 7. フロントエンド環境の構築

### 7.1 React + TypeScript パッケージのインストール

```bash
docker compose exec web npm install \
  react react-dom react-router-dom

docker compose exec web npm install --save-dev \
  typescript \
  @types/react \
  @types/react-dom \
  @vitejs/plugin-react \
  @types/node
```

### 7.2 TanStack Query のインストール

```bash
docker compose exec web npm install @tanstack/react-query
```

### 7.3 Tailwind CSS の設定

`tailwind.config.js` を編集：

```javascript
// tailwind.config.js

module.exports = {
  content: [
    './app/views/**/*.{erb,haml,html,slim}',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vow Pact のカラーパレット
        parchment: '#f4e8d0',
        ink: '#2c1810',
        seal: '#8b1a1a',
        gold: '#c9a961',
        'light-parchment': '#fbf6e9',
        'dark-ink': '#1a0e08',
        'seal-hover': '#6f1414',
        'gold-glow': '#e6c887',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        serif: ['"Noto Serif JP"', 'serif'],
      },
    },
  },
  plugins: [],
}
```

### 7.4 Vite の TypeScript 化

`vite.config.js` を `vite.config.ts` にリネーム：

```bash
mv vite.config.js vite.config.ts
```

`vite.config.ts` の内容を編集：

```typescript
// vite.config.ts

import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'localhost',
    },
  },
})
```

### 7.5 TypeScript 設定（tsconfig.json）

プロジェクトルートに `tsconfig.json` を作成：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/javascript/*"]
    }
  },
  "include": ["app/javascript/**/*"],
  "exclude": ["node_modules"]
}
```

### 7.6 エントリーポイントの作成

```bash
# 既存の application.js を削除
rm app/javascript/entrypoints/application.js
```

`app/javascript/entrypoints/application.tsx` を作成：

```typescript
// app/javascript/entrypoints/application.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import '../styles/application.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
    },
  },
})

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
}
```

### 7.7 App.tsx の作成

`app/javascript/App.tsx` を作成（最初は最小限）：

```typescript
// app/javascript/App.tsx

import React from 'react'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment text-ink p-8">
      <h1 className="text-4xl font-serif">Vow Pact</h1>
      <p className="mt-4">セットアップ完了。実装フェーズに進めます。</p>
    </div>
  )
}

export default App
```

### 7.8 styles/application.css の確認

`app/javascript/styles/application.css`：

```css
/* app/javascript/styles/application.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Google Fonts: Noto Sans JP / Noto Serif JP */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;700&display=swap');
```

### 7.9 ルートビューの作成

`config/routes.rb`：

```ruby
# config/routes.rb

Rails.application.routes.draw do
  # API 関連
  namespace :api do
    namespace :v1 do
      # ここに API ルートを追加していく
    end
  end

  # フロントエンドの SPA を返すルート（API 以外のすべてのパス）
  get '*path', to: 'home#index', constraints: ->(req) { !req.xhr? && req.format.html? }
  root 'home#index'
end
```

`app/controllers/home_controller.rb` を作成：

```ruby
# app/controllers/home_controller.rb

class HomeController < ActionController::Base
  skip_before_action :verify_authenticity_token

  def index
    render html: <<~HTML.html_safe
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vow Pact</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          #{vite_javascript_tag 'application'}
          #{vite_stylesheet_tag 'application'}
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    HTML
  end

  private

  def vite_javascript_tag(entry)
    ViteRuby.instance.manifest.path_for(entry, type: :javascript)
  end

  def vite_stylesheet_tag(entry)
    ViteRuby.instance.manifest.path_for(entry, type: :stylesheet)
  end
end
```

### 7.10 動作確認

```bash
# 一度コンテナを再起動
docker compose restart web
```

ブラウザで http://localhost:3000 を開きます。
「Vow Pact / セットアップ完了。実装フェーズに進めます。」が表示され、背景がパーチメント色（薄ベージュ）になっていれば成功です。

### ✅ チェックポイント7

- [ ] React + TypeScript のパッケージがインストールされた
- [ ] Vite + React の設定が完了
- [ ] http://localhost:3000 で「Vow Pact」のページが表示される
- [ ] 背景がパーチメント色（#f4e8d0）になっている
- [ ] Tailwind CSS のクラスが適用されている

---

## 8. テスト・Lint 環境の整備

### 8.1 RuboCop の設定

`.rubocop.yml` を作成：

```yaml
# .rubocop.yml

inherit_gem:
  rubocop-rails-omakase: rubocop.yml

AllCops:
  TargetRubyVersion: 3.4
  NewCops: enable
  Exclude:
    - 'db/schema.rb'
    - 'db/migrate/**/*'
    - 'bin/**/*'
    - 'tmp/**/*'
    - 'vendor/**/*'
    - 'node_modules/**/*'

Style/Documentation:
  Enabled: false
```

### 8.2 RuboCop の実行

```bash
docker compose exec web bundle exec rubocop -a
```

### 8.3 ESLint + Prettier のインストール

```bash
docker compose exec web npm install --save-dev \
  eslint \
  prettier \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier
```

### 8.4 ESLint と Prettier の設定

`.eslintrc.json` を作成：

```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "@typescript-eslint", "react-hooks"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off"
  }
}
```

`.prettierrc` を作成：

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 8.5 package.json にスクリプト追加

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint app/javascript --ext .ts,.tsx",
    "lint:fix": "eslint app/javascript --ext .ts,.tsx --fix",
    "format": "prettier --write 'app/javascript/**/*.{ts,tsx}'"
  }
}
```

### 8.6 Vitest のセットアップ

```bash
docker compose exec web npm install --save-dev \
  vitest jsdom @testing-library/react @testing-library/jest-dom
```

`vitest.config.ts` を作成：

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/javascript/test/setup.ts'],
  },
})
```

`app/javascript/test/setup.ts` を作成：

```typescript
import '@testing-library/jest-dom'
```

### ✅ チェックポイント8

- [ ] `bundle exec rubocop` が通る
- [ ] `npm run lint` が通る
- [ ] `bundle exec rspec` が動く（テストファイルなしでも OK）

---

## 9. GitHub リポジトリの作成

### 9.1 .gitignore の確認

`.gitignore` に以下が含まれていることを確認（`rails new` で大半は含まれているはず）：

```
# 環境変数
.env
.env.local

# OS
.DS_Store
Thumbs.db

# エディタ
.vscode/
.idea/
*.swp

# ログ・tmp
log/*
!log/.keep
tmp/*
!tmp/.keep

# Vite
public/vite/
public/vite-dev/
public/vite-test/

# Node
node_modules/

# Rails
config/master.key

# Docker
.dockerignore（これは含めない）
```

### 9.2 GitHub リポジトリの作成

```bash
# プライベートリポジトリとして作成
gh repo create vow_pact --private --source=. --remote=origin
```

### 9.3 設計書ファイルの配置

設計書（data_model.md、api_design.md、design_prompts.md、setup_guide.md）を `docs/` に配置。
CLAUDE.md はプロジェクトルートに配置。

```bash
mkdir docs
# 各ファイルを docs/ にコピー（事前に用意したものを使う）
# CLAUDE.md はルートに配置
```

### 9.4 PR テンプレート

`.github/pull_request_template.md` を作成：

```markdown
## 概要
<!-- この PR で何をしたか -->

## 変更内容
- [ ] xxx を実装
- [ ] yyy を修正

## 関連 Issue
Closes #

## 動作確認
<!-- スクリーンショットや確認手順 -->

## 注意点
<!-- レビュアーに気をつけて見てほしいポイント -->
```

### 9.5 初回コミットと push

```bash
# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "feat: Vow Pact プロジェクトの初期セットアップ

- Rails 8.1 + Vite + React + TypeScript の構成
- Docker 開発環境（Dockerfile.dev、docker-compose.yml）
- 認証ジェネレータの実行
- Tailwind CSS と独自カラーパレットの設定
- alba、ruby-openai、rack-cors の追加
- RSpec、Vitest、ESLint、Prettier のセットアップ
- 設計書とプロジェクトガイドを配置"

# main ブランチに push
git push -u origin main
```

### ✅ チェックポイント9

- [ ] GitHub にプライベートリポジトリ `vow_pact` が作成された
- [ ] main ブランチに初回コミットが push されている
- [ ] 設計書（docs/）が配置された
- [ ] CLAUDE.md がルートにある

---

## 10. Render デプロイ準備

Render には Docker を使わない標準フロー（Native Runtime）でデプロイします。
Docker は開発環境だけで使い、本番は Render の標準プロセスを使います。

### 10.1 Procfile の作成

Render が起動コマンドを認識するためのファイルを作成。

`Procfile`（開発用 `Procfile.dev` とは別）：

```
web: bundle exec rails server -p $PORT -e $RAILS_ENV
release: bundle exec rails db:migrate
```

### 10.2 build.sh の作成

`bin/render-build.sh` を作成：

```bash
#!/usr/bin/env bash
# bin/render-build.sh

set -o errexit

bundle install
npm install
npm run build

bundle exec rails assets:precompile
bundle exec rails db:migrate
```

実行権限を付与：

```bash
chmod a+x bin/render-build.sh
```

### 10.3 Neon でプロジェクトを作成

1. [Neon コンソール](https://console.neon.tech/) にログイン
2. 「New Project」をクリック
3. 以下の設定で作成：
   - **Name**: `vow-pact`
   - **PostgreSQL Version**: 18
   - **Region**: `AWS - Asia Pacific (Tokyo)` または最寄りのリージョン
   - **Create a database named**: `vow_pact_production`
4. 接続情報をコピーして `.env` に保存

### 10.4 Render での Web Service 作成

1. [Render ダッシュボード](https://dashboard.render.com/) にログイン
2. 「New +」→「Web Service」をクリック
3. GitHub の `vow_pact` リポジトリを選択
4. 以下の設定で作成：

| 項目 | 値 |
|---|---|
| Name | vow-pact |
| Region | Singapore（一番近い） |
| Branch | main |
| Runtime | Ruby |
| Build Command | `./bin/render-build.sh` |
| Start Command | `bundle exec rails server` |
| Plan | Free |

### 10.5 環境変数の設定

Render の「Environment」タブで以下を設定：

| Key | Value |
|---|---|
| DATABASE_URL | （Neon の接続情報、`?sslmode=require` 必須） |
| OPENAI_API_KEY | （OpenAI から取得） |
| RAILS_MASTER_KEY | （`config/master.key` の内容） |
| RAILS_ENV | production |
| RACK_ENV | production |
| FRONTEND_URL | （Render の URL） |

### 10.6 マスターキーの確認

```bash
cat config/master.key
```

### 10.7 デプロイ実行

設定完了後、Render が自動的にビルド・デプロイを開始します。

### ✅ チェックポイント10

- [ ] Neon にプロジェクトが作成された
- [ ] Render に Web Service が作成された
- [ ] 環境変数が設定された
- [ ] デプロイが成功した

---

## 11. CI/CD（GitHub Actions）の設定

### 11.1 ワークフローファイルの作成

`.github/workflows/ci.yml` を作成：

```yaml
# .github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  rspec:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: vow_pact
          POSTGRES_PASSWORD: password
          POSTGRES_DB: vow_pact_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4'
          bundler-cache: true

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install npm dependencies
        run: npm ci

      - name: Set up DB
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://vow_pact:password@localhost:5432/vow_pact_test
        run: |
          bundle exec rails db:create
          bundle exec rails db:migrate

      - name: Run RSpec
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://vow_pact:password@localhost:5432/vow_pact_test
        run: bundle exec rspec

  rubocop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4'
          bundler-cache: true

      - name: Run RuboCop
        run: bundle exec rubocop

  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint
```

GitHub Actions は Docker を使わず、ホストマシンで PostgreSQL を起動します。
これにより CI が高速になります。

### 11.2 動作確認

```bash
git add .github/workflows/ci.yml
git commit -m "chore: GitHub Actions の CI 設定を追加"
git push origin main
```

GitHub の Actions タブで CI が成功するか確認。

### ✅ チェックポイント11

- [ ] `.github/workflows/ci.yml` が作成された
- [ ] main への push で CI が実行される
- [ ] RSpec、RuboCop、ESLint のジョブが成功する

---

## 12. 動作確認

### ローカル環境（Docker）

```bash
# コンテナ起動
docker compose up

# ブラウザで http://localhost:3000
# 「Vow Pact」のページが見える
```

### テスト

```bash
# RSpec
docker compose exec web bundle exec rspec

# Vitest
docker compose exec web npm run test

# Lint
docker compose exec web bundle exec rubocop
docker compose exec web npm run lint
```

### Git ワークフロー

```bash
# 試しにブランチを切って、PR を作る
git checkout -b feat/test-branch
git add .
git commit -m "test: PR テスト"
git push origin feat/test-branch

gh pr create --title "test: PR テスト" --body "CI動作確認用"
gh pr checks <PR番号>

# テスト完了したら閉じる
gh pr close <PR番号> --delete-branch
git checkout main
```

### ✅ 最終チェックポイント

- [ ] Docker でローカルサーバーが起動する
- [ ] RSpec、Vitest、RuboCop、ESLint がすべて通る
- [ ] Render の URL でアプリが見える
- [ ] PR を作ると CI が動く
- [ ] CLAUDE.md と設計書が GitHub にある

🎉 **おめでとうございます！セットアップ完了です。**

これで実装フェーズに進む準備が整いました。

---

## 13. トラブルシューティング

### Q. Docker コンテナが起動しない

**症状**: `docker compose up` でエラー

**対処**:
```bash
# ログを確認
docker compose logs web
docker compose logs db

# 再ビルド
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Q. ファイル変更がコンテナに反映されない

**症状**: コードを書き換えても画面が変わらない

**対処**:
- Mac の Docker は `cached` モードでも一部反映が遅いことがある
- ブラウザの Hard Reload（Cmd + Shift + R）
- Vite の HMR が効いているか、ブラウザのコンソールを確認

### Q. bundle install / npm install で「Permission denied」

**症状**: コンテナ内でパーミッションエラー

**対処**:
```bash
# コンテナ内のユーザーを確認
docker compose exec web whoami

# ホスト側でファイル権限を確認
ls -la

# 権限が root になっている場合
sudo chown -R $USER:$USER .
```

### Q. ホストの3000ポートが既に使われている

**症状**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**対処**:
```bash
# 3000 ポートを使っているプロセスを確認
lsof -i :3000

# 該当プロセスを kill
kill -9 <PID>

# または docker-compose.yml でポートを変更
# ports:
#   - "3001:3000"
```

### Q. PostgreSQL に接続できない

**症状**: `could not connect to server`

**対処**:
```bash
# DB コンテナの状態確認
docker compose ps

# DB コンテナのログ確認
docker compose logs db

# DB コンテナに直接入って確認
docker compose exec db psql -U vow_pact -d vow_pact_development
```

### Q. Vite の HMR が効かない

**症状**: ファイル変更がブラウザに反映されない

**対処**:
- `vite.config.ts` の `server.host: '0.0.0.0'` 設定を確認
- `vite.config.ts` の `server.hmr.host: 'localhost'` 設定を確認
- ブラウザのコンソールで HMR の WebSocket 接続を確認

### Q. M1/M2/M3/M4 Mac でビルドが遅い

**症状**: `docker compose build` が時間かかる、起動も遅い

**対処**:
- Docker Desktop の設定で「Use Rosetta for x86/amd64 emulation on Apple Silicon」を有効化
- または ARM64 イメージを明示的に使用：
  ```yaml
  # docker-compose.yml
  services:
    db:
      image: postgres:18
      platform: linux/arm64  # 追加
  ```

### Q. RSpec で「LoadError: cannot load such file」

**症状**: `cannot load such file -- factory_bot`

**対処**:
```bash
# Gemfile に factory_bot_rails があるか確認
docker compose exec web bundle install
docker compose restart web
```

### Q. CORS エラー

**症状**: ブラウザのコンソールに `CORS policy` エラー

**対処**:
- `config/initializers/cors.rb` の `origins` を確認
- 開発時は `http://localhost:3000` と `http://localhost:5173` の両方を許可するか、ワイルドカードを設定

### Q. Render のデプロイが失敗する

**症状**: ビルドエラーで止まる

**対処**:
- Render のログを確認（よくある原因：環境変数の設定漏れ）
- DATABASE_URL に `?sslmode=require` が含まれているか確認
- `bin/render-build.sh` に実行権限が付いているか確認
- ローカルで `RAILS_ENV=production bundle exec rails assets:precompile` が成功するか試す

### それでも解決しない場合

1. エラーメッセージで Google 検索
2. 設計書（CLAUDE.md, data_model.md, api_design.md）を再確認
3. このガイドを最初から見直す
4. `docker compose down -v && docker compose up --build` で再構築
5. 最終手段：ディレクトリを削除して最初からやり直す

---

## 次のステップ

セットアップ完了後は、いよいよ実装フェーズです。

1. データモデルのマイグレーション（5テーブル）
2. シリアライザーの作成（alba ベース）
3. API エンドポイントの実装（23エンドポイント）
4. フロントエンドの実装（13画面）

Claude Code に CLAUDE.md と設計書を渡して、エンドポイント単位で順番に実装していくのがおすすめです。

---

**最終更新**: 2026年5月2日（Docker 開発版）
