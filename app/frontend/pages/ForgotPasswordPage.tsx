import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { api, ApiError } from "../lib/api"

function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation<unknown, ApiError, void>({
    mutationFn: () =>
      api<unknown>("/auth/password_resets", {
        method: "POST",
        body: { email },
      }),
    onSuccess: () => setSubmitted(true),
  })

  return (
    <Layout title="パスワード再設定">
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-6">
          <p className="font-serif text-xl text-seal mb-2">パスワードをお忘れですか</p>
          <p className="text-sm text-ink/60">
            登録したメールアドレスを入力してください。
            <br />
            再設定用のリンクをお送りします。
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-parchment border border-gold/40 rounded-sm text-sm text-ink/80">
            <p className="mb-2 font-serif text-seal">メールを送信しました</p>
            <p>
              該当アカウントが存在する場合、再設定リンクをお送りしました。
              <br />
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
            <p className="mt-3">
              <Link to="/login" className="text-seal underline">
                ログイン画面へ戻る
              </Link>
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
          >
            <FormField
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" disabled={mutation.isPending} fullWidth>
              {mutation.isPending ? "送信中..." : "再設定リンクを送る"}
            </Button>
            <p className="mt-4 text-center text-sm">
              <Link to="/login" className="text-ink/60 hover:text-seal">
                ログイン画面へ戻る
              </Link>
            </p>
          </form>
        )}
      </div>
    </Layout>
  )
}

export default ForgotPasswordPage
