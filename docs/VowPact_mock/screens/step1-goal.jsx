/* global React, rtStyle */

const { useState: useStep1State } = React;

// ステップインジケータ
function StepIndicator({ current = 1, total = 4, labels = ["目標", "試練", "期日", "署名"] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => {
          const idx = i + 1;
          const isActive = idx === current;
          const isDone = idx < current;
          return (
            <React.Fragment key={i}>
              <span
                aria-current={isActive ? "step" : undefined}
                style={{
                  width: isActive ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: isDone ? "#8b1a1a" : isActive ? "#8b1a1a" : "rgba(44,24,16,0.18)",
                  transition: "all 0.25s",
                }}
              />
              {i < total - 1 && (
                <span style={{ width: 8, height: 1, background: "rgba(201,169,97,0.45)" }} aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.4em",
          color: "#8b6f47",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 600,
          paddingLeft: "0.4em",
        }}
      >
        STEP {current} / {total} · {labels[current - 1]}
      </div>
    </div>
  );
}

// 巻物アイコン
function ScrollIcon({ size = 16, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h11a3 3 0 013 3v10a3 3 0 003 3H8a3 3 0 01-3-3V4z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M5 4a3 3 0 00-3 3v0a3 3 0 003 3" stroke={color} strokeWidth="1.4" />
      <path d="M9 9h6M9 13h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 矢印
function ArrowIcon({ dir = "right", size = 14, color = "#2c1810" }) {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ transform: `rotate(${rot}deg)` }} fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// くるくるローダー
function Spinner({ size = 16, color = "#c9a961" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ animation: "vp-spin 0.9s linear infinite" }}>
      <circle cx="12" cy="12" r="9" stroke={`${color}33`} strokeWidth="2" fill="none" />
      <path d="M12 3a9 9 0 019 9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 共通：ヘッダーセクション
function FormHeader({ step }) {
  return (
    <header style={{ padding: "20px 20px 14px", textAlign: "center" }}>
      <StepIndicator current={step} />
      <h1
        style={{
          margin: "18px 0 4px",
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "0.18em",
        }}
      >
        <ruby>契約書<rt style={rtStyle}>けいやくしょ</rt></ruby>を<ruby>結<rt style={rtStyle}>むす</rt></ruby>ぶ
      </h1>
      <p style={{ margin: 0, fontSize: 12, color: "#8b6f47", letterSpacing: "0.15em", fontFamily: "'Noto Serif JP', serif" }}>
        Step {step}：目標を定める
      </p>
    </header>
  );
}

// 質問見出し
function Prompt() {
  return (
    <div style={{ padding: "18px 24px 14px", textAlign: "center" }}>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
          fontSize: "clamp(22px, 6.4vw, 26px)",
          letterSpacing: "0.06em",
          lineHeight: 1.5,
          color: "#2c1810",
        }}
      >
        <ruby>今<rt style={rtStyle}>いま</rt></ruby>、<ruby>何<rt style={rtStyle}>なに</rt></ruby>を
        <ruby>成<rt style={rtStyle}>な</rt></ruby>し
        <ruby>遂<rt style={rtStyle}>と</rt></ruby>げたい？
      </h2>
      <div style={{ margin: "12px auto 0", width: 80, height: 1, background: "linear-gradient(to right, transparent, #c9a961, transparent)" }} />
    </div>
  );
}

// テキストエリア
function GoalTextarea({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          width: "100%",
          background: "#ffffff",
          border: "1px solid #d4c8b0",
          outline: "1px solid transparent",
          padding: "14px 16px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 16,
          lineHeight: 1.7,
          color: "#2c1810",
          resize: "vertical",
          minHeight: 110,
          boxSizing: "border-box",
          letterSpacing: "0.02em",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#8b6f47";
          e.target.style.outlineColor = "#c9a96155";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#d4c8b0";
          e.target.style.outlineColor = "transparent";
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 12,
          fontSize: 10,
          color: "#8b6f47",
          letterSpacing: "0.1em",
          pointerEvents: "none",
        }}
      >
        {value.length}/120
      </div>
    </div>
  );
}

