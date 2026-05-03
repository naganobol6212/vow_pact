/* global React */

const { useState: useEditState } = React;

// ============================================================
// icons
// ============================================================
function BackArrowE({ size = 14, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 3L4 7l5 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockE({ size = 12, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.5" stroke={color} strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
function StarE({ filled, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5L7 1.5z"
        fill={filled ? "#c9a961" : "transparent"}
        stroke={filled ? "#8b6f1f" : "#a89c84"}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function CheckE({ size = 14, color = "#fbf6ec" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7l3 3 5-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================
// editable field with counter
// ============================================================
function EditField({ label, en, value, onChange, max = 200, placeholder, error, multiline }) {
  const [focused, setFocused] = useEditState(false);
  const len = value?.length || 0;
  const over = len > max;
  return (
    <div style={{ display: "block", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 14, fontWeight: 700,
              color: "#2c1810",
              letterSpacing: "0.16em",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              fontSize: 9, letterSpacing: "0.4em",
              color: "#a77b1f",
              fontWeight: 600,
              paddingLeft: "0.4em",
            }}
          >
            {en}
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: 11,
            color: over ? "#8b1a1a" : "#8b6f47",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          {len} / {max}
        </span>
      </div>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={4}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            background: "#f4e8d0",
            border: error || over
              ? "1px solid #8b1a1a"
              : focused ? "1px solid #8b6f47" : "1px solid #d4c8b0",
            outline: focused && !error && !over ? "1px solid #c9a96155" : "none",
            outlineOffset: "-4px",
            borderRadius: 0,
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 15,
            lineHeight: 1.7,
            color: "#2c1810",
            letterSpacing: "0.04em",
            resize: "vertical",
            minHeight: 96,
          }}
        />
      ) : (
        <input
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "12px 14px", background: "#f4e8d0",
            border: error || over ? "1px solid #8b1a1a" : focused ? "1px solid #8b6f47" : "1px solid #d4c8b0",
            outline: focused && !error && !over ? "1px solid #c9a96155" : "none",
            outlineOffset: "-4px", borderRadius: 0,
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 15, color: "#2c1810",
            letterSpacing: "0.04em",
          }}
        />
      )}
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: "#8b1a1a", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 5 }}>
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}
      {over && !error && (
        <div style={{ marginTop: 6, fontSize: 11, color: "#8b1a1a", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.04em" }}>
          ⚠ 文字数が上限を超えています
        </div>
      )}
    </div>
  );
}

// ============================================================
// locked field
// ============================================================
function LockedField({ label, en, value, note }) {
  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 14, fontWeight: 700,
              color: "#8b6f47",
              letterSpacing: "0.16em",
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              fontSize: 9, letterSpacing: "0.4em",
              color: "#a89c84",
              fontWeight: 600,
              paddingLeft: "0.4em",
            }}
          >
            {en}
          </span>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, color: "#8b6f47", letterSpacing: "0.2em", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.2em" }}>
          <LockE />
          LOCKED
        </span>
      </div>
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(212,200,176,0.25)",
          border: "1px dashed #b3a890",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 15,
          color: "#6b5d48",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
          minHeight: 24,
          display: "flex",
          alignItems: "center",
        }}
      >
        {value}
      </div>
      {note && (
        <div style={{ marginTop: 6, fontSize: 10, color: "#8b6f47", fontStyle: "italic", letterSpacing: "0.04em", fontFamily: "'Noto Serif JP', serif" }}>
          ※ {note}
        </div>
      )}
    </div>
  );
}

// ============================================================
// toast
// ============================================================
function Toast() {
  return (
    <div
      role="status"
      style={{
        position: "absolute",
        top: 70,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 20px",
        background: "#2c1810",
        color: "#fbf6ec",
        border: "1px solid #2c1810",
        outline: "1px solid #c9a96177",
        outlineOffset: "-4px",
        borderRadius: 2,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Noto Serif JP', serif",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.1em",
        boxShadow: "0 12px 24px -10px rgba(44,24,16,0.5)",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "#c9a961",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <CheckE color="#2c1810" />
      </span>
      契約書を更新しました
    </div>
  );
}

// ============================================================
// section header
// ============================================================
function SecHeadE({ jp, en }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
      <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 12, fontWeight: 700, color: "#2c1810", letterSpacing: "0.2em" }}>{jp}</span>
      <span style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontSize: 9, letterSpacing: "0.4em", color: "#a77b1f", fontWeight: 600, paddingLeft: "0.4em" }}>{en}</span>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, #c9a96155, transparent)", marginBottom: 2 }} />
    </div>
  );
}

