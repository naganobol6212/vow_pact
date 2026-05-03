/* global React */

const { useState: useStep2State } = React;
const _rt2 = { fontSize: "0.45em", letterSpacing: "0.05em", color: "#8b6f47", fontWeight: 400 };

// ========== icons ==========
function SwordsIcon({ size = 16, color = "#8b1a1a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21l8-8M21 21l-8-8M14 3l7 7-3 3-7-7 3-3zM10 21l-3-3M3 3l7 7-3 3-7-7 3-3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowIcon({ dir = "right", size = 14, color = "#2c1810" }) {
  const rot = { right: 0, left: 180 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ transform: `rotate(${rot}deg)` }} fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Spinner2({ size = 16, color = "#c9a961" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ animation: "vp-spin 0.9s linear infinite" }}>
      <circle cx="12" cy="12" r="9" stroke={`${color}33`} strokeWidth="2" fill="none" />
      <path d="M12 3a9 9 0 019 9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ========== step indicator ==========
function StepBar2({ current = 2, total = 4, labels = ["目標", "試練", "期日", "署名"] }) {
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
                style={{
                  width: isActive ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: isDone || isActive ? "#8b1a1a" : "rgba(44,24,16,0.18)",
                }}
              />
              {i < total - 1 && <span style={{ width: 8, height: 1, background: "rgba(201,169,97,0.45)" }} />}
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

// ========== rarity stars ==========
function RarityStars({ value = 3, max = 5 }) {
  return (
    <span aria-label={`格 ${value}/${max}`} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} filled={i < value} size={14} />
      ))}
    </span>
  );
}
function Star({ filled, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M7 1l1.6 4.3 4.4.3-3.4 3 1 4.4L7 10.6 3.4 13l1-4.4-3.4-3 4.4-.3z"
        fill={filled ? "#8b1a1a" : "transparent"}
        stroke={filled ? "#8b1a1a" : "#d4b8b8"}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ========== goal recap (read-only) ==========
function GoalRecap() {
  return (
    <div
      style={{
        margin: "0 20px 18px",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.6)",
        border: "1px solid #d4c8b0",
        borderLeft: "2px solid #8b1a1a",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.4em", marginBottom: 3 }}>
        あなたの目標
      </div>
      <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 14, color: "#2c1810", letterSpacing: "0.03em" }}>
        TOEIC 800点を<ruby>達成<rt style={_rt2}>たっせい</rt></ruby>する
      </div>
    </div>
  );
}

// ========== prompt ==========
function Prompt2() {
  return (
    <div style={{ padding: "4px 24px 14px", textAlign: "center" }}>
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
        <ruby>達成<rt style={_rt2}>たっせい</rt></ruby>までの<ruby>試練<rt style={_rt2}>しれん</rt></ruby>を
        <ruby>授<rt style={_rt2}>さず</rt></ruby>ける
      </h2>
      <div style={{ margin: "12px auto 0", width: 80, height: 1, background: "linear-gradient(to right, transparent, #c9a961, transparent)" }} />
    </div>
  );
}

// ========== textarea ==========
function TrialTextarea({ value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例：達成までSNSを1日30分以内に制限する"
        rows={3}
        style={{
          width: "100%",
          background: "#ffffff",
          border: "1px solid #d4c8b0",
          padding: "14px 16px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 16,
          lineHeight: 1.7,
          color: "#2c1810",
          resize: "vertical",
          minHeight: 92,
          boxSizing: "border-box",
          letterSpacing: "0.02em",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#8b6f47")}
        onBlur={(e) => (e.target.style.borderColor = "#d4c8b0")}
      />
      <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 10, color: "#8b6f47", letterSpacing: "0.1em", pointerEvents: "none" }}>
        {value.length}/120
      </div>
    </div>
  );
}

// ========== gacha button ==========
function GachaButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        height: 52,
        background:
          "linear-gradient(180deg, #2c1810 0%, #3a2418 100%)",
        color: "#fbf6ec",
        border: "1px solid #2c1810",
        outline: "1px solid #c9a961",
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
        boxShadow: "0 6px 16px -8px rgba(44,24,16,0.7)",
        position: "relative",
      }}
      aria-label="AIから試練を授かる"
    >
      {loading ? <Spinner2 /> : <SwordsIcon size={18} color="#c9a961" />}
      <span>
        {loading ? (
          <>
            <ruby>試練<rt style={{ ..._rt2, color: "#c9a961" }}>しれん</rt></ruby>を
            <ruby>授<rt style={{ ..._rt2, color: "#c9a961" }}>さず</rt></ruby>かり中…
          </>
        ) : (
          <>
            <ruby>試練<rt style={{ ..._rt2, color: "#c9a961" }}>しれん</rt></ruby>を
            <ruby>授<rt style={{ ..._rt2, color: "#c9a961" }}>さず</rt></ruby>かる
          </>
        )}
      </span>
    </button>
  );
}

