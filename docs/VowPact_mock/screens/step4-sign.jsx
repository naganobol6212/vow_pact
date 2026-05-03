/* global React, StarDivider, DifficultyStars, Seal, Signature, CornerOrnament, rtStyle */

const { useState: useStep4State } = React;

// ========== icons ==========
function ArrowIcon4({ dir = "right", size = 14, color = "#2c1810" }) {
  const rot = { right: 0, left: 180 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ transform: `rotate(${rot}deg)` }} fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ScaleIcon({ size = 18, color = "#c9a961" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v18M5 21h14M5 7l3 7h-6zM19 7l3 7h-6zM5 7h14M5 7L3 5M19 7l2-2"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="3" r="1.2" fill={color} />
    </svg>
  );
}

// ========== step indicator ==========
function StepBar4({ current = 4, total = 4, labels = ["目標", "試練", "期日", "署名"] }) {
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

// ========== unsigned contract card ==========

const accentBodyStyle4 = {
  fontFamily: "'Noto Serif JP', serif",
  fontSize: 16,
  lineHeight: 1.7,
  color: "#2c1810",
  borderLeft: "2px solid #8b1a1a",
  padding: "2px 0 2px 12px",
  margin: 0,
  letterSpacing: "0.02em",
};

function Section4({ label, right, children }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 10,
            color: "#8b6f47",
            letterSpacing: "0.45em",
            fontWeight: 600,
            paddingLeft: "0.45em",
          }}
        >
          【{label}】
        </h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function SealPlaceholder({ size = 64 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1.5px dashed #c9a961",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#a08866",
        fontFamily: "'Noto Serif JP', serif",
        fontSize: 9,
        letterSpacing: "0.2em",
        lineHeight: 1.3,
        opacity: 0.7,
        background: "rgba(255,255,255,0.25)",
      }}
    >
      <span style={{ fontSize: 11, marginBottom: 2 }}>未</span>
      <span>押印</span>
    </div>
  );
}

function StampedSeal({ animate = false }) {
  return (
    <div
      style={{
        animation: animate ? "vp-stamp 0.6s cubic-bezier(0.2, 1.4, 0.4, 1) 0.1s both" : "none",
        transformOrigin: "center",
      }}
    >
      <Seal size={64} rotate={-8} />
    </div>
  );
}

function UnsignedContractCard({ data, signer, sealed = false, sealAnimate = false }) {
  const { no = "—", goal, trial, difficulty = 4, deadline } = data;
  const showSignature = signer && signer.trim().length > 0;

  return (
    <article
      aria-label="誓約契約書（草稿）"
      style={{
        position: "relative",
        background: "#f4e8d0",
        border: "0.5px solid #d4c8b0",
        boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 28px -16px rgba(44,24,16,0.35), 0 2px 4px rgba(44,24,16,0.06)",
        padding: "32px 22px 24px",
        outline: "1px solid #c9a961",
        outlineOffset: "-10px",
      }}
    >
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      <header style={{ textAlign: "center", marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: "clamp(20px, 6vw, 26px)",
            letterSpacing: "0.45em",
            color: "#2c1810",
            margin: 0,
            paddingLeft: "0.45em",
          }}
        >
          誓約契約書
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#8b6f47",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          }}
        >
          VOW PACT &nbsp;·&nbsp; {sealed ? `No. ${no}` : "草稿"}
        </p>
      </header>

      <div style={{ margin: "12px 4px 18px" }}>
        <StarDivider />
      </div>

      <p
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 14,
          color: "#2c1810",
          textAlign: "center",
          letterSpacing: "0.08em",
          margin: "0 0 22px",
        }}
      >
        我、ここに以下を誓う。
      </p>

      <Section4 label="目標">
        <p style={accentBodyStyle4}>{goal}</p>
      </Section4>

      <Section4
        label="試練"
        right={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#8b6f47", letterSpacing: "0.25em" }}>
              <ruby>難易度<rt style={{ fontSize: "0.55em", color: "#8b6f47" }}>なんいど</rt></ruby>
            </span>
            <DifficultyStars value={difficulty} />
          </span>
        }
      >
        <p style={accentBodyStyle4}>{trial}</p>
      </Section4>

      <Section4 label="期日">
        <p style={accentBodyStyle4}>{deadline}</p>
      </Section4>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#8b6f47", marginBottom: 8 }}>
            契約者
          </div>
          <div
            style={{
              borderBottom: showSignature ? "1px solid #2c1810" : "1px dashed #a08866",
              paddingBottom: 4,
              minHeight: 36,
              display: "flex",
              alignItems: "flex-end",
              transition: "border-color 0.2s",
            }}
          >
            {showSignature ? (
              <Signature name={signer} />
            ) : (
              <span
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "#a08866",
                  letterSpacing: "0.05em",
                }}
              >
                ここに署名
              </span>
            )}
          </div>
        </div>
        <div style={{ marginBottom: -4, marginRight: -2 }}>
          {sealed ? <StampedSeal animate={sealAnimate} /> : <SealPlaceholder size={64} />}
        </div>
      </div>
    </article>
  );
}

