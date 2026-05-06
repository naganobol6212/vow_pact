import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { useAuth } from "../hooks/useAuth"
import { api, ApiError } from "../lib/api"
import type { User } from "../types/user"

function SettingsPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  if (isLoading) {
    return (
      <Layout title="設定">
        <p className="text-center text-ink/60 mt-12">読み込み中…</p>
      </Layout>
    )
  }

  if (!user) {
    navigate("/login")
    return null
  }

  return (
    <Layout title="設定">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center mb-2">
          <p className="font-serif text-xl text-seal mb-1">設定</p>
          <p className="text-sm text-ink/60">
            {user.nickname}
            {user.is_guest && (
              <span className="ml-2 text-xs px-1 py-0.5 bg-gold/20 text-ink/60 rounded-sm">
                ゲスト
              </span>
            )}
          </p>
        </div>

        {user.is_guest && <PromoteSection />}
        <ProfileSection user={user} />
        {!user.is_guest && (
          <>
            <EmailSection />
            <PasswordSection />
          </>
        )}
        <LogoutSection
          onLogout={async () => {
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
            navigate("/login")
          }}
        />
      </div>
    </Layout>
  )
}

// ============================================================
// Promote（ゲスト → 本登録）
// ============================================================

function PromoteSection() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [nickname, setNickname] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const promoteMutation = useMutation<User, ApiError, void>({
    mutationFn: () =>
      api<User>("/auth/promote", {
        method: "PATCH",
        body: {
          email,
          password,
          password_confirmation: passwordConfirmation,
          nickname: nickname.trim() || undefined,
        },
      }),
    onSuccess: async () => {
      setSuccess(true)
      setErrors({})
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (err) => {
      setSuccess(false)
      const errorMap: Record<string, string> = {}
      const errorList = Array.isArray(err.errors) ? err.errors : []
      errorList.forEach((e) => {
        const item = e as { field?: string; message?: string; code?: string }
        if (item.field) errorMap[item.field] = item.message ?? "エラー"
        else errorMap.base = item.message ?? "登録に失敗しました"
      })
      setErrors(errorMap)
    },
  })

  return (
    <section className="p-5 bg-gold/10 border-2 border-gold rounded-sm">
      <h3 className="font-serif text-base text-ink mb-2">
        <span className="text-gold mr-2">⚜</span>正式登録する
      </h3>
      <p className="text-xs text-ink/70 mb-4">
        メールアドレスとパスワードを登録すると、これまでの誓約・チェックイン・紋章が
        そのまま引き継がれます。30 日経過すると自動で削除されます。
      </p>

      {success ? (
        <p className="text-sm text-seal font-serif">
          ✦ 正式登録が完了しました。これからもよろしく。
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            promoteMutation.mutate()
          }}
        >
          {errors.base && (
            <p className="mb-3 text-xs text-seal" role="alert">
              {errors.base}
            </p>
          )}
          <FormField
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <FormField
            label="ニックネーム（任意）"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="ゲストのまま使うなら空欄でOK"
            error={errors.nickname}
          />
          <FormField
            label="パスワード（6 文字以上）"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <FormField
            label="パスワード（確認）"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            error={errors.password_confirmation}
            required
          />
          <Button
            variant="primary"
            type="submit"
            disabled={promoteMutation.isPending}
            fullWidth
          >
            {promoteMutation.isPending ? "登録中..." : "正式登録する"}
          </Button>
        </form>
      )}
    </section>
  )
}

// ============================================================
// Profile（nickname / avatar_url / is_public）
// ============================================================

function ProfileSection({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [nickname, setNickname] = useState(user.nickname)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "")
  const [isPublic, setIsPublic] = useState(user.is_public)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedRecently, setSavedRecently] = useState(false)

  const updateMutation = useMutation<User, ApiError, void>({
    mutationFn: () =>
      api<User>("/auth/me", {
        method: "PATCH",
        body: {
          nickname,
          avatar_url: avatarUrl.trim() || null,
          is_public: isPublic,
        },
      }),
    onSuccess: async () => {
      setErrors({})
      setSavedRecently(true)
      setTimeout(() => setSavedRecently(false), 3000)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (err) => {
      const errorMap: Record<string, string> = {}
      const errorList = Array.isArray(err.errors) ? err.errors : []
      errorList.forEach((e) => {
        const item = e as { field?: string; message?: string }
        if (item.field) errorMap[item.field] = item.message ?? "エラー"
        else errorMap.base = item.message ?? "更新に失敗しました"
      })
      setErrors(errorMap)
    },
  })

  return (
    <section className="p-5 bg-parchment/60 border border-gold/40 rounded-sm">
      <h3 className="font-serif text-base text-ink mb-3">プロフィール</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateMutation.mutate()
        }}
      >
        <FormField
          label="ニックネーム"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={errors.nickname}
          required
        />
        <FormField
          label="アバター URL（任意）"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          error={errors.avatar_url}
          placeholder="https://..."
        />
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="accent-seal"
          />
          <span className="text-sm text-ink">ランキングに公開する</span>
        </label>
        <div className="flex items-center gap-3">
          <Button variant="primary" type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "保存中..." : "保存"}
          </Button>
          {savedRecently && <span className="text-xs text-seal">✦ 保存しました</span>}
        </div>
        {errors.base && (
          <p className="mt-3 text-xs text-seal" role="alert">
            {errors.base}
          </p>
        )}
      </form>
    </section>
  )
}