// ========== trial card ==========
function TrialCard({ index, text, rarity, selected, onToggle }) {
  return (
    <div
      style={{
        background: selected ? "#f4e8d0" : "#ffffff",
        border: `1px solid ${selected ? "#8b6f47" : "#d4c8b0"}`,
        outline: selected ? "1px solid #c9a961" : "none",
        outlineOffset: "-4px",
        position: "relative",
        padding: "12px 14px 14px 44px",
        transition: "all 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 12,
          left: 10,
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: "1px solid #c9a961",
          color: "#8b6f47",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: selected ? "#fbf6ec" : "rgba(201,169,97,0.08)",
        }}
        aria-hidden="true"
      >
        {["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][index]}
      </span>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.4em" }}>
          <ruby>難易度<rt style={{ fontSize: "0.55em", color: "#8b6f47" }}>なんいど</rt></ruby>
        </span>
        <RarityStars value={rarity} />
      </div>

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
          marginBottom: 12,
        }}
      >
        {text}
      </p>

      <button
        onClick={onToggle}
        aria-pressed={selected}
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
    </div>
  );
}

// ========== footer ==========
function StepFooter2({ canProceed, onBack, onNext }) {
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

// ========== screen ==========

const TRIAL_SUGGESTIONS = [
  { text: "SNSを1日30分以内に制限する", rarity: 2 },
  { text: "平日は飲酒を断つ", rarity: 3 },
  { text: "朝6時起床を厳守する", rarity: 4 },
  { text: "動画配信サービスを全て解約する", rarity: 5 },
  { text: "毎晩30分の英語学習を欠かさない", rarity: 2 },
];

function Step2Screen({ width = 412, initialMode = "empty" }) {
  // empty | loading | suggestions | selected | filled | multi
  const [mode, setMode] = useStep2State(initialMode);
  const [value, setValue] = useStep2State(
    initialMode === "filled" ? "達成までSNSを1日30分以内に制限する" : ""
  );
  const [selectedIdxs, setSelectedIdxs] = useStep2State(
    initialMode === "selected" ? [0] :
    initialMode === "multi" ? [0, 2] : []
  );

  const showSuggestions = mode === "suggestions" || mode === "selected" || mode === "multi";
  const isLoading = mode === "loading";
  const canProceed = value.trim().length > 0 || selectedIdxs.length > 0;

  const handleGacha = () => {
    setMode("loading");
    setTimeout(() => setMode("suggestions"), 1100);
  };

  const toggle = (idx) => {
    setSelectedIdxs((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      setMode(next.length > 1 ? "multi" : next.length === 1 ? "selected" : "suggestions");
      return next;
    });
    setValue("");
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
      <header style={{ padding: "20px 20px 14px", textAlign: "center" }}>
        <StepBar2 current={2} />
        <h1
          style={{
            margin: "18px 0 4px",
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.18em",
          }}
        >
          <ruby>契約書<rt style={_rt2}>けいやくしょ</rt></ruby>を<ruby>結<rt style={_rt2}>むす</rt></ruby>ぶ
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: "#8b6f47", letterSpacing: "0.15em", fontFamily: "'Noto Serif JP', serif" }}>
          Step 2：試練を定める
        </p>
      </header>

      <GoalRecap />

      <main style={{ flex: 1, padding: "0 20px 20px", display: "flex", flexDirection: "column" }}>
        <Prompt2 />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TrialTextarea
            value={value}
            onChange={(v) => {
              setValue(v);
              if (v) setSelectedIdxs([]);
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
            <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.4em", paddingLeft: "0.4em", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600 }}>
              OR
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
          </div>

          <GachaButton onClick={handleGacha} loading={isLoading} />
          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: 11,
              color: "#8b6f47",
              fontFamily: "'Noto Sans JP', sans-serif",
              letterSpacing: "0.04em",
              lineHeight: 1.7,
            }}
          >
            ★が多いほど、達成時の<ruby>紋章<rt style={{ fontSize: "0.7em", color: "#8b6f47" }}>もんしょう</rt></ruby>のレアリティが上がる
          </p>
        </div>

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
            <ruby>運命<rt style={_rt2}>うんめい</rt></ruby>の<ruby>賽<rt style={_rt2}>さい</rt></ruby>が<ruby>転<rt style={_rt2}>ころ</rt></ruby>がっている……
          </div>
        )}

        {showSuggestions && (
          <section style={{ marginTop: 24 }} aria-label="試練案">
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
                <ruby>授<rt style={_rt2}>さず</rt></ruby>かりし<ruby>五<rt style={_rt2}>いつ</rt></ruby>つの<ruby>試練<rt style={_rt2}>しれん</rt></ruby>
                {selectedIdxs.length > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: "#8b1a1a", letterSpacing: "0.1em" }}>
                    （{selectedIdxs.length}件選択中）
                  </span>
                )}
              </h3>
              <button
                onClick={handleGacha}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#8b6f47",
                  fontSize: 12,
                  fontFamily: "'Noto Serif JP', serif",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                ↻ もう一度引く
              </button>
            </div>
            <div style={{ marginBottom: 8, fontSize: 11, color: "#8b6f47", letterSpacing: "0.04em" }}>
              ※複数選択可
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TRIAL_SUGGESTIONS.map((t, i) => (
                <TrialCard
                  key={i}
                  index={i}
                  text={t.text}
                  rarity={t.rarity}
                  selected={selectedIdxs.includes(i)}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <StepFooter2 canProceed={canProceed} onBack={() => {}} onNext={() => {}} />
    </div>
  );
}

if (typeof document !== "undefined" && !document.getElementById("vp-spin-style")) {
  const s = document.createElement("style");
  s.id = "vp-spin-style";
  s.textContent = `@keyframes vp-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

Object.assign(window, { Step2Screen });
