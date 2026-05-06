import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { api, ApiError } from "../lib/api"

function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  // トークンの事前検証（無効・期限切れなら早めにエラー表示）。
  // 一時的なネットワーク障害で誤って「無効」表示しないよう、
  // 4xx は即時エラー扱い、ネットワーク系/5xx は 1 回までリトライする。
  const tokenQuery = useQuery<{ valid: boolean }, ApiError>({
    queryKey: ["password_reset_token", token],
    queryFn: () => api<{ valid: boolean }>(`/auth/password_resets/${token}`),
    enabled: !!token,
    retry: (failureCount, error) => {
      // 4xx（404 など）は即時 fail（リトライしてもトークンは無効のまま）
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
      return failureCount < 1
    },
  })

  const mutation = useMutation<void, ApiError, void>({
    mutationFn: () =>
      api<void>(`/auth/password_resets/${token}`, {
        method: "PATCH",
        body: { password, password_confirmation: passwordConfirmation },
      }),
    onSuccess: () => {
      setSuccess(true)
      setErrors({})
    },
    onError: (err) => {
      const errorMap: Record<string, string> = {}
      const errorList = Array.isArray(err.errors) ? err.errors : []
      errorList.forEach((e) => {
        const item = e as { field?: string; message?: string; code?: string }
        if (item.code === "invalid_or_expired_token") errorMap.base = item.message ?? "リンクが無効または期限切れです"
        else if (item.field) errorMap[item.field] = item.message ?? "エラー"
        else errorMap.base = item.message ?? "更新に失敗しました"
      })
      setErrors(errorMap)
    },
  })

  if (tokenQuery.isLoading) {
    return (
      <Layout title="パスワード再設定">
        <p className="text-center text-ink/60 mt-12">確認中…</p>
      </Layout>
    )
  }

  if (tokenQuery.isError) {
    // 4xx（404 など）はトークン自体が無効。それ以外（ネットワーク / 5xx）は接続障害扱い。
    const isInvalidToken =
      tokenQuery.error instanceof ApiError &&
      tokenQuery.error.status >= 400 &&
      tokenQuery.error.status < 500

    return (
      <Layout title="パスワード再設定">
        <div className="max-w-md mx-auto mt-8 text-center">
          {isInvalidToken ? (
            <>
              <p className="font-serif text-xl text-seal mb-3">リンクが無効です</p>
              <p className="text-sm text-ink/70 mb-6">
                このリンクは期限切れか、既に使用されています。
                <br />
                再度パスワード再設定リクエストをお送りください。
              </p>
              <Link to="/forgot-password">
                <Button variant="primary">再設定リンクを再送する</Button>
              </Link>
            </>
          ) : (
            <>
              <p className="font-serif text-xl text-seal mb-3">通信エラー</p>
              <p className="text-sm text-ink/70 mb-6">
                サーバーに接続できませんでした。
                <br />
                ネットワーク接続を確認のうえ、ページを再読み込みしてください。
              </p>
              <Button variant="primary" onClick={() => tokenQuery.refetch()}>
                再試行
              </Button>
            </>
          )}
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="パスワード再設定">
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-6">
          <p className="font-serif text-xl text-seal mb-2">新しいパスワードを設定</p>
        </div>

        {success ? (
          <div className="p-4 bg-parchment border border-gold/40 rounded-sm text-sm text-ink/80 text-center">
            <p className="mb-3 font-serif text-seal">✦ パスワードを更新しました</p>
            <Button variant="primary" onClick={() => navigate("/login")}>
              ログイン画面へ
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
          >
            {errors.base && (
              <p className="mb-3 text-xs text-seal" role="alert">
                {errors.base}
              </p>
            )}
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
            <Button variant="primary" type="submit" disabled={mutation.isPending} fullWidth>
              {mutation.isPending ? "更新中..." : "パスワードを更新"}
            </Button>
          </form>
        )}
      </div>
    </Layout>
  )
}

export default ResetPasswordPage