// ============================================================
// Email 変更
// ============================================================

function EmailSection() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const mutation = useMutation<User, ApiError, void>({
    mutationFn: () =>
      api<User>("/auth/email", {
        method: "PATCH",
        body: { email, current_password: currentPassword },
      }),
    onSuccess: async () => {
      setSuccess(true)
      setErrors({})
      setEmail("")
      setCurrentPassword("")
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (err) => {
      setSuccess(false)
      const errorMap: Record<string, string> = {}
      const errorList = Array.isArray(err.errors) ? err.errors : []
      errorList.forEach((e) => {
        const item = e as { field?: string; message?: string; code?: string }
        if (item.code === "invalid_password") errorMap.current_password = item.message ?? "現在のパスワードが正しくありません"
        else if (item.field) errorMap[item.field] = item.message ?? "エラー"
        else errorMap.base = item.message ?? "更新に失敗しました"
      })
      setErrors(errorMap)
    },
  })

  return (
    <section className="p-5 bg-parchment/60 border border-gold/40 rounded-sm">
      <h3 className="font-serif text-base text-ink mb-3">メールアドレス変更</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <FormField
          label="新しいメールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        <FormField
          label="現在のパスワード"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.current_password}
          required
        />
        <Button variant="primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "変更中..." : "メールアドレスを変更"}
        </Button>
        {success && <p className="mt-2 text-xs text-seal">✦ 変更しました</p>}
        {errors.base && <p className="mt-2 text-xs text-seal">{errors.base}</p>}
      </form>
    </section>
  )
}

// ============================================================
// Password 変更
// ============================================================

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const mutation = useMutation<void, ApiError, void>({
    mutationFn: () =>
      api<void>("/auth/password", {
        method: "PATCH",
        body: {
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        },
      }),
    onSuccess: () => {
      setSuccess(true)
      setErrors({})
      setCurrentPassword("")
      setPassword("")
      setPasswordConfirmation("")
    },
    onError: (err) => {
      setSuccess(false)
      const errorMap: Record<string, string> = {}
      const errorList = Array.isArray(err.errors) ? err.errors : []
      errorList.forEach((e) => {
        const item = e as { field?: string; message?: string; code?: string }
        if (item.code === "invalid_password") errorMap.current_password = item.message ?? "現在のパスワードが正しくありません"
        else if (item.field) errorMap[item.field] = item.message ?? "エラー"
        else errorMap.base = item.message ?? "更新に失敗しました"
      })
      setErrors(errorMap)
    },
  })

  return (
    <section className="p-5 bg-parchment/60 border border-gold/40 rounded-sm">
      <h3 className="font-serif text-base text-ink mb-3">パスワード変更</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <FormField
          label="現在のパスワード"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.current_password}
          required
        />
        <FormField
          label="新しいパスワード（6 文字以上）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        <FormField
          label="新しいパスワード（確認）"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          error={errors.password_confirmation}
          required
        />
        <Button variant="primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "変更中..." : "パスワードを変更"}
        </Button>
        {success && <p className="mt-2 text-xs text-seal">✦ 変更しました</p>}
        {errors.base && <p className="mt-2 text-xs text-seal">{errors.base}</p>}
      </form>
    </section>
  )
}

// ============================================================
// Logout
// ============================================================

function LogoutSection({ onLogout }: { onLogout: () => Promise<void> }) {
  const mutation = useMutation<void, ApiError, void>({
    mutationFn: () => api<void>("/auth/logout", { method: "DELETE" }),
    onSuccess: onLogout,
  })

  return (
    <section className="p-5 border border-ink/30 rounded-sm">
      <h3 className="font-serif text-base text-ink mb-3">ログアウト</h3>
      <Button variant="ghost" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "処理中..." : "ログアウト"}
      </Button>
    </section>
  )
}

export default SettingsPage
