import { useState } from "react"
import type { ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { useAuth } from "../hooks/useAuth"
import { api, apiFormData, ApiError } from "../lib/api"
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

// Active Storage 側と同じ上限。フロントで先に弾いて無駄なアップロードを避ける。
const AVATAR_MAX_BYTES = 2 * 1024 * 1024

function ProfileSection({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [nickname, setNickname] = useState(user.nickname)
  const [isPublic, setIsPublic] = useState(user.is_public)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedRecently, setSavedRecently] = useState(false)

  const currentAvatar = avatarPreview ?? user.avatar_image_url ?? user.avatar_url ?? null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > AVATAR_MAX_BYTES) {
      // サーバーまで送らずに即フィードバック
      setErrors((prev) => ({
        ...prev,
        avatar: `は 2MB 以下にしてください（選択ファイル: ${(file.size / 1024 / 1024).toFixed(1)}MB）`,
      }))
      setAvatarFile(null)
      setAvatarPreview(null)
      e.target.value = "" // 同じファイルを再選択できるようリセット
      return
    }
    setErrors((prev) => {
      const next = { ...prev }
      delete next.avatar
      return next
    })
    setAvatarFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setAvatarPreview(typeof reader.result === "string" ? reader.result : null)
      reader.readAsDataURL(file)
    } else {
      setAvatarPreview(null)
    }
  }

  const updateMutation = useMutation<User, ApiError, void>({
    mutationFn: () => {
      const fd = new FormData()
      fd.append("nickname", nickname)
      fd.append("is_public", String(isPublic))
      if (avatarFile) fd.append("avatar", avatarFile)
      return apiFormData<User>("/auth/me", { method: "PATCH", body: fd })
    },
    onSuccess: async () => {
      setErrors({})
      setSavedRecently(true)
      setAvatarFile(null)
      setAvatarPreview(null)
      // 5 秒に延長（ネットワーク遅い環境でもメッセージを見逃さない）
      setTimeout(() => setSavedRecently(false), 5000)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
    onError: (err) => {
      // デバッグ用に詳細をコンソールへ。本番でも開発者ツールで原因追跡しやすくなる。
      // （Render の Render-side ログにはアクセスできないことが多いため）
      console.error("[Profile] save failed", err.status, err.errors)
      const errorMap: Record<string, string> = {}
      const errorList = Array.isArray(err.errors) ? err.errors : []
      errorList.forEach((e) => {
        const item = e as { field?: string; message?: string }
        if (item.field) errorMap[item.field] = item.message ?? "エラー"
        else errorMap.base = item.message ?? "更新に失敗しました"
      })
      // errors 配列が空 / 構造が違う場合のフォールバック（ネットワークエラー等）
      if (Object.keys(errorMap).length === 0) {
        errorMap.base = `保存に失敗しました（status: ${err.status}）。時間を置いて再度お試しください。`
      }
      setErrors(errorMap)
    },
  })

  return (
    <section className="p-5 bg-parchment/60 border border-gold/40 rounded-xl shadow-sm">
      <h3 className="font-serif text-base text-ink mb-3">プロフィール</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateMutation.mutate()
        }}
      >
        {/* アバター画像 */}
        <div className="mb-4">
          <p className="block mb-2 font-serif text-sm text-ink/80">アバター画像</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-parchment border-2 border-gold/40 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {currentAvatar ? (
                <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <label className="inline-block cursor-pointer">
                <span className="px-4 py-2 text-sm bg-gold text-ink rounded-lg shadow hover:shadow-md transition inline-block">
                  画像を選択
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-ink/50 mt-1">PNG / JPEG / WebP / GIF（2MB まで）</p>
              {avatarFile && (
                <p className="text-xs text-seal mt-1">{avatarFile.name} を選択中（保存で反映）</p>
              )}
              {errors.avatar && (
                <p className="text-xs text-seal mt-1">{errors.avatar}</p>
              )}
            </div>
          </div>
        </div>

        <FormField
          label="ニックネーム"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={errors.nickname}
          required
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
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="primary" type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "保存中..." : "保存"}
          </Button>
          {savedRecently && (
            <span
              role="status"
              aria-live="polite"
              className="px-3 py-1.5 text-sm font-serif font-bold bg-gold/20 text-ink border border-gold rounded-sm"
            >
              ✦ 保存しました
            </span>
          )}
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
