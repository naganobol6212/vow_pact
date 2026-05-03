# Vow Pact - API 設計書

このドキュメントは、目標達成アプリ「Vow Pact（誓約契約）」の REST API 設計をまとめたものです。

## 目次

- [共通方針](#共通方針)
- [認証エンドポイント](#認証エンドポイント)（7つ）
- [契約エンドポイント](#契約エンドポイント)（7つ）
- [チェックインエンドポイント](#チェックインエンドポイント)（2つ）
- [AI エンドポイント](#ai-エンドポイント)（5つ）
- [ランキングエンドポイント](#ランキングエンドポイント)（2つ）
- [設計判断の記録](#設計判断の記録)

**全 23 エンドポイント**

---

## 共通方針

### URL 規則

すべてのエンドポイントに `/api/v1/` プレフィックスを付ける。

- 認証関連: `/api/v1/auth/*`
- リソース関連: `/api/v1/{resource}/*`
- AI 関連: `/api/v1/ai/*`

将来的に v2 を作る場合の拡張性を確保。

### レスポンスのデータ構造

データを直接返すシンプル形式。`data` キーでラップしない。

### エラーレスポンスの形式

詳細形式（`errors` 配列）を採用。

```json
{
  "errors": [
    {
      "code": "validation_error",
      "field": "email",
      "message": "は既に使用されています"
    }
  ]
}
```

#### エラーコード一覧

| コード | 用途 | 対応するステータスコード |
|---|---|---|
| `validation_error` | 入力値のバリデーションエラー | 422 |
| `authentication_failed` | 認証失敗（パスワード違い等） | 401 |
| `unauthorized` | 未ログイン | 401 |
| `forbidden` | 権限なし | 403 |
| `not_found` | リソースが存在しない | 404 |
| `rate_limit_exceeded` | レート制限超過 | 429 |
| `ai_service_error` | AI サービスエラー | 503 |
| `internal_server_error` | サーバー内部エラー | 500 |

### ステータスコードの使い分け

#### 成功系

| コード | 用途 |
|---|---|
| 200 OK | 通常の成功（GET、PATCH 等でデータを返すとき） |
| 201 Created | 新規作成成功（POST） |
| 202 Accepted | 非同期処理を受理（AI ジョブ投入） |
| 204 No Content | 成功だがレスポンスボディ不要 |

#### エラー系

| コード | 用途 |
|---|---|
| 400 Bad Request | リクエストフォーマットが不正 |
| 401 Unauthorized | 認証エラー |
| 403 Forbidden | 認証はOKだが権限がない |
| 404 Not Found | リソースが存在しない |
| 422 Unprocessable Entity | バリデーションエラー |
| 429 Too Many Requests | レート制限超過 |
| 500 Internal Server Error | サーバー内部エラー |
| 503 Service Unavailable | サービス一時的に利用不可（AI 失敗等） |

### 認証方式

セッションベース認証（Cookie）を採用。

- Rails 8 標準の認証ジェネレータを利用
- Cookie 属性: `HttpOnly`, `Secure`, `SameSite=Lax`
- フロントエンド（React）は `credentials: 'include'` で Cookie を送信

### User オブジェクトの形式

```json
{
  "id": 1,
  "email": "yuto@example.com",
  "nickname": "Yuto",
  "avatar_url": null,
  "is_public": true,
  "streak_count": 7,
  "longest_streak": 14,
  "created_at": "2026-05-02T10:30:00Z",
  "updated_at": "2026-05-02T10:30:00Z"
}
```

`password_digest` などの機密情報は含まない。

#### 公開用の最小 User オブジェクト（ランキングなど）

```json
{
  "id": 1,
  "nickname": "Yuto",
  "avatar_url": null
}
```

email や is_public は他人には見せない。

### Pact オブジェクトの形式

#### 一覧表示用（軽量、ホーム画面向け）

```json
{
  "id": 1,
  "goal": "TOEIC 800点を達成する",
  "constraint_text": "達成までSNSを1日30分以内に制限する",
  "difficulty": 4,
  "difficulty_reason": "...",
  "deadline": "2026-08-02",
  "status": "active",
  "title": "沈黙の試練を背負いし者",
  "signed_at": "2026-05-02T10:30:00Z",
  "completed_at": null,
  "days_remaining": 92,
  "today_check_in": null,
  "current_streak": 5,
  "created_at": "...",
  "updated_at": "..."
}
```

#### 詳細表示用（追加情報付き、詳細画面向け）

一覧表示用 + 以下を追加：
- `completion_progress`: 達成進捗の詳細
- `crest`: 紋章情報（completed の場合）

#### 殿堂表示用（過去の契約向け）

一覧表示用 + 以下：
- `crest`: 紋章情報（completed の場合）
- 不要な情報の除外: `today_check_in`, `current_streak`, `days_remaining`

---

## 認証エンドポイント

### エンドポイント一覧

| メソッド | パス | 役割 | 認証必須 |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | 新規登録 | 不要 |
| POST | `/api/v1/auth/login` | ログイン | 不要 |
| DELETE | `/api/v1/auth/logout` | ログアウト | 必要 |
| GET | `/api/v1/auth/me` | 自分の情報取得 | 必要 |
| PATCH | `/api/v1/auth/me` | プロフィール更新 | 必要 |
| PATCH | `/api/v1/auth/email` | メールアドレス変更 | 必要 |
| PATCH | `/api/v1/auth/password` | パスワード変更 | 必要 |

---

### POST /api/v1/auth/signup（新規登録）

新規ユーザーを作成し、自動的にログイン状態にする。

#### リクエスト

```json
{
  "user": {
    "email": "yuto@example.com",
    "password": "secure_password_123",
    "password_confirmation": "secure_password_123",
    "nickname": "Yuto"
  }
}
```

#### バリデーション

- `email`: 必須、メール形式、UNIQUE
- `password`: 必須、6文字以上
- `password_confirmation`: 必須、`password` と一致
- `nickname`: 必須、1-30文字

#### レスポンス

**成功時 (201 Created)**: User オブジェクト + Set-Cookie ヘッダー

**バリデーションエラー時 (422)**: errors 配列

---

### POST /api/v1/auth/login（ログイン）

#### リクエスト

```json
{
  "email": "yuto@example.com",
  "password": "secure_password_123"
}
```

#### レスポンス

**成功時 (200 OK)**: User オブジェクト + Set-Cookie ヘッダー

**認証失敗時 (401 Unauthorized)**

```json
{
  "errors": [
    {
      "code": "authentication_failed",
      "field": null,
      "message": "メールアドレスまたはパスワードが正しくありません"
    }
  ]
}
```

セキュリティ上、「メールアドレスが間違っている」と「パスワードが間違っている」を区別しないメッセージを返す。

---

### DELETE /api/v1/auth/logout（ログアウト）

#### リクエスト

ボディなし。

#### レスポンス

**成功時 (204 No Content)**: ボディなし、Cookie 削除。

---

### GET /api/v1/auth/me（自分の情報取得）

#### レスポンス

**成功時 (200 OK)**: User オブジェクト
**未ログイン時 (401)**: `unauthorized` エラー

---

### PATCH /api/v1/auth/me（プロフィール更新）

ニックネーム、アバター画像URL、公開設定など、プロフィール情報のみ更新可能。

#### リクエスト

```json
{
  "user": {
    "nickname": "Yuto Updated",
    "avatar_url": "https://example.com/avatar.jpg",
    "is_public": false
  }
}
```

#### バリデーション

- `nickname`: 1-30文字（任意）
- `avatar_url`: URL形式（任意、NULL 許容）
- `is_public`: boolean（任意）

`email` や `password` は Strong Parameters で受け付けない。

#### レスポンス

**成功時 (200 OK)**: 更新後の User オブジェクト

---

### PATCH /api/v1/auth/email（メールアドレス変更）

本人確認のため現在のパスワードが必須。

#### リクエスト

```json
{
  "current_password": "secure_password_123",
  "email": "newemail@example.com"
}
```

#### レスポンス

**成功時 (200 OK)**: 更新後の User オブジェクト

**現在のパスワード不一致時 (401)**:

```json
{
  "errors": [
    {
      "code": "authentication_failed",
      "field": "current_password",
      "message": "現在のパスワードが正しくありません"
    }
  ]
}
```

---

### PATCH /api/v1/auth/password（パスワード変更）

#### リクエスト

```json
{
  "current_password": "old_password_123",
  "password": "new_password_456",
  "password_confirmation": "new_password_456"
}
```

#### レスポンス

**成功時 (204 No Content)**: ボディなし

**現在のパスワード不一致時 (401)**: `authentication_failed` エラー

---

## 契約エンドポイント

### エンドポイント一覧

| メソッド | パス | 役割 | 認証必須 |
|---|---|---|---|
| GET | `/api/v1/pacts` | active 契約一覧 | 必要 |
| POST | `/api/v1/pacts` | 新規契約作成 | 必要 |
| GET | `/api/v1/pacts/:id` | 契約詳細取得 | 必要 |
| PATCH | `/api/v1/pacts/:id` | 契約編集（goal, constraint_text） | 必要 |
| POST | `/api/v1/pacts/:id/abandon` | 契約破棄 | 必要 |
| POST | `/api/v1/pacts/:id/complete` | 達成判定 | 必要 |
| GET | `/api/v1/pacts/archived` | 殿堂用一覧 | 必要 |

---

### GET /api/v1/pacts（契約一覧取得）

ホーム画面で表示する active な契約を取得する。

#### レスポンス

**成功時 (200 OK)**: 一覧表示用 Pact オブジェクトの配列

```json
[
  {
    "id": 1,
    "goal": "TOEIC 800点を達成する",
    "constraint_text": "達成までSNSを1日30分以内に制限する",
    "difficulty": 4,
    "difficulty_reason": "日常的な習慣を変える必要があるため",
    "deadline": "2026-08-02",
    "status": "active",
    "title": "沈黙の試練を背負いし者",
    "signed_at": "2026-05-02T10:30:00Z",
    "completed_at": null,
    "days_remaining": 92,
    "today_check_in": {
      "id": 100,
      "checked_on": "2026-05-02",
      "status": "kept",
      "note": null
    },
    "current_streak": 5,
    "created_at": "2026-05-02T10:30:00Z",
    "updated_at": "2026-05-02T10:30:00Z"
  }
]
```

---

### POST /api/v1/pacts（新規契約作成）

#### リクエスト

```json
{
  "pact": {
    "goal": "TOEIC 800点を達成する",
    "constraint_text": "達成までSNSを1日30分以内に制限する",
    "difficulty": 4,
    "difficulty_reason": "日常的な習慣を変える必要があるため",
    "deadline": "2026-08-02",
    "title": "沈黙の試練を背負いし者"
  }
}
```

#### バリデーション

- `goal`: 必須、1-500文字
- `constraint_text`: 必須、1-500文字
- `difficulty`: 必須、1-5の整数
- `difficulty_reason`: 任意
- `deadline`: 必須、未来の日付
- `title`: 任意

ビジネスルール：active 状態の契約は3つまで。

#### レスポンス

**成功時 (201 Created)**: 一覧表示用 Pact オブジェクト

`signed_at` はサーバー側で自動セット。

**3つ上限超過時 (422)**:

```json
{
  "errors": [
    {
      "code": "validation_error",
      "field": "base",
      "message": "active状態の契約は3つまでです"
    }
  ]
}
```

---

### GET /api/v1/pacts/:id（契約詳細取得）

#### レスポンス

**成功時 (200 OK)**: 詳細表示用 Pact オブジェクト

```json
{
  "id": 1,
  "goal": "TOEIC 800点を達成する",
  ...
  "completion_progress": {
    "total_days": 92,
    "kept_days": 5,
    "broken_days": 0,
    "skipped_days": 0,
    "missing_days": 87,
    "compliance_rate": 1.0
  },
  "crest": null
}
```

`completed` な契約の場合、`crest` には紋章情報が含まれる。

**存在しない / 他人の契約の場合 (404)**:

```json
{
  "errors": [
    {
      "code": "not_found",
      "field": null,
      "message": "契約が見つかりません"
    }
  ]
}
```

セキュリティ上、「他人の契約」と「存在しない契約」を区別しないメッセージにする。

---

### PATCH /api/v1/pacts/:id（契約編集）

仕様により、編集可能なのは `goal` と `constraint_text` のみ。

#### リクエスト

```json
{
  "pact": {
    "goal": "TOEIC 850点を達成する",
    "constraint_text": "達成までSNSを1日20分以内に制限する"
  }
}
```

#### バリデーション

- `goal`: 1-500文字（送られてきた場合）
- `constraint_text`: 1-500文字（送られてきた場合）
- **status が active のときのみ編集可能**

#### レスポンス

**成功時 (200 OK)**: 一覧表示用 Pact オブジェクト

**非active な契約を編集しようとした時 (422)**:

```json
{
  "errors": [
    {
      "code": "validation_error",
      "field": "base",
      "message": "完了または破棄された契約は編集できません"
    }
  ]
}
```

---

### POST /api/v1/pacts/:id/abandon（契約破棄）

#### リクエスト

ボディなし。

#### バリデーション

- 自分の契約か
- `active` 状態か

#### レスポンス

**成功時 (200 OK)**: 一覧表示用 Pact オブジェクト（status が `abandoned` に変更）

**非active な契約を破棄しようとした時 (422)**: バリデーションエラー

---

### POST /api/v1/pacts/:id/complete（達成判定）

達成判定を実行する。チェックイン作成時の自動判定 + ユーザー手動の両方で利用。

#### 達成条件（寛容モード）

- 期日が今日以前
- 期日までの全日に対して、チェックインが何らかの形で記録されている（kept / broken / skipped 問わず）

#### 達成時の連鎖処理

1つのトランザクションで実行：

1. Pact.status を `completed` に変更
2. Pact.completed_at に現在時刻をセット
3. Crest を生成（紋章データの作成、レアリティ計算）

#### リクエスト

ボディなし。

#### レスポンス

**成功時 (200 OK)**: 詳細表示用 Pact オブジェクト + 紋章情報

```json
{
  "id": 1,
  "status": "completed",
  "completed_at": "2026-08-02T15:00:00Z",
  "crest": {
    "id": 50,
    "crest_data": {...},
    "rarity": "epic",
    "generated_at": "2026-08-02T15:00:00Z"
  },
  ...
}
```

**達成条件を満たしていない時 (422)**:

```json
{
  "errors": [
    {
      "code": "validation_error",
      "field": "base",
      "message": "達成条件を満たしていません",
      "details": {
        "missing_check_in_days": 5,
        "total_required_days": 92,
        "recorded_days": 87
      }
    }
  ]
}
```

**期日前に達成しようとした時 (422)**: バリデーションエラー

---

### GET /api/v1/pacts/archived(殿堂用一覧)

`completed` と `failed` の契約一覧を取得する。
`abandoned` は含まれない。

#### クエリパラメータ（任意）

| パラメータ | 値 | デフォルト | 説明 |
|---|---|---|---|
| `status` | `completed` / `failed` / `all` | `all` | フィルタ |
| `sort` | `completed_at` / `rarity` / `difficulty` | `completed_at` | ソート順 |

#### 仕様

- 全件返す（最大100件）
- ソート順デフォルト：`completed_at DESC`（新しい順）

#### レスポンス

**成功時 (200 OK)**: 殿堂表示用 Pact オブジェクトの配列

```json
[
  {
    "id": 50,
    "goal": "TOEIC 800点を達成する",
    "constraint_text": "達成までSNSを1日30分以内に制限する",
    "difficulty": 4,
    "deadline": "2026-08-02",
    "status": "completed",
    "title": "沈黙の試練を背負いし者",
    "signed_at": "2026-05-02T10:30:00Z",
    "completed_at": "2026-08-02T15:00:00Z",
    "crest": {
      "id": 10,
      "crest_data": {...},
      "rarity": "epic",
      "generated_at": "2026-08-02T15:00:00Z"
    },
    "created_at": "2026-05-02T10:30:00Z",
    "updated_at": "2026-08-02T15:00:00Z"
  }
]
```

`failed` の場合は `crest` は `null`。

---

## チェックインエンドポイント

### エンドポイント一覧

| メソッド | パス | 役割 | 認証必須 |
|---|---|---|---|
| POST | `/api/v1/pacts/:pact_id/check_ins` | 記録 / 更新 | 必要 |
| GET | `/api/v1/pacts/:pact_id/check_ins` | 履歴取得 | 必要 |

ネスト構造：チェックインは必ず特定の Pact に紐づくため、`/pacts/:pact_id/check_ins` の形式。

---

### POST /api/v1/pacts/:pact_id/check_ins（記録 / 更新）

「守れた / 守れなかった / スキップ」の記録を作成または更新する。
ユニーク制約 `(pact_id, checked_on)` により、サーバー側で自動的に「作成 or 更新」を判定。

達成判定も自動実行：チェックイン後に達成条件を満たしていれば、Pact.status を `completed` に変更し、紋章を生成。

#### リクエスト

```json
{
  "check_in": {
    "status": "kept",
    "note": "今日も継続できた。気分よし。"
  }
}
```

`checked_on` はサーバー側で `Date.current` を自動セット。

#### バリデーション

- `status`: 必須、enum 値（`kept` / `broken` / `skipped`）
- `note`: 任意、500文字以内
- 該当 Pact が自分のものか
- 該当 Pact が `active` 状態か

#### レスポンス

**成功時 (200 OK) - 達成しなかった場合**

```json
{
  "check_in": {
    "id": 100,
    "pact_id": 1,
    "checked_on": "2026-05-02",
    "status": "kept",
    "note": "今日も継続できた。気分よし。",
    "created_at": "2026-05-02T22:00:00Z",
    "updated_at": "2026-05-02T22:00:00Z"
  },
  "pact": {
    "id": 1,
    "current_streak": 6,
    "completion_progress": {
      "total_days": 92,
      "kept_days": 6,
      "broken_days": 0,
      "skipped_days": 0,
      "missing_days": 86,
      "compliance_rate": 1.0
    }
  },
  "user": {
    "streak_count": 6,
    "longest_streak": 14
  },
  "achievement": null
}
```

**成功時 (200 OK) - 達成した場合**

`achievement` フィールドに達成情報が含まれる：

```json
{
  "check_in": {...},
  "pact": {
    "id": 1,
    "status": "completed",
    "completed_at": "2026-08-02T22:00:00Z",
    "current_streak": 92
  },
  "user": {
    "streak_count": 92,
    "longest_streak": 92
  },
  "achievement": {
    "achieved": true,
    "crest": {
      "id": 50,
      "crest_data": {...},
      "rarity": "epic",
      "generated_at": "2026-08-02T22:00:00Z"
    },
    "title": "沈黙の試練を背負いし者"
  }
}
```

フロントはこのレスポンスを受け取ったら、達成演出画面に遷移できる。

**バリデーションエラー時 (422)**:

```json
{
  "errors": [
    {
      "code": "validation_error",
      "field": "status",
      "message": "は kept、broken、skipped のいずれかにしてください"
    }
  ]
}
```

**非active な契約にチェックインしようとした時 (422)**:

```json
{
  "errors": [
    {
      "code": "validation_error",
      "field": "base",
      "message": "完了または破棄された契約にはチェックインできません"
    }
  ]
}
```

---

### GET /api/v1/pacts/:pact_id/check_ins（履歴取得）

契約の詳細画面でカレンダー表示する用のチェックイン履歴を取得。

#### レスポンス

**成功時 (200 OK)**: チェックインの配列（`checked_on DESC`）

```json
[
  {
    "id": 100,
    "pact_id": 1,
    "checked_on": "2026-05-02",
    "status": "kept",
    "note": "今日も継続できた。気分よし。",
    "created_at": "2026-05-02T22:00:00Z",
    "updated_at": "2026-05-02T22:00:00Z"
  },
  {
    "id": 99,
    "pact_id": 1,
    "checked_on": "2026-05-01",
    "status": "kept",
    "note": null,
    "created_at": "2026-05-01T21:30:00Z",
    "updated_at": "2026-05-01T21:30:00Z"
  }
]
```

全期間返す（契約開始から今日まで）。

---

## AI エンドポイント

非同期処理を採用。OpenAI API への呼び出しは Solid Queue でバックグラウンドジョブとして実行。

### エンドポイント一覧

| メソッド | パス | 役割 | 認証必須 |
|---|---|---|---|
| POST | `/api/v1/ai/goals` | 目標案ジョブ投入 | 必要 |
| POST | `/api/v1/ai/constraints` | 制約案ジョブ投入 | 必要 |
| POST | `/api/v1/ai/difficulty` | 難易度判定ジョブ投入 | 必要 |
| POST | `/api/v1/ai/title` | 称号生成ジョブ投入 | 必要 |
| GET | `/api/v1/ai/jobs/:job_id` | ジョブ結果取得 | 必要 |

### 共通仕様

- レート制限：1ユーザーあたり1分間に10回まで
- ジョブ ID 形式：`ai_job_{generation_id}`（generation_id は AiGeneration テーブルの ID）
- 他人のジョブにはアクセス不可（404）

---

### POST /api/v1/ai/goals（目標案ジョブ投入）

「天啓を受ける」ボタンに対応。ユーザーが入力したキーワードから3つの目標案を生成。

#### リクエスト

```json
{
  "user_input": "英語を頑張る"
}
```

#### バリデーション

- `user_input`: 必須、1-200文字

#### レスポンス

**成功時 (202 Accepted)**

```json
{
  "job_id": "ai_job_123",
  "status": "pending",
  "estimated_seconds": 5
}
```

**レート制限超過時 (429)**:

```json
{
  "errors": [
    {
      "code": "rate_limit_exceeded",
      "field": null,
      "message": "AIの利用制限を超えました。少し時間をおいてからお試しください。"
    }
  ]
}
```

---

### POST /api/v1/ai/constraints（制約案ジョブ投入）

「試練を授かる」ボタンに対応。選んだ目標から3つの試練案を生成。

#### リクエスト

```json
{
  "goal": "TOEIC 800点を3ヶ月で達成する"
}
```

#### バリデーション

- `goal`: 必須、1-500文字

#### レスポンス

**成功時 (202 Accepted)**: 同上のジョブ投入レスポンス

---

### POST /api/v1/ai/difficulty（難易度判定ジョブ投入）

ユーザーが自由入力した制約に対して、難易度を判定する。

#### リクエスト

```json
{
  "goal": "TOEIC 800点を3ヶ月で達成する",
  "constraint_text": "達成までSNSを完全に断つ",
  "deadline": "2026-08-02"
}
```

#### バリデーション

- `goal`: 必須、1-500文字
- `constraint_text`: 必須、1-500文字
- `deadline`: 必須、未来の日付

#### レスポンス

**成功時 (202 Accepted)**: 同上のジョブ投入レスポンス

---

### POST /api/v1/ai/title（称号生成ジョブ投入）

契約締結時に生成される称号。

#### リクエスト

```json
{
  "goal": "TOEIC 800点を3ヶ月で達成する",
  "constraint_text": "達成までSNSを1日30分以内に制限する",
  "difficulty": 4
}
```

#### レスポンス

**成功時 (202 Accepted)**: 同上のジョブ投入レスポンス

---

### GET /api/v1/ai/jobs/:job_id（ジョブ結果取得）

ジョブの状態と結果を取得する。フロントエンドはポーリングで使用。

#### リクエスト

```http
GET /api/v1/ai/jobs/ai_job_123
Cookie: _vow_pact_session=...
```

#### レスポンス

**処理中の場合 (200 OK)**

```json
{
  "job_id": "ai_job_123",
  "status": "processing",
  "started_at": "2026-05-02T22:00:00Z"
}
```

**完了した場合 (200 OK)**

ジョブの種類によって `result` の中身が変わる。

**目標生成 / 制約生成の場合**:

```json
{
  "job_id": "ai_job_123",
  "status": "completed",
  "completed_at": "2026-05-02T22:00:05Z",
  "result": {
    "generation_id": 123,
    "options": [
      "TOEIC 800点を3ヶ月で達成する",
      "毎日30分英会話アプリで学習する習慣を90日続ける",
      "英語の本を3冊読破する（30日以内）"
    ]
  }
}
```

**難易度判定の場合**:

```json
{
  "job_id": "ai_job_125",
  "status": "completed",
  "completed_at": "2026-05-02T22:00:05Z",
  "result": {
    "generation_id": 125,
    "difficulty": 4,
    "reason": "SNSを完全に断つことは現代人にとって極めて難しく..."
  }
}
```

**称号生成の場合**:

```json
{
  "job_id": "ai_job_126",
  "status": "completed",
  "completed_at": "2026-05-02T22:00:05Z",
  "result": {
    "generation_id": 126,
    "title": "沈黙の試練を背負いし者"
  }
}
```

**失敗した場合 (200 OK)**

```json
{
  "job_id": "ai_job_123",
  "status": "failed",
  "failed_at": "2026-05-02T22:00:10Z",
  "error": {
    "code": "ai_service_error",
    "message": "AIが応答できませんでした。もう一度お試しください。"
  }
}
```

ステータスが `failed` でも、エンドポイント自体は 200 OK で返す（ジョブの状態取得は成功している）。

**他人のジョブを取りに行ったら (404)**: `not_found` エラー

---

## ランキングエンドポイント

### エンドポイント一覧

| メソッド | パス | 役割 | 認証必須 |
|---|---|---|---|
| GET | `/api/v1/rankings/monthly` | 今月の達成数ランキング | 必要 |
| GET | `/api/v1/rankings/streak` | 連続日数ランキング | 必要 |

### 共通仕様

- 上位10位まで返す
- `is_public = true` のユーザーのみランキングに表示
- 自分の順位（`my_rank`）は、`is_public` の値に関係なく自分には表示
- 自分が10位以内なら `rank` 入り、圏外なら `rank: null`

---

### GET /api/v1/rankings/monthly（今月の達成数ランキング）

今月の達成数（completed_at が今月の Pact の数）でランキング。

#### レスポンス

**成功時 (200 OK)**

```json
{
  "month": "2026-05",
  "rankings": [
    {
      "rank": 1,
      "user": {
        "id": 5,
        "nickname": "Alice",
        "avatar_url": "https://example.com/alice.jpg"
      },
      "achievement_count": 12
    },
    {
      "rank": 2,
      "user": {
        "id": 7,
        "nickname": "Bob",
        "avatar_url": null
      },
      "achievement_count": 8
    }
  ],
  "my_rank": {
    "rank": 3,
    "achievement_count": 5
  }
}
```

**自分が圏外の場合**:

```json
{
  "month": "2026-05",
  "rankings": [...],
  "my_rank": {
    "rank": null,
    "achievement_count": 2
  }
}
```

---

### GET /api/v1/rankings/streak（連続日数ランキング）

連続チェックイン日数（User.streak_count）でランキング。

#### レスポンス

**成功時 (200 OK)**

```json
{
  "rankings": [
    {
      "rank": 1,
      "user": {
        "id": 9,
        "nickname": "Carol",
        "avatar_url": "https://example.com/carol.jpg"
      },
      "streak_count": 156
    },
    {
      "rank": 2,
      "user": {
        "id": 5,
        "nickname": "Alice",
        "avatar_url": "https://example.com/alice.jpg"
      },
      "streak_count": 89
    }
  ],
  "my_rank": {
    "rank": 3,
    "streak_count": 45
  }
}
```

`monthly` ランキングと違い、`month` フィールドはない。

---

## 設計判断の記録

### 共通方針

#### 判断1: URL に `/api/v1/` プレフィックスを付ける

将来の API バージョン管理のため。実務でほぼ標準。

#### 判断2: レスポンスのデータ構造はシンプル形式

`data` キーでラップせず、データを直接返す。

#### 判断3: エラーレスポンスは詳細形式（errors 配列）

複数エラー対応、フィールド指定が可能。実務標準。

#### 判断4: セッションベース認証を採用

Rails 8 標準ジェネレータが対応、同一ドメインで動くアプリ向け。JWT は採用しない。

### 認証関連

#### 判断5: プロフィール更新と認証情報変更を分離

セキュリティ要件が違うため。メール・パスワード変更は現在のパスワード必須。

#### 判断6: ログイン失敗時のメッセージは曖昧に

セキュリティ上、メールアドレスの存在を漏らさないため。

### 契約関連

#### 判断7: 状態変更は専用エンドポイントを使う

`POST /pacts/:id/abandon`、`POST /pacts/:id/complete` を専用エンドポイントとして用意。Rails の `member action` の慣例に沿う。

#### 判断8: 一覧と詳細でレスポンス形式を変える

ケースごとに必要な情報を出すことで、レスポンスサイズを最適化。

#### 判断9: 殿堂用一覧は別エンドポイント

`GET /pacts/archived` を別エンドポイントとして用意。明示的でフロントの実装が分かりやすい。

#### 判断10: 達成判定は両方実装

チェックイン作成時の自動判定 + 手動エンドポイント。バグの保険、運用上の柔軟性。

#### 判断11: 達成条件は寛容モード

`broken` の日があっても、チェックイン記録があれば達成扱い。ユーザーフレンドリー。

#### 判断12: 破棄時の理由は保存しない

シンプルさ優先。将来必要になったらカラム追加で対応。

#### 判断13: 殿堂は全件返す（最大100件）

ページング対応はせず、最大100件まで全件返す。MVP のシンプルさ優先。

#### 判断14: 複数制約は MVP 範囲外

1契約 = 1制約のまま。複数制約を持ちたいユーザーは複数契約（最大3つ active）で表現。

### チェックイン関連

#### 判断15: 作成と更新を1つのエンドポイントに統合

ユニーク制約 `(pact_id, checked_on)` があるため、サーバー側で「作成 or 更新」を自動判定。フロントは常に POST するだけ。

#### 判断16: ステータスコードは常に 200 OK

作成も更新もシンプルさ優先。201 と 200 の使い分けはしない。

#### 判断17: checked_on はサーバー側で自動設定

ユーザーは「今日」のチェックインしかできない。チート防止、シンプル化。

#### 判断18: 履歴は全期間返す

最大365件なので、データ量はそれほど大きくない。フロントで月切り替えできる。

### AI 関連

#### 判断19: 非同期処理を採用（Solid Queue）

OpenAI API への呼び出しを Solid Queue でバックグラウンドジョブとして実行。学習価値高い、Rails 8 標準機能の活用。

#### 判断20: ジョブ結果取得は共通エンドポイント

`GET /api/v1/ai/jobs/:job_id` で全種類のジョブ結果を取得。エンドポイント数を増やさない。

#### 判断21: レート制限を実装

1ユーザーあたり1分間に10回まで。AI 利用コスト保護のため。

#### 判断22: 失敗もステータスコード 200 で返す

ジョブの状態取得自体は成功している。`status: 'failed'` フィールドで判別。

### ランキング関連

#### 判断23: ランキングは「今月達成数」と「連続日数」のみ

先行者有利を排除するため、累計レアリティはランキングから外す。個人記録としては保持。

#### 判断24: 上位10位まで返す

実務でよくある「Top 10」表示。データ量も少なくて済む。

#### 判断25: is_public = false のユーザーは非表示

プライバシー配慮。ただし自分の順位は自分には見える。

#### 判断26: 圏外の自分は rank: null で返す

10位以内でない場合、計算コストをかけずに `rank: null` を返す。`achievement_count` や `streak_count` は計算して返す。

---

## 参考資料

- [Rails 8 ガイド](https://guides.rubyonrails.org/)
- [REST API Design Best Practices](https://restfulapi.net/)
- [HTTP ステータスコード - MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Status)
- [Solid Queue](https://github.com/rails/solid_queue)
- データモデル設計: `docs/data_model.md`

---

**最終更新**: 2026年5月2日（全23エンドポイント設計完了）