// AI生成ボタン
function OracleButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        height: 48,
        background:
          "linear-gradient(180deg, #fbf6ec 0%, #f1e7d2 100%)",
        color: "#2c1810",
        border: "1px solid #c9a961",
        outline: "1px solid #c9a96155",
        outlineOffset: "-4px",
        borderRadius: 4,
        fontSize: 15,
        fontFamily: "'Noto Serif JP', serif",
        fontWeight: 600,
        letterSpacing: "0.18em",
        cursor: loading ? "wait" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        position: "relative",
      }}
      aria-label="AIによる目標案を受ける"
    >
      {loading ? <Spinner /> : <ScrollIcon size={16} color="#8b1a1a" />}
      <span>
        {loading ? (
          <>
            <ruby>天啓<rt style={{ fontSize: "0.5em", color: "#8b6f47" }}>てんけい</rt></ruby>を<ruby>授<rt style={{ fontSize: "0.5em", color: "#8b6f47" }}>さず</rt></ruby>かり中…
          </>
        ) : (
          <>
            <ruby>天啓<rt style={{ fontSize: "0.5em", color: "#8b6f47" }}>てんけい</rt></ruby>を<ruby>受<rt style={{ fontSize: "0.5em", color: "#8b6f47" }}>う</rt></ruby>ける
          </>
        )}
      </span>
    </button>
  );
}

// 提案カード
function OracleCard({ index, text, onSelect, selected }) {
  return (
    <div
      style={{
        background: selected ? "#f4e8d0" : "#ffffff",
        border: `1px solid ${selected ? "#8b6f47" : "#d4c8b0"}`,
        position: "relative",
        padding: "14px 16px 14px 44px",
      }}
    >
      {/* 番号 */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 14,
          left: 12,
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1px solid #c9a961",
          color: "#8b6f47",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(201,169,97,0.08)",
        }}
      >
        {["Ⅰ", "Ⅱ", "Ⅲ"][index]}
      </span>
      <p
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 15,
          lineHeight: 1.6,
          color: "#2c1810",
          letterSpacing: "0.02em",
          borderLeft: "2px solid #8b1a1a",
          paddingLeft: 10,
        }}
      >
        {text}
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onSelect}
          style={{
            background: selected ? "#2c1810" : "transparent",
            color: selected ? "#fbf6ec" : "#2c1810",
            border: "1px solid #2c1810",
            padding: "8px 14px",
            fontSize: 12,
            letterSpacing: "0.12em",
            fontFamily: "'Noto Sans JP', sans-serif",
            cursor: "pointer",
            borderRadius: 2,
          }}
        >
          {selected ? "✓ 選択中" : "これを選ぶ"}
        </button>
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#8b6f47",
            fontSize: 12,
            letterSpacing: "0.08em",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            textDecorationColor: "#d4c8b0",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          自由に編集する
        </button>
      </div>
    </div>
  );
}

