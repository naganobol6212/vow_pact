/* global React, RARITY */

const { useState: useAuthState } = React;

// ============================================================
// background ornament — subtle medieval flourish
// ============================================================
function BgOrnament() {
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height="100%"
      viewBox="0 0 412 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.08 }}
    >
      <defs>
        <pattern id="auth-cross" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 8v24M8 20h24" stroke="#8b6f47" strokeWidth="0.4" />
          <circle cx="20" cy="20" r="0.8" fill="#8b6f47" />
        </pattern>
      </defs>
      <rect width="412" height="900" fill="url(#auth-cross)" />
      {/* corner flourishes */}
      <g stroke="#8b6f47" strokeWidth="1" fill="none">
        <path d="M20 20 q30 0 30 30 M20 20 q0 30 30 30" />
        <path d="M392 20 q-30 0 -30 30 M392 20 q0 30 -30 30" />
        <path d="M20 880 q30 0 30 -30 M20 880 q0 -30 30 -30" />
        <path d="M392 880 q-30 0 -30 -30 M392 880 q0 -30 -30 -30" />
      </g>
    </svg>
  );
}

// ============================================================
// big logo — VOW PACT with ornamental seal
// ============================================================
function BigLogo() {
  return (
    <div style={{ textAlign: "center" }}>
      {/* seal mark */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <radialGradient id="auth-seal" cx="0.5" cy="0.5">
              <stop offset="0%" stopColor="#a8252a" />
              <stop offset="100%" stopColor="#7a1419" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#auth-seal)" stroke="#5a0d12" strokeWidth="1" />
          <circle cx="32" cy="32" r="22" fill="none" stroke="#fbf6ec" strokeWidth="0.8" opacity="0.7" />
          {/* shield */}
          <path d="M32 16 l10 4 v8 c0 6 -4 10 -10 12 c-6 -2 -10 -6 -10 -12 v-8 z" fill="#fbf6ec" opacity="0.95" />
          {/* cross */}
          <path d="M32 22 v14 M26 28 h12" stroke="#7a1419" strokeWidth="1.6" strokeLinecap="round" />
          {/* outer text — V P */}
          <text x="32" y="13" fontSize="6" fontFamily="'Cormorant Garamond', serif" fill="#fbf6ec" textAnchor="middle" letterSpacing="2" fontWeight="700">VOW</text>
          <text x="32" y="58" fontSize="6" fontFamily="'Cormorant Garamond', serif" fill="#fbf6ec" textAnchor="middle" letterSpacing="2" fontWeight="700">PACT</text>
        </svg>
      </div>

      {/* wordmark */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: "0.32em",
          color: "#2c1810",
          paddingLeft: "0.32em",
          lineHeight: 1,
        }}
      >
        VOW PACT
      </div>
      {/* divider */}
      <div style={{ margin: "14px auto 12px", width: 130, height: 1, background: "linear-gradient(to right, transparent, #c9a961, transparent)" }} />
      {/* tagline */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 13,
          fontWeight: 500,
          color: "#8b6f47",
          letterSpacing: "0.2em",
          paddingLeft: "0.2em",
          lineHeight: 1.7,
        }}
      >
        自分との契約を、紋章に変える
      </p>
    </div>
  );
}