// ============================================================
// edit screen
// ============================================================
function EditScreen({ width = 412, mode = "default" }) {
  const initialGoal = "TOEIC 800点を達成する";
  const initialTrial = "達成までSNSを1日30分以内に制限する";

  const [goal, setGoal] = useEditState(mode === "dirty" || mode === "saved" ? "TOEIC 800点を半年以内に達成する" : initialGoal);
  const [trial, setTrial] = useEditState(initialTrial);

  const dirty = goal !== initialGoal || trial !== initialTrial;
  const valid = goal.trim().length > 0 && trial.trim().length > 0 && goal.length <= 200 && trial.length <= 200;
  const canSave = dirty && valid;

  const showToast = mode === "saved";

  return (
    <div
      style={{
        width,
        minHeight: 1320,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      <div style={{ height: 12 }} />

      {/* top bar */}
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "10px 16px 12px",
          borderBottom: "1px solid rgba(212,200,176,0.6)",
        }}
      >
        <button
          aria-label="戻る"
          style={{
            background: "transparent", border: "none",
            padding: "6px 4px", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 4,
            color: "#8b6f47",
            fontFamily: "'Noto Serif JP', serif", fontSize: 12, fontWeight: 500,
            letterSpacing: "0.08em",
            justifySelf: "start",
          }}
        >
          <BackArrowE />
          戻る
        </button>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: 11,
            letterSpacing: "0.45em",
            color: "#8b6f47",
            fontWeight: 600,
            paddingLeft: "0.45em",
          }}
        >
          PACT &nbsp;·&nbsp; No. 001
        </div>
        <span />
      </header>

      {/* hero */}
      <section style={{ textAlign: "center", padding: "26px 24px 20px" }}>
        <div
          style={{
            fontSize: 9, letterSpacing: "0.5em",
            color: "#a77b1f",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.5em",
            marginBottom: 10,
          }}
        >
          ── EDIT VOW ──
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "0.14em",
            color: "#2c1810",
            paddingLeft: "0.14em",
            lineHeight: 1.4,
          }}
        >
          契約書を編集する
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 12,
            color: "#8b6f47",
            letterSpacing: "0.06em",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          目標と試練の文言を修正できます
        </p>
      </section>

      {/* form */}
      <main style={{ padding: "0 22px 0", flex: 1 }}>
        {/* editable section */}
        <div style={{ marginBottom: 28 }}>
          <SecHeadE jp="編集可能" en="EDITABLE" />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <EditField
              label="目標"
              en="GOAL"
              value={goal}
              onChange={setGoal}
              max={120}
              multiline
              placeholder="達成したい目標を記してください"
            />
            <EditField
              label="試練"
              en="TRIAL"
              value={trial}
              onChange={setTrial}
              max={200}
              multiline
              placeholder="目標達成のために自分に課す試練"
            />
          </div>
        </div>

        {/* locked section */}
        <div style={{ marginBottom: 26 }}>
          <SecHeadE jp="変更不可" en="LOCKED" />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <LockedField
              label="試練の格"
              en="DIFFICULTY"
              value={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarE key={i} filled={i <= 4} />
                  ))}
                  <span style={{ marginLeft: 8, fontSize: 12, color: "#8b6f47", letterSpacing: "0.08em" }}>4 / 5</span>
                </span>
              }
              note="難易度は変更できません"
            />
            <LockedField
              label="期日"
              en="DEADLINE"
              value="2026年 8月 2日 まで"
              note="期日は変更できません"
            />
          </div>
        </div>

        {/* notes */}
        <div
          style={{
            margin: "0 0 26px",
            padding: "12px 14px",
            background: "rgba(201,169,97,0.08)",
            border: "1px dashed #c9a961",
            fontSize: 11,
            color: "#8b6f47",
            lineHeight: 1.85,
            letterSpacing: "0.04em",
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#a77b1f", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.4em", marginBottom: 6 }}>
            NOTES
          </div>
          ・ 契約締結時の難易度判定は変更されません<br />
          ・ 過去のチェックイン履歴はそのまま引き継がれます
        </div>
      </main>

      {/* sticky-ish action bar */}
      <footer
        style={{
          padding: "16px 22px 22px",
          borderTop: "1px solid rgba(212,200,176,0.7)",
          background: "rgba(251,246,236,0.85)",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          style={{
            flex: "0 0 38%", padding: "13px 12px",
            background: "transparent", color: "#2c1810",
            border: "1px solid #2c1810", borderRadius: 2,
            fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 600,
            letterSpacing: "0.16em", cursor: "pointer",
          }}
        >
          キャンセル
        </button>
        <button
          disabled={!canSave}
          style={{
            flex: 1, padding: "13px 12px",
            background: canSave ? "#8b1a1a" : "#c9a89455",
            color: canSave ? "#fbf6ec" : "#a89c84",
            border: canSave ? "1px solid #8b1a1a" : "1px solid #c9a894",
            borderRadius: 2,
            fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.16em",
            cursor: canSave ? "pointer" : "not-allowed",
            boxShadow: canSave ? "0 8px 18px -10px rgba(139,26,26,0.6)" : "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {canSave && <CheckE size={13} />}
          変更を保存
        </button>
      </footer>

      {showToast && <Toast />}
    </div>
  );
}

Object.assign(window, { EditScreen });
