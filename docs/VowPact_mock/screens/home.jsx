/* global React, Seal */

const { useState: useHomeState } = React;

// ===== rtStyle (local) =====
const _rt = { fontSize: "0.45em", letterSpacing: "0.05em", color: "#8b6f47", fontWeight: 400 };

// ===== icons =====
const GearIcon = ({ size = 20, color = "#2c1810" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke={color} strokeWidth="1.4" />
    <path d="M19.4 13.6a7.6 7.6 0 000-3.2l1.9-1.5-2-3.4-2.3.8a7.7 7.7 0 00-2.7-1.6L13.7 2h-3.4l-.6 2.7a7.7 7.7 0 00-2.7 1.6l-2.3-.8-2 3.4 1.9 1.5a7.6 7.6 0 000 3.2l-1.9 1.5 2 3.4 2.3-.8a7.7 7.7 0 002.7 1.6l.6 2.7h3.4l.6-2.7a7.7 7.7 0 002.7-1.6l2.3.8 2-3.4-1.9-1.5z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
const ShieldIcon = ({ size = 22, color = "#2c1810" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5l8-3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12 8v6M9 11h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
const RankIcon = ({ size = 22, color = "#2c1810" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 19l9-9M19 19l-9-9M14 4l6 6M10 4L4 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="14" cy="4" r="1" fill={color} />
    <circle cx="10" cy="4" r="1" fill={color} />
  </svg>
);
const HomeIcon = ({ size = 22, color = "#2c1810" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);
const FlameIcon = ({ size = 14, color = "#c9a961" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22c-4.5 0-7-3-7-7 0-3 2-5.5 3-7 0 1.5 1 2.5 2 2.5 0-3 1.5-6 5-8.5-1 4 4 6 4 11 0 5-2.5 9-7 9z" fill={color} stroke="#8b6f47" strokeWidth="0.8" strokeLinejoin="round" />
  </svg>
);
const PlusIcon = ({ size = 16, color = "#2c1810" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// ===== stars =====
function Stars({ value = 4, max = 5 }) {
  return (
    <span aria-label={`難易度 ${value}/${max}`} style={{ color: "#8b1a1a", letterSpacing: "0.1em", fontSize: 12 }}>
      {"★".repeat(value)}<span style={{ color: "#d4b8b8" }}>{"★".repeat(max - value)}</span>
    </span>
  );
}

// ===== contract card =====
function ContractCard({ contract, onCheckin }) {
  const { no, goal, trial, difficulty, daysLeft, checkin } = contract;
  const done = checkin !== null;

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #d4c8b0",
        boxShadow: "0 8px 22px -16px rgba(44,24,16,0.35), 0 1px 2px rgba(44,24,16,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Top bar — meta */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid #ead9b8",
          background: "linear-gradient(180deg, rgba(201,169,97,0.08) 0%, rgba(201,169,97,0.02) 100%)",
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "#8b6f47",
            fontWeight: 600,
            paddingLeft: "0.3em",
          }}
        >
          No. {no}
        </span>
        <Stars value={difficulty} />
      </header>

      {/* parchment preview */}
      <button
        onClick={() => {}}
        aria-label={`契約 No.${no} の詳細を見る`}
        style={{
          width: "100%",
          textAlign: "left",
          background: "#f4e8d0",
          border: "none",
          borderBottom: "1px solid #ead9b8",
          padding: "16px 16px 14px",
          cursor: "pointer",
          position: "relative",
          fontFamily: "'Noto Serif JP', serif",
          color: "#2c1810",
          display: "flex",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* days remaining */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#8b6f47", letterSpacing: "0.1em" }}>期日まで</span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
                fontSize: 28,
                fontWeight: 600,
                color: "#8b1a1a",
                lineHeight: 1,
              }}
            >
              {daysLeft}
            </span>
            <span style={{ fontSize: 13, color: "#2c1810", letterSpacing: "0.05em" }}>日</span>
          </div>

          {/* goal */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, marginBottom: 3, paddingLeft: "0.4em" }}>
              【目標】
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.5,
                color: "#2c1810",
                borderLeft: "2px solid #8b1a1a",
                paddingLeft: 10,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {goal}
            </p>
          </div>

          {/* trial */}
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, marginBottom: 3, paddingLeft: "0.4em" }}>
              【試練】
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 13,
                lineHeight: 1.55,
                color: "#6b6b6b",
                borderLeft: "2px solid rgba(139,26,26,0.4)",
                paddingLeft: 10,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {trial}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 2 }}>
          <span aria-hidden="true" style={{ fontSize: 11, color: "#8b6f47", letterSpacing: "0.1em", fontFamily: "'Noto Serif JP', serif" }}>詳細 ›</span>
          <Seal size={56} rotate={-8} />
        </div>
      </button>

      {/* check-in section */}
      <div style={{ padding: "12px 14px 14px", background: "#ffffff" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            color: done ? "#8b6f47" : "#2c1810",
            fontWeight: 600,
            fontFamily: "'Noto Sans JP', sans-serif",
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>今日のチェックイン</span>
          {done && (
            <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.15em" }}>
              {checkin === "kept" ? "✓ 守れた" : checkin === "failed" ? "× 守れなかった" : "— スキップ"}
            </span>
          )}
        </div>

        {done ? (
          <div
            style={{
              padding: "10px 12px",
              border: "1px dashed #d4c8b0",
              background: "rgba(201,169,97,0.05)",
              fontSize: 12,
              color: "#8b6f47",
              letterSpacing: "0.05em",
              fontFamily: "'Noto Sans JP', sans-serif",
              textAlign: "center",
            }}
          >
            今日の記録は完了しています
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8 }}>
              <button
                onClick={() => onCheckin("kept")}
                style={{
                  height: 44,
                  background: "#8b1a1a",
                  color: "#fbf6ec",
                  border: "1px solid #6b1414",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxShadow: "0 4px 10px -6px rgba(139,26,26,0.6)",
                }}
              >
                守れた
              </button>
              <button
                onClick={() => onCheckin("failed")}
                style={{
                  height: 44,
                  background: "#ffffff",
                  color: "#2c1810",
                  border: "1px solid #d4c8b0",
                  borderRadius: 4,
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                守れなかった
              </button>
            </div>
            <button
              onClick={() => onCheckin("skipped")}
              style={{
                marginTop: 6,
                width: "100%",
                height: 32,
                background: "transparent",
                border: "none",
                color: "#8b6f47",
                fontSize: 12,
                cursor: "pointer",
                letterSpacing: "0.1em",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                textDecorationColor: "#d4c8b0",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              スキップ
            </button>
          </>
        )}
      </div>
    </article>
  );
}

// ===== new contract button =====
function NewContractButton({ disabled }) {
  return (
    <button
      disabled={disabled}
      style={{
        width: "100%",
        background: disabled ? "rgba(244,232,208,0.4)" : "#fbf6ec",
        border: `2px dashed ${disabled ? "#d4c8b099" : "#c9a961"}`,
        padding: "20px 16px",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        color: disabled ? "#bdab8e" : "#2c1810",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", fontFamily: "'Noto Serif JP', serif" }}>
        <PlusIcon color={disabled ? "#bdab8e" : "#2c1810"} />
        <ruby>新規契約<rt style={_rt}>しんきけいやく</rt></ruby>を<ruby>結<rt style={_rt}>むす</rt></ruby>ぶ
      </div>
      {disabled && (
        <span style={{ fontSize: 11, color: "#8b6f47", letterSpacing: "0.1em" }}>
          契約は最大3つまで
        </span>
      )}
    </button>
  );
}

// ===== status bar =====
function StatusBar({ streak, active, max }) {
  return (
    <div
      style={{
        margin: "0 20px",
        padding: "12px 14px",
        background: "linear-gradient(180deg, rgba(201,169,97,0.10) 0%, rgba(201,169,97,0.02) 100%)",
        border: "1px solid #c9a96155",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FlameIcon size={18} />
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#8b6f47", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.35em" }}>
            STREAK
          </div>
          <div style={{ fontSize: 13, fontFamily: "'Noto Serif JP', serif", color: "#2c1810", letterSpacing: "0.04em" }}>
            <span style={{ color: "#8b1a1a", fontWeight: 600, fontSize: 16 }}>{streak}</span>日連続でチェックイン中
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#8b6f47", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.35em" }}>
          PACTS
        </div>
        <div style={{ fontSize: 13, fontFamily: "'Noto Serif JP', serif", color: "#2c1810" }}>
          契約 <span style={{ color: "#2c1810", fontWeight: 600, fontSize: 16 }}>{active}</span>
          <span style={{ color: "#8b6f47" }}>/{max}</span>
        </div>
      </div>
    </div>
  );
}

// ===== nav =====
function NavItem({ icon, label, active }) {
  return (
    <button
      style={{
        background: "transparent",
        border: "none",
        padding: "12px 8px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        color: active ? "#2c1810" : "#6b6b6b",
        position: "relative",
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <span aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 28, height: 2, background: "#8b1a1a" }} />
      )}
      <span style={{ opacity: active ? 1 : 0.65 }}>
        {React.cloneElement(icon, { color: active ? "#2c1810" : "#6b6b6b" })}
      </span>
      <span style={{ fontSize: 11, letterSpacing: "0.15em" }}>{label}</span>
    </button>
  );
}

// ===== main screen =====

const SAMPLE = [
  {
    no: "001",
    goal: "TOEIC 800点を達成する",
    trial: <>達成までSNSを1日30分以内に<ruby>制限<rt style={_rt}>せいげん</rt></ruby>する</>,
    difficulty: 4,
    daysLeft: 73,
    checkin: null,
  },
  {
    no: "002",
    goal: "体重を5kg減らす",
    trial: <>平日は<ruby>飲酒<rt style={_rt}>いんしゅ</rt></ruby>を<ruby>断<rt style={_rt}>た</rt></ruby>つ</>,
    difficulty: 3,
    daysLeft: 45,
    checkin: "kept",
  },
];

const SAMPLE_THREE = [
  ...SAMPLE,
  {
    no: "003",
    goal: "毎朝5時に起きて読書する",
    trial: <>22時以降は<ruby>画面<rt style={_rt}>がめん</rt></ruby>を見ない</>,
    difficulty: 5,
    daysLeft: 12,
    checkin: null,
  },
];

function HomeScreen({ width = 412, variant = "default" }) {
  // variant: 'default' (2/3), 'full' (3/3), 'empty' (0/3)
  const [contracts, setContracts] = useHomeState(
    variant === "full" ? SAMPLE_THREE : variant === "empty" ? [] : SAMPLE
  );

  const handleCheckin = (idx, value) => {
    setContracts((prev) => prev.map((c, i) => (i === idx ? { ...c, checkin: value } : c)));
  };

  const isEmpty = contracts.length === 0;
  const isFull = contracts.length >= 3;
  const streak = isEmpty ? 0 : 7;

  return (
    <div
      style={{
        width,
        minHeight: 900,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        boxSizing: "border-box",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(201,169,97,0.35)",
          background: "rgba(251,246,236,0.6)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.55em",
            color: "#2c1810",
            paddingLeft: "0.55em",
          }}
        >
          VOW PACT
        </div>
        <button aria-label="設定" style={{ background: "transparent", border: "none", padding: 6, cursor: "pointer", display: "inline-flex" }}>
          <GearIcon size={20} />
        </button>
      </header>

      <main style={{ flex: 1, padding: "16px 0 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {!isEmpty && <StatusBar streak={streak} active={contracts.length} max={3} />}

        {isEmpty ? (
          <EmptyState />
        ) : (
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {contracts.map((c, i) => (
              <ContractCard key={c.no} contract={c} onCheckin={(v) => handleCheckin(i, v)} />
            ))}
            <NewContractButton disabled={isFull} />
          </div>
        )}
      </main>

      {/* nav */}
      <nav
        aria-label="メインナビゲーション"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #d4c8b0",
          background: "rgba(251,246,236,0.85)",
        }}
      >
        <NavItem icon={<HomeIcon />} label="ホーム" active />
        <NavItem icon={<ShieldIcon size={22} />} label="殿堂" />
        <NavItem icon={<RankIcon size={22} />} label="ランキング" />
      </nav>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <div style={{ marginBottom: 18 }}>
        <Seal size={104} rotate={-8} />
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.1em",
          lineHeight: 1.5,
          color: "#2c1810",
        }}
      >
        まだ<ruby>誓<rt style={_rt}>ちか</rt></ruby>いはない
      </h2>
      <p
        style={{
          margin: "10px 0 28px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 14,
          color: "#6b6b6b",
          lineHeight: 1.7,
          letterSpacing: "0.04em",
          maxWidth: 280,
        }}
      >
        最初の<ruby>契約書<rt style={_rt}>けいやくしょ</rt></ruby>を結び、自分との<ruby>約束<rt style={_rt}>やくそく</rt></ruby>を刻もう。
      </p>
      <button
        style={{
          width: "100%",
          maxWidth: 320,
          height: 52,
          background: "#2c1810",
          color: "#fbf6ec",
          border: "1px solid #2c1810",
          borderRadius: 4,
          fontSize: 15,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
          letterSpacing: "0.16em",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: "0 6px 14px -8px rgba(44,24,16,0.6)",
        }}
      >
        <PlusIcon color="#fbf6ec" />
        <ruby>最初<rt style={{ ..._rt, color: "#c9a961" }}>さいしょ</rt></ruby>の<ruby>契約<rt style={{ ..._rt, color: "#c9a961" }}>けいやく</rt></ruby>を<ruby>結<rt style={{ ..._rt, color: "#c9a961" }}>むす</rt></ruby>ぶ
      </button>
      <div style={{ marginTop: 14, fontSize: 11, color: "#8b6f47", letterSpacing: "0.15em" }}>
        契約は最大3つまで保持できます
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