// ============================================================
// tabs
// ============================================================
function AuthTabs({ tab, onTab }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #d4c8b0", margin: "0 4px" }}>
      {[
        { id: "signin", label: "ログイン", en: "SIGN IN" },
        { id: "signup", label: "新規登録", en: "SIGN UP" },
      ].map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            style={{
              flex: 1,
              padding: "12px 8px 14px",
              background: "transparent",
              border: "none",
              borderBottom: active ? "2px solid #8b1a1a" : "2px solid transparent",
              color: active ? "#2c1810" : "#8b6f47",
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              letterSpacing: "0.16em",
              cursor: "pointer",
              marginBottom: -1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span>{t.label}</span>
            <span
              style={{
                fontSize: 8,
                letterSpacing: "0.4em",
                color: active ? "#a77b1f" : "#a89c84",
                fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
                fontWeight: 600,
                paddingLeft: "0.4em",
              }}
            >
              {t.en}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// field
// ============================================================
function Field({ label, en, type = "text", value, onChange, placeholder, error, help, autoComplete }) {
  const [focused, setFocused] = useAuthState(false);
  return (
    <label style={{ display: "block", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#2c1810",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 8,
            letterSpacing: "0.4em",
            color: "#a89c84",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.4em",
          }}
        >
          {en}
        </span>
      </div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          background: "rgba(255,255,255,0.9)",
          border: error ? "1px solid #8b1a1a" : focused ? "1px solid #8b6f47" : "1px solid #d4c8b0",
          outline: focused && !error ? "1px solid #c9a96155" : "none",
          outlineOffset: "-3px",
          borderRadius: 2,
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 14,
          color: "#2c1810",
          letterSpacing: "0.02em",
        }}
      />
      {error && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: "#8b1a1a",
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}
      {!error && help && (
        <div style={{ marginTop: 6, fontSize: 10, color: "#8b6f47", letterSpacing: "0.04em", fontStyle: "italic" }}>{help}</div>
      )}
    </label>
  );
}

// ============================================================
// primary button (with loading)
// ============================================================
function PrimaryBtn({ children, loading, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%",
        padding: "14px 16px",
        background: disabled || loading ? "#5a4636" : "#2c1810",
        color: "#fbf6ec",
        border: "1px solid #2c1810",
        borderRadius: 2,
        fontFamily: "'Noto Serif JP', serif",
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.2em",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        boxShadow: "0 8px 18px -10px rgba(44,24,16,0.6)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="rgba(251,246,236,0.3)" strokeWidth="2.5" fill="none" />
          <path d="M21 12a9 9 0 00-9-9" stroke="#fbf6ec" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
          </path>
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}

// ============================================================
// checkbox
// ============================================================
function Check({ checked, onChange, children }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }}>
      <span
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          marginTop: 1,
          width: 18,
          height: 18,
          background: checked ? "#2c1810" : "#fff",
          border: `1px solid ${checked ? "#2c1810" : "#a89c84"}`,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fbf6ec",
          fontSize: 12,
        }}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6.5L4.8 9 10 3.5" stroke="#fbf6ec" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: 12, color: "#2c1810", lineHeight: 1.6, fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.04em" }}>{children}</span>
    </label>
  );
}

// ============================================================
// sign in form
// ============================================================
function SignInForm({ mode = "default" }) {
  const [email, setEmail] = useAuthState(mode === "error" ? "yuto@example.com" : "");
  const [pw, setPw] = useAuthState(mode === "error" ? "wrongpass" : "");
  const loading = mode === "loading";
  const formError = mode === "error" ? "メールアドレスまたはパスワードが違います" : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {formError && (
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(139,26,26,0.08)",
            border: "1px solid #8b1a1a",
            borderLeft: "3px solid #8b1a1a",
            borderRadius: 2,
            fontSize: 12,
            color: "#8b1a1a",
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "0.04em",
            lineHeight: 1.5,
          }}
        >
          ⚠ {formError}
        </div>
      )}
      <Field
        label="メールアドレス"
        en="EMAIL"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <Field
        label="パスワード"
        en="PASSWORD"
        type="password"
        value={pw}
        onChange={setPw}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      <PrimaryBtn loading={loading}>
        {loading ? "認証しています..." : "ログイン"}
      </PrimaryBtn>
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <a
          href="#"
          style={{
            fontSize: 12,
            color: "#8b6f47",
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "0.06em",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            textDecorationColor: "#c9a96188",
          }}
        >
          パスワードを忘れた方
        </a>
      </div>
    </div>
  );
}