// ========== signature input ==========
function SignatureInput({ value, onChange }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          letterSpacing: "0.4em",
          color: "#8b6f47",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 600,
          paddingLeft: "0.4em",
          marginBottom: 8,
        }}
      >
        SIGNATURE · 契約者の名前
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="名前を入力"
          maxLength={32}
          style={{
            width: "100%",
            background: "#ffffff",
            border: "1px solid #d4c8b0",
            padding: "14px 16px 14px 36px",
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 17,
            color: "#2c1810",
            letterSpacing: "0.05em",
            boxSizing: "border-box",
            borderRadius: 4,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#8b6f47")}
          onBlur={(e) => (e.target.style.borderColor = "#d4c8b0")}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 18,
            color: "#8b6f47",
            opacity: 0.5,
          }}
        >
          ✎
        </span>
      </div>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 11,
          color: "#8b6f47",
          letterSpacing: "0.04em",
          lineHeight: 1.6,
        }}
      >
        この名前で契約書に署名されます。
      </p>
    </div>
  );
}

// ========== vow button ==========
function VowButton({ enabled, sealing, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled || sealing}
      aria-label="ここに誓う"
      style={{
        width: "100%",
        height: 64,
        background: enabled ? "linear-gradient(180deg, #2c1810 0%, #3a2418 100%)" : "#cfc4ad",
        color: enabled ? "#fbf6ec" : "#8b6f47aa",
        border: `1px solid ${enabled ? "#2c1810" : "#cfc4ad"}`,
        outline: enabled ? "1px solid #c9a961" : "none",
        outlineOffset: "-5px",
        borderRadius: 4,
        fontSize: 17,
        fontFamily: "'Noto Serif JP', serif",
        fontWeight: 700,
        letterSpacing: "0.3em",
        cursor: enabled && !sealing ? "pointer" : sealing ? "wait" : "not-allowed",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        boxShadow: enabled ? "0 10px 22px -10px rgba(44,24,16,0.7)" : "none",
        position: "relative",
        paddingLeft: "0.3em",
      }}
    >
      <ScaleIcon size={20} color={enabled ? "#c9a961" : "#a89c84"} />
      <span>{sealing ? "押印中…" : "ここに誓う"}</span>
    </button>
  );
}

// ========== screen ==========

const sampleData = {
  no: "001",
  goal: (
    <>
      TOEIC 800<ruby>点<rt style={rtStyle}>てん</rt></ruby>を<ruby>達成<rt style={rtStyle}>たっせい</rt></ruby>する
    </>
  ),
  trial: (
    <>
      <ruby>達成<rt style={rtStyle}>たっせい</rt></ruby>まで、SNSを1日30分以内に<ruby>制限<rt style={rtStyle}>せいげん</rt></ruby>する
    </>
  ),
  difficulty: 4,
  deadline: (
    <>
      2026<ruby>年<rt style={rtStyle}>ねん</rt></ruby> 8<ruby>月<rt style={rtStyle}>がつ</rt></ruby> 2<ruby>日<rt style={rtStyle}>にち</rt></ruby> まで（あと92日）
    </>
  ),
};

