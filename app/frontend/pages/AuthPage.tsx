import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import Layout from "../components/Layout"
import Button from "../components/Button"
import FormField from "../components/FormField"
import { api, ApiError } from "../lib/api"
import type { User } from "../types/user"

type Mode = "login" | "signup"

type ApiErrorItem = {
  code: string
  field?: string
  message: string
}

function AuthPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      if (mode === "signup") {
        await api<User>("/auth/signup", {
          method: "POST",
          body: {
            email,
            nickname,
            password,
            password_confirmation: passwordConfirmation,
          },
        })
      } else {
        await api<User>("/auth/login", {
          method: "POST",
          body: { email, password },
        })
      }
      // ログイン中ユーザー情報のキャッシュを破棄して再取得を促す
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      navigate("/pacts/new/step1")
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMap: Record<string, string> = {}
        const list = Array.isArray(err.errors) ? (err.errors as ApiErrorItem[]) : []
        list.forEach((e) => {
          if (e.field && e.field !== "base") {
            errorMap[e.field] = e.message
          } else {
            errorMap.base = e.message
          }
        })
        if (Object.keys(errorMap).length === 0) {
          errorMap.base = "通信に失敗しました。時を置いてお試しください。"
        }
        setErrors(errorMap)
      } else {
        setErrors({ base: "予期せぬ問題が発生しました。" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={mode === "login" ? "ログイン" : "新規登録"} showFooter={false}>
      <div className="max-w-md mx-auto mt-12">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl text-seal mb-2">
            {mode === "login" ? "再び誓いの場へ" : "誓約の旅を始める"}
          </h2>
          <p className="text-sm text-ink/60">
            {mode === "login" ? "メールアドレスとパスワードで入場" : "新たな誓約者として名を刻む"}
          </p>
        </div>

        <div className="flex border-b border-gold/30 mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 font-serif transition ${
              mode === "login" ? "text-seal border-b-2 border-seal" : "text-ink/50"
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 font-serif transition ${
              mode === "signup" ? "text-seal border-b-2 border-seal" : "text-ink/50"
            }`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errors.base && (
            <div
              className="mb-4 p-3 bg-seal/10 border border-seal text-seal text-sm rounded-sm"
              role="alert"
            >
              {errors.base}
            </div>
          )}

          <FormField
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vow@example.com"
            error={errors.email}
            required
          />

          {mode === "signup" && (
            <FormField
              label="ニックネーム"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="あなたの名"
              error={errors.nickname}
              required
            />
          )}

          <FormField
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6文字以上"
            error={errors.password}
            required
          />

          {mode === "signup" && (
            <FormField
              label="パスワード（確認）"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="再度同じパスワード"
              error={errors.password_confirmation}
              required
            />
          )}

          <Button variant="primary" fullWidth type="submit" disabled={loading} className="mt-2">
            {loading ? "送信中..." : mode === "login" ? "ここに誓う" : "誓約を交わす"}
          </Button>
        </form>
      </div>
    </Layout>
  )
}

export default AuthPage