// フッター（戻る/次へ）
function StepFooter({ canProceed, onBack, onNext }) {
  return (
    <footer
      style={{
        padding: "14px 20px 22px",
        background: "rgba(251,246,236,0.85)",
        borderTop: "1px solid #d4c8b0",
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 10,
      }}
    >
      <button
        onClick={onBack}
        style={{
          height: 48,
          background: "#ffffff",
          border: "1px solid #d4c8b0",
          color: "#2c1810",
          fontSize: 14,
          fontFamily: "'Noto Sans JP', sans-serif",
          letterSpacing: "0.12em",
          cursor: "pointer",
          borderRadius: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <ArrowIcon dir="left" />
        戻る
      </button>
      <button
        onClick={onNext}
        disabled={!canProceed}
        style={{
          height: 48,
          background: canProceed ? "#2c1810" : "#cfc4ad",
          color: canProceed ? "#fbf6ec" : "#8b6f47aa",
          border: `1px solid ${canProceed ? "#2c1810" : "#cfc4ad"}`,
          fontSize: 14,
          fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: 600,
          letterSpacing: "0.14em",
          cursor: canProceed ? "pointer" : "not-allowed",
          borderRadius: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: canProceed ? "0 6px 14px -8px rgba(44,24,16,0.6)" : "none",
        }}
      >
        次へ進む
        <ArrowIcon dir="right" color={canProceed ? "#fbf6ec" : "#8b6f47aa"} />
      </button>
    </footer>
  );
}

// ---------- 画面本体 ----------

const ORACLE_SUGGESTIONS = [
  "TOEIC 800点を3ヶ月で達成する",
  "英会話アプリを毎日30分続ける",
  "英語の本を5冊読破する",
];

function Step1Screen({ width = 412, initialMode = "empty" }) {
  // mode: 'empty' | 'loading' | 'suggestions' | 'filled' | 'selected'
  const [mode, setMode] = useStep1State(initialMode);
  const [value, setValue] = useStep1State(
    initialMode === "filled" ? "TOEIC 800点を達成する" : ""
  );
  const [selectedIdx, setSelectedIdx] = useStep1State(initialMode === "selected" ? 0 : -1);

  // initialModeに合わせた表示状態を作る
  const showSuggestions = mode === "suggestions" || mode === "selected";
  const isLoading = mode === "loading";
  const canProceed = value.trim().length > 0 || selectedIdx >= 0;

  const handleOracle = () => {
    setMode("loading");
    setTimeout(() => setMode("suggestions"), 1100);
  };

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    setValue(ORACLE_SUGGESTIONS[idx]);
    setMode("selected");
  };

  return (
    <div
      style={{
        width,
        minHeight: 900,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      <FormHeader step={1} />

      <main style={{ flex: 1, padding: "0 20px 20px", display: "flex", flexDirection: "column" }}>
        <Prompt />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GoalTextarea
            value={value}
            onChange={(v) => {
              setValue(v);
              setSelectedIdx(-1);
            }}
            placeholder="例：TOEIC 800点を達成する"
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
            <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.4em", paddingLeft: "0.4em", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600 }}>
              OR
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
          </div>

          <OracleButton onClick={handleOracle} loading={isLoading} />
        </div>

        {/* Loading state hint */}
        {isLoading && (
          <div
            style={{
              marginTop: 22,
              textAlign: "center",
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 13,
              color: "#8b6f47",
              fontStyle: "italic",
              letterSpacing: "0.08em",
              lineHeight: 1.8,
            }}
          >
            <ruby>古<rt style={rtStyle}>いにしえ</rt></ruby>の
            <ruby>知恵<rt style={rtStyle}>ちえ</rt></ruby>に
            <ruby>問<rt style={rtStyle}>と</rt></ruby>うている……
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (
          <section style={{ marginTop: 24 }} aria-label="目標案">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  color: "#2c1810",
                }}
              >
                <ruby>授<rt style={rtStyle}>さず</rt></ruby>かりし
                <ruby>三<rt style={rtStyle}>みっ</rt></ruby>つの
                <ruby>道<rt style={rtStyle}>みち</rt></ruby>
              </h3>
              <button
                onClick={handleOracle}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8b6f47",
                  fontSize: 12,
                  fontFamily: "'Noto Serif JP', serif",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ↻ もう一度問う
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ORACLE_SUGGESTIONS.map((text, i) => (
                <OracleCard
                  key={i}
                  index={i}
                  text={text}
                  selected={selectedIdx === i}
                  onSelect={() => handleSelect(i)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <StepFooter canProceed={canProceed} onBack={() => {}} onNext={() => {}} />
    </div>
  );
}

// CSS for spinner
if (typeof document !== "undefined" && !document.getElementById("vp-spin-style")) {
  const s = document.createElement("style");
  s.id = "vp-spin-style";
  s.textContent = `@keyframes vp-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

Object.assign(window, { Step1Screen });
