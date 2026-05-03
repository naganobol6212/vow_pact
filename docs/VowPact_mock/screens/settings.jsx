/* global React */

const { useState: useSetState } = React;

// ============================================================
// chrome icons
// ============================================================
function ChevronS({ size = 14, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BackArrowS({ size = 18, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M11 4L6 9l5 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PencilS({ size = 14, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13L4 10l7-7 3 3-7 7-3 1z M10 4l3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WarningS({ size = 18, color = "#8b1a1a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l10 17H2L12 3z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10v5M12 17.5v0.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================
// section header
// ============================================================
function SectionHeader({ title, en }) {
  return (
    <div style={{ padding: "22px 20px 8px", display: "flex", alignItems: "baseline", gap: 10 }}>
      <span
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 12,
          fontWeight: 700,
          color: "#2c1810",
          letterSpacing: "0.2em",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 9,
          letterSpacing: "0.4em",
          color: "#a77b1f",
          fontWeight: 600,
          paddingLeft: "0.4em",
        }}
      >
        {en}
      </span>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, #c9a96155, transparent)", marginBottom: 2 }} />
    </div>
  );
}

// ============================================================
// list (group container)
// ============================================================
function List({ children }) {
  return (
    <div
      style={{
        margin: "0 20px",
        background: "rgba(255,255,255,0.65)",
        border: "1px solid #d4c8b0",
      }}
    >
      {React.Children.toArray(children).map((c, i, arr) => (
        <React.Fragment key={i}>
          {c}
          {i < arr.length - 1 && <div style={{ height: 1, background: "rgba(212,200,176,0.7)", margin: "0 16px" }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================
// rows
// ============================================================
function Row({ label, sub, value, action, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "transparent",
        border: "none",
        width: "100%",
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 14,
            fontWeight: 600,
            color: danger ? "#8b1a1a" : "#2c1810",
            letterSpacing: "0.04em",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "#8b6f47", marginTop: 3, letterSpacing: "0.04em", lineHeight: 1.5 }}>
            {sub}
          </div>
        )}
      </div>
      {value && (
        <span style={{ fontSize: 13, color: "#8b6f47", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.02em" }}>
          {value}
        </span>
      )}
      {action}
      {onClick && !action && <ChevronS />}
    </button>
  );
}

function ToggleRowS({ label, sub, checked, onChange, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", opacity: disabled ? 0.5 : 1 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 14, fontWeight: 600, color: "#2c1810", letterSpacing: "0.04em", lineHeight: 1.4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#8b6f47", marginTop: 3, letterSpacing: "0.04em", lineHeight: 1.5 }}>{sub}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 999,
          background: checked ? "#2c1810" : "#d4c8b0",
          border: `1px solid ${checked ? "#2c1810" : "#b3a890"}`,
          position: "relative", cursor: disabled ? "not-allowed" : "pointer", padding: 0,
          flexShrink: 0,
        }}
      >
        <span aria-hidden="true" style={{
          position: "absolute", top: 2, left: checked ? 22 : 2,
          width: 18, height: 18, borderRadius: "50%",
          background: checked ? "#fbf6ec" : "#fff",
          boxShadow: "0 1px 2px rgba(44,24,16,0.25)", transition: "left 0.15s",
        }} />
      </button>
    </div>
  );
}

// ============================================================
// edit name field (inline)
// ============================================================
function EditableNameRow({ value, onChange }) {
  const [editing, setEditing] = useSetState(false);
  const [draft, setDraft] = useSetState(value);

  return (
    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 14, fontWeight: 600, color: "#2c1810", letterSpacing: "0.04em" }}>
          <ruby>契約者名<rt style={{ fontSize: "0.5em", color: "#8b6f47" }}>けいやくしゃめい</rt></ruby>
        </div>
        <div style={{ fontSize: 11, color: "#8b6f47", marginTop: 3, letterSpacing: "0.04em" }}>契約書と紋章に刻まれる名前</div>
        {editing ? (
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 10px",
                background: "#fff",
                border: "1px solid #8b6f47",
                outline: "1px solid #c9a96155",
                outlineOffset: "-3px",
                borderRadius: 2,
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 14,
                color: "#2c1810",
              }}
              autoFocus
            />
            <button
              onClick={() => { onChange?.(draft); setEditing(false); }}
              style={{
                padding: "8px 14px", background: "#2c1810", color: "#fbf6ec",
                border: "1px solid #2c1810", borderRadius: 2,
                fontFamily: "'Noto Serif JP', serif", fontSize: 12, fontWeight: 600,
                letterSpacing: "0.1em", cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => { setDraft(value); setEditing(false); }}
              style={{
                padding: "8px 14px", background: "transparent", color: "#8b6f47",
                border: "1px solid #d4c8b0", borderRadius: 2,
                fontFamily: "'Noto Serif JP', serif", fontSize: 12,
                letterSpacing: "0.1em", cursor: "pointer",
              }}
            >
              取消
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 6, fontFamily: "'Noto Serif JP', serif", fontSize: 16, fontWeight: 700, color: "#2c1810", letterSpacing: "0.06em" }}>
            {value}
          </div>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          aria-label="名前を編集"
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "transparent", border: "1px solid #d4c8b0",
            padding: "6px 10px", borderRadius: 2, cursor: "pointer",
            color: "#8b6f47", fontSize: 11, letterSpacing: "0.08em",
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          <PencilS />
          編集
        </button>
      )}
    </div>
  );
}

// ============================================================
// confirm modal
// ============================================================
function DeleteConfirmModal({ onCancel, onConfirm }) {
  const [text, setText] = useSetState("");
  const required = "契約破棄";
  const ok = text === required;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "absolute", inset: 0,
        background: "rgba(28,16,10,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, zIndex: 10,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          background: "#fbf6ec",
          border: "1px solid #8b1a1a",
          outline: "1px solid #8b1a1a55",
          outlineOffset: -5,
          padding: "22px 22px 18px",
          width: "100%",
          maxWidth: 340,
          boxShadow: "0 24px 48px -16px rgba(44,24,16,0.5)",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <WarningS />
          <h3
            style={{
              margin: 0,
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 16, fontWeight: 700,
              color: "#8b1a1a",
              letterSpacing: "0.1em",
            }}
          >
            アカウント削除
          </h3>
        </div>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12,
            color: "#2c1810",
            lineHeight: 1.7,
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "0.04em",
          }}
        >
          すべての契約・紋章・殿堂の記録が
          <strong style={{ color: "#8b1a1a" }}> 永久に失われます </strong>
          。この操作は取り消せません。
        </p>
        <div
          style={{
            padding: "10px 12px",
            background: "rgba(139,26,26,0.06)",
            border: "1px dashed #8b1a1a",
            marginBottom: 12,
            fontSize: 11,
            color: "#2c1810",
            lineHeight: 1.7,
            letterSpacing: "0.04em",
          }}
        >
          続行するには下の欄に<br />
          <strong style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, color: "#8b1a1a", letterSpacing: "0.1em" }}>「{required}」</strong>
          {" "}と入力してください。
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={required}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "10px 12px", background: "#fff",
            border: ok ? "1px solid #8b1a1a" : "1px solid #d4c8b0",
            borderRadius: 2,
            fontFamily: "'Noto Serif JP', serif", fontSize: 14,
            color: "#2c1810", letterSpacing: "0.06em",
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px 12px",
              background: "transparent", color: "#2c1810",
              border: "1px solid #2c1810", borderRadius: 2,
              fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 600,
              letterSpacing: "0.14em", cursor: "pointer",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={ok ? onConfirm : undefined}
            disabled={!ok}
            style={{
              flex: 1, padding: "11px 12px",
              background: ok ? "#8b1a1a" : "#c9a89455",
              color: ok ? "#fbf6ec" : "#a89c84",
              border: ok ? "1px solid #8b1a1a" : "1px solid #c9a894",
              borderRadius: 2,
              fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.14em",
              cursor: ok ? "pointer" : "not-allowed",
            }}
          >
            破棄する
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// screen
// ============================================================
function SettingsScreen({ width = 412, mode = "default" }) {
  const [name, setName] = useSetState("Yuto");
  const [dark, setDark] = useSetState(false);
  const [rankVisible, setRankVisible] = useSetState(true);
  const [hallPublic, setHallPublic] = useSetState(true);
  const [anonymous, setAnonymous] = useSetState(false);
  const [confirm, setConfirm] = useSetState(mode === "confirm-delete");

  return (
    <div
      style={{
        width,
        minHeight: 1200,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      {/* status bar spacer */}
      <div style={{ height: 12 }} />

      {/* top bar */}
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr 44px",
          alignItems: "center",
          padding: "8px 12px 8px",
          borderBottom: "1px solid #d4c8b0",
        }}
      >
        <button
          aria-label="戻る"
          style={{
            background: "transparent", border: "none",
            padding: 10, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <BackArrowS />
        </button>
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "0.24em",
            color: "#2c1810",
            paddingLeft: "0.24em",
          }}
        >
          設定
        </h1>
        <span />
      </header>

      {/* PROFILE */}
      <SectionHeader title="プロフィール" en="PROFILE" />
      <List>
        <EditableNameRow value={name} onChange={setName} />
        <Row
          label="メールアドレス"
          sub="認証およびリマインドの送信先"
          value="yuto@example.com"
          onClick={() => {}}
        />
        <Row
          label="パスワード変更"
          sub="安全のため定期的な変更を推奨"
          onClick={() => {}}
        />
      </List>

      {/* DISPLAY */}
      <SectionHeader title="表示" en="DISPLAY" />
      <List>
        <ToggleRowS
          label="ダークモード"
          sub="夜間に目に優しい暗色テーマで表示"
          checked={dark}
          onChange={setDark}
        />
        <Row
          label="通知設定"
          sub="チェックインのリマインド・期日通知"
          value="ON"
          onClick={() => {}}
        />
      </List>

      {/* PRIVACY */}
      <SectionHeader title="プライバシー" en="PRIVACY" />
      <List>
        <ToggleRowS
          label="ランキングに表示する"
          sub="OFF にすると順位は計算されない"
          checked={rankVisible}
          onChange={setRankVisible}
        />
        <ToggleRowS
          label="殿堂を公開する"
          sub="他のユーザーがあなたの達成記録を閲覧可能"
          checked={hallPublic}
          onChange={setHallPublic}
        />
        <ToggleRowS
          label="匿名で表示する"
          sub="ニックネームの代わりに「匿名の挑戦者」と表示"
          checked={anonymous}
          onChange={setAnonymous}
          disabled={!rankVisible && !hallPublic}
        />
      </List>

      {/* ACCOUNT */}
      <SectionHeader title="アカウント" en="ACCOUNT" />
      <List>
        <Row label="ログアウト" sub="このデバイスからサインアウトします" onClick={() => {}} />
        <Row
          label="アカウント削除"
          sub="すべての契約・紋章・記録が永久に失われます"
          danger
          action={<ChevronS color="#8b1a1a" />}
          onClick={() => setConfirm(true)}
        />
      </List>

      {/* INFO */}
      <SectionHeader title="アプリ情報" en="ABOUT" />
      <List>
        <Row label="利用規約" onClick={() => {}} />
        <Row label="プライバシーポリシー" onClick={() => {}} />
        <Row label="お問い合わせ" onClick={() => {}} />
      </List>

      {/* footer */}
      <div
        style={{
          padding: "28px 24px 24px",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: "#a77b1f",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.4em",
          }}
        >
          ── VOW PACT · ANNO MMXXVI ──
        </div>
      </div>

      {confirm && (
        <DeleteConfirmModal
          onCancel={() => setConfirm(false)}
          onConfirm={() => setConfirm(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { SettingsScreen });
