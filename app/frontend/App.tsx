import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import HomePage from "./pages/HomePage"
import AuthPage from "./pages/AuthPage"
import CreatePactStep1Page from "./pages/CreatePactStep1Page"
import CreatePactStep2Page from "./pages/CreatePactStep2Page"
import CreatePactStep3Page from "./pages/CreatePactStep3Page"
import CreatePactStep4Page from "./pages/CreatePactStep4Page"
import SignedPage from "./pages/SignedPage"
import PactsListPage from "./pages/PactsListPage"
import PactDetailPage from "./pages/PactDetailPage"
import CrestsGalleryPage from "./pages/CrestsGalleryPage"
import RankingsPage from "./pages/RankingsPage"
import SettingsPage from "./pages/SettingsPage"
import RequireAuth from "./components/RequireAuth"
import { CreatePactProvider } from "./contexts/CreatePactContext"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />

          {/* 認証必須 + 契約作成フロー（4 ステップで Context 共有） */}
          <Route
            path="/pacts/new/*"
            element={
              <RequireAuth>
                <CreatePactProvider>
                  <Routes>
                    {/* /pacts/new または /pacts/new/ への直アクセスは step1 へ */}
                    <Route index element={<Navigate to="step1" replace />} />
                    <Route path="step1" element={<CreatePactStep1Page />} />
                    <Route path="step2" element={<CreatePactStep2Page />} />
                    <Route path="step3" element={<CreatePactStep3Page />} />
                    <Route path="step4" element={<CreatePactStep4Page />} />
                    <Route path="*" element={<Navigate to="step1" replace />} />
                  </Routes>
                </CreatePactProvider>
              </RequireAuth>
            }
          />

          {/* 締結後画面（認証必須、Context 不要） */}
          <Route
            path="/pacts/:id/signed"
            element={
              <RequireAuth>
                <SignedPage />
              </RequireAuth>
            }
          />

          {/* 契約一覧 */}
          <Route
            path="/pacts"
            element={
              <RequireAuth>
                <PactsListPage />
              </RequireAuth>
            }
          />

          {/* 契約詳細 + チェックイン UI */}
          <Route
            path="/pacts/:id"
            element={
              <RequireAuth>
                <PactDetailPage />
              </RequireAuth>
            }
          />

          {/* 紋章ギャラリー（誓約の殿堂） */}
          <Route
            path="/crests"
            element={
              <RequireAuth>
                <CrestsGalleryPage />
              </RequireAuth>
            }
          />

          {/* ランキング（誓約者の番付） */}
          <Route
            path="/rankings"
            element={
              <RequireAuth>
                <RankingsPage />
              </RequireAuth>
            }
          />

          {/* 設定（プロフィール / メール / パスワード / ログアウト / 正式登録） */}
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