// ============================================================
// sign up form
// ============================================================
function SignUpForm({ mode = "default" }) {
  const [name, setName] = useAuthState(mode !== "default" ? "Yuto" : "");
  const [email, setEmail] = useAuthState(mode === "error" ? "invalid-email" : mode === "loading" ? "yuto@example.com" : "");
  const [pw, setPw] = useAuthState(mode !== "default" ? "secret123" : "");
  const [pw2, setPw2] = useAuthState(mode === "error" ? "secret124" : mode === "loading" ? "secret123" : "");
  const [agree, setAgree] = useAuthState(mode === "loading");
  const loading = mode === "loading";

  const errors =
    mode === "error"
      ? {
          email: "正しいメールアドレスを入力してください",
          pw2: "パスワードが一致しません",
        }
      : {};

  const canSubmit = !!name && !!email && pw.length >= 8 && pw === pw2 && agree;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field
        label={
          <span>
            <ruby>契約者名<rt style={{ fontSize: "0.5em", color: "#8b6f47", letterSpacing: "0.06em" }}>けいやくしゃめい</rt></ruby>
          </span>
        }
        en="NAME"
        value={name}
        onChange={setName}
        placeholder="あなたの名（ニックネーム可）"
        help="契約書と紋章に刻まれる名前です"
        autoComplete="username"
      />
      <Field
        label="メールアドレス"
        en="EMAIL"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="パスワード"
        en="PASSWORD"
        type="password"
        value={pw}
        onChange={setPw}
        placeholder="8文字以上"
        help="8文字以上、英数字を含めてください"
        autoComplete="new-password"
      />
      <Field
        label="パスワード（確認）"
        en="CONFIRM"
        type="password"
        value={pw2}
        onChange={setPw2}
        placeholder="もう一度入力"
        error={errors.pw2}
        autoComplete="new-password"
      />

      <div style={{ marginTop: 4 }}>
        <Check checked={agree} onChange={setAgree}>
          <a href="#" style={{ color: "#8b1a1a", textDecoration: "underline", textUnderlineOffset: 2 }}>利用規約</a>
          {" "}および{" "}
          <a href="#" style={{ color: "#8b1a1a", textDecoration: "underline", textUnderlineOffset: 2 }}>プライバシーポリシー</a>
          に同意します
        </Check>
      </div>

      <PrimaryBtn loading={loading} disabled={!canSubmit && !loading}>
        {loading ? "契約を結んでいます..." : "登録する"}
      </PrimaryBtn>
    </div>
  );
}

// ============================================================
// screen
// ============================================================
function AuthScreen({ width = 412, initialTab = "signin", mode = "default" }) {
  const [tab, setTab] = useAuthState(initialTab);

  return (
    <div
      style={{
        width,
        minHeight: 920,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
        overflow: "hidden",
      }}
    >
      <BgOrnament />

      {/* status bar spacer */}
      <div style={{ height: 16 }} />

      {/* hero */}
      <section style={{ padding: "32px 24px 28px", position: "relative" }}>
        <BigLogo />
      </section>

      {/* card */}
      <section
        style={{
          margin: "0 20px 22px",
          padding: "20px 22px 24px",
          background: "rgba(255,255,255,0.78)",
          border: "1px solid #d4c8b0",
          outline: "1px solid #c9a96155",
          outlineOffset: -5,
          boxShadow: "0 14px 30px -20px rgba(44,24,16,0.35)",
          position: "relative",
        }}
      >
        <AuthTabs tab={tab} onTab={setTab} />
        <div style={{ paddingTop: 22 }}>
          {tab === "signin" ? <SignInForm mode={mode} /> : <SignUpForm mode={mode} />}
        </div>
      </section>

      {/* footer */}
      <footer
        style={{
          padding: "0 24px 24px",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#a77b1f",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.3em",
            marginBottom: 8,
          }}
        >
          ── ANNO MMXXVI ──
        </div>
        <div style={{ fontSize: 11, color: "#8b6f47", letterSpacing: "0.06em", lineHeight: 1.7 }}>
          <a href="#" style={{ color: "#8b6f47", textDecoration: "none" }}>利用規約</a>
          <span aria-hidden="true" style={{ margin: "0 10px", color: "#c9a961" }}>·</span>
          <a href="#" style={{ color: "#8b6f47", textDecoration: "none" }}>プライバシー</a>
          <span aria-hidden="true" style={{ margin: "0 10px", color: "#c9a961" }}>·</span>
          <a href="#" style={{ color: "#8b6f47", textDecoration: "none" }}>お問い合わせ</a>
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { AuthScreen });