function Step4Screen({ width = 412, initialMode = "prefilled" }) {
  // empty | prefilled | edited | sealing | sealed
  const [signer, setSigner] = useStep4State(
    initialMode === "empty" ? "" :
    initialMode === "edited" ? "Yuto Tanaka" :
    "Yuto"
  );
  const [sealed, setSealed] = useStep4State(initialMode === "sealed");
  const [sealing, setSealing] = useStep4State(initialMode === "sealing");

  const enabled = signer.trim().length > 0 && !sealed;

  const handleVow = () => {
    setSealing(true);
    setTimeout(() => {
      setSealing(false);
      setSealed(true);
    }, 700);
  };

  return (
    <div
      style={{
        width,
        minHeight: 1200,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      <header style={{ padding: "20px 20px 14px", textAlign: "center" }}>
        <StepBar4 current={4} />
        <h1
          style={{
            margin: "18px 0 6px",
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.18em",
          }}
        >
          内容を<ruby>確認<rt style={rtStyle}>かくにん</rt></ruby>して、<ruby>誓<rt style={rtStyle}>ちか</rt></ruby>いを立てる
        </h1>
        <p style={{ margin: 0, fontSize: 11, color: "#8b6f47", letterSpacing: "0.1em", fontFamily: "'Noto Serif JP', serif" }}>
          Step 4：契約を成立させる
        </p>
      </header>

      <div style={{ padding: "0 16px 18px" }}>
        <UnsignedContractCard data={sampleData} signer={signer} sealed={sealed} sealAnimate={sealed && initialMode !== "sealed"} />
      </div>

      <div
        style={{
          margin: "0 20px",
          padding: "20px 18px 22px",
          background: "rgba(255,255,255,0.55)",
          border: "1px solid #d4c8b0",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <SignatureInput value={signer} onChange={setSigner} />
        <VowButton enabled={enabled} sealing={sealing} onClick={handleVow} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "10px 12px",
            background: "rgba(139,26,26,0.05)",
            border: "1px solid rgba(139,26,26,0.18)",
            borderRadius: 4,
          }}
        >
          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: 12,
              color: "#8b1a1a",
              letterSpacing: "0.06em",
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            ⚠ 契約成立後、<ruby>期日<rt style={rtStyle}>きじつ</rt></ruby>と<ruby>難易度<rt style={rtStyle}>なんいど</rt></ruby>は変更できません
          </p>
          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: 11,
              color: "#8b6f47",
              letterSpacing: "0.04em",
              fontFamily: "'Noto Serif JP', serif",
              lineHeight: 1.6,
            }}
          >
            <ruby>目標<rt style={rtStyle}>もくひょう</rt></ruby>と<ruby>試練<rt style={rtStyle}>しれん</rt></ruby>の文言のみ後から編集可能です
          </p>
        </div>
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#8b6f47",
            fontSize: 13,
            fontFamily: "'Noto Serif JP', serif",
            cursor: "pointer",
            letterSpacing: "0.06em",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            margin: "0 auto",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          <ArrowIcon4 dir="left" size={11} color="#8b6f47" />
          戻って修正する
        </button>
      </div>

      <div style={{ height: 28 }} />
    </div>
  );
}

if (typeof document !== "undefined" && !document.getElementById("vp-stamp-style")) {
  const s = document.createElement("style");
  s.id = "vp-stamp-style";
  s.textContent = `
    @keyframes vp-stamp {
      0% { transform: scale(2.5) rotate(-30deg); opacity: 0; }
      40% { transform: scale(1.3) rotate(-12deg); opacity: 1; }
      70% { transform: scale(0.92) rotate(-6deg); }
      100% { transform: scale(1) rotate(-8deg); opacity: 1; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { Step4Screen });
