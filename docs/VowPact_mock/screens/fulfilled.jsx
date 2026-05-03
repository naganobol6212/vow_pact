/* global React, StarDivider, DifficultyStars, Signature, CornerOrnament, Seal, rtStyle */

const { useState: useStep7State, useEffect: useStep7Effect } = React;

// ============================================================
// Heraldic Crest — the centerpiece earned at completion
// ============================================================

// Rarity palettes
const RARITY = {
  common: {
    label: "コモン",
    en: "COMMON",
    primary: "#7a7060",
    secondary: "#a89c84",
    glow: "rgba(168, 156, 132, 0.25)",
    badgeBg: "#e8e2d4",
    badgeText: "#5a5040",
    decorations: 0,
  },
  rare: {
    label: "レア",
    en: "RARE",
    primary: "#3a5a8c",
    secondary: "#7a9bc2",
    glow: "rgba(80, 130, 200, 0.35)",
    badgeBg: "#dde6f3",
    badgeText: "#1f3a66",
    decorations: 1,
  },
  epic: {
    label: "エピック",
    en: "EPIC",
    primary: "#6b3a8c",
    secondary: "#a877c7",
    glow: "rgba(140, 80, 180, 0.4)",
    badgeBg: "#ebdef3",
    badgeText: "#4a1f6a",
    decorations: 2,
  },
  legendary: {
    label: "レジェンダリー",
    en: "LEGENDARY",
    primary: "#a77b1f",
    secondary: "#e8c873",
    glow: "rgba(232, 200, 115, 0.55)",
    badgeBg: "#f6ecc8",
    badgeText: "#6e4d10",
    decorations: 3,
  },
};

let __crestId = 0;
function HeraldicCrest({ rarity = "epic", size = 140, animate = false }) {
  const r = RARITY[rarity];
  const uid = React.useMemo(() => `crest-${++__crestId}`, []);
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        animation: animate ? "vp7-crest 1.1s cubic-bezier(0.2, 1.4, 0.4, 1) 0.3s both" : "none",
      }}
      aria-label={`紋章（${r.label}）`}
    >
      {/* radial glow */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.35,
          background: `radial-gradient(circle, ${r.glow} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <svg width={size} height={size} viewBox="0 0 140 140" style={{ position: "relative" }}>
        <defs>
          <linearGradient id={`${uid}-shield`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={r.secondary} />
            <stop offset="100%" stopColor={r.primary} />
          </linearGradient>
          <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbf6ec" />
            <stop offset="100%" stopColor="#e8dec6" />
          </linearGradient>
          <filter id={`${uid}-rough`}>
            <feTurbulence baseFrequency="0.9" numOctaves="2" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="0.6" />
          </filter>
        </defs>

        {/* laurel left */}
        <g transform="translate(8, 60) rotate(-8)" opacity="0.8">
          <path
            d="M0 35 Q-2 25 0 18 Q-3 10 -2 0 Q3 8 5 18 Q3 28 0 35z"
            fill={r.secondary}
            opacity="0.6"
          />
          <path d="M-4 30 Q-8 25 -10 20" stroke={r.primary} strokeWidth="1" fill="none" />
          <path d="M-4 18 Q-8 14 -10 10" stroke={r.primary} strokeWidth="1" fill="none" />
        </g>
        {/* laurel right */}
        <g transform="translate(132, 60) rotate(8) scale(-1, 1)" opacity="0.8">
          <path d="M0 35 Q-2 25 0 18 Q-3 10 -2 0 Q3 8 5 18 Q3 28 0 35z" fill={r.secondary} opacity="0.6" />
          <path d="M-4 30 Q-8 25 -10 20" stroke={r.primary} strokeWidth="1" fill="none" />
          <path d="M-4 18 Q-8 14 -10 10" stroke={r.primary} strokeWidth="1" fill="none" />
        </g>

        {/* shield body */}
        <path
          d="M70 14 L108 22 L108 70 Q108 100 70 122 Q32 100 32 70 L32 22 Z"
          fill={`url(#${uid}-shield)`}
          stroke={r.primary}
          strokeWidth="1.5"
          filter={`url(#${uid}-rough)`}
        />
        {/* inner highlight */}
        <path
          d="M70 18 L104 25 L104 70 Q104 96 70 116 Q36 96 36 70 L36 25 Z"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
        />

        {/* central horizontal band */}
        <path
          d="M37 56 L103 56 L103 76 Q103 80 100 82 L70 90 L40 82 Q37 80 37 76 Z"
          fill={`url(#${uid}-band)`}
          stroke={r.primary}
          strokeWidth="1"
        />

        {/* central kanji 誓 */}
        <text
          x="70"
          y="76"
          textAnchor="middle"
          fontFamily="'Noto Serif JP', serif"
          fontSize="22"
          fontWeight="700"
          fill={r.primary}
          letterSpacing="0"
        >
          誓
        </text>

        {/* upper crown / fleur */}
        <g transform="translate(70, 28)">
          <path d="M-12 6 L-8 -2 L-4 4 L0 -6 L4 4 L8 -2 L12 6 Z" fill={r.secondary} stroke={r.primary} strokeWidth="0.8" />
          <circle cx="0" cy="-6" r="1.6" fill={r.primary} />
        </g>

        {/* lower flourish — number of stars by rarity */}
        {r.decorations > 0 && (
          <g transform="translate(70, 102)">
            {Array.from({ length: r.decorations + 1 }).map((_, i) => {
              const offset = (i - r.decorations / 2) * 8;
              return (
                <path
                  key={i}
                  d={`M${offset} -3 L${offset + 1.4} -0.6 L${offset + 4} -0.2 L${offset + 2} 1.6 L${offset + 2.6} 4.4 L${offset} 3 L${offset - 2.6} 4.4 L${offset - 2} 1.6 L${offset - 4} -0.2 L${offset - 1.4} -0.6 Z`}
                  fill={r.primary}
                />
              );
            })}
          </g>
        )}

        {/* outer ring of accent dots */}
        <g opacity="0.6">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const cx = 70 + Math.cos(angle) * 60;
            const cy = 70 + Math.sin(angle) * 60;
            return <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 1.2 : 0.6} fill={r.primary} />;
          })}
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// Achieved contract card — has the crest stamped at top center
// ============================================================

const accentBodyStyle7 = {
  fontFamily: "'Noto Serif JP', serif",
  fontSize: 15,
  lineHeight: 1.7,
  color: "#2c1810",
  borderLeft: "2px solid #8b1a1a",
  padding: "2px 0 2px 12px",
  margin: 0,
  letterSpacing: "0.02em",
};

function Section7({ label, right, children }) {
  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
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

function AchievedContractCard({ data, rarity, animate }) {
  const { no, goal, trial, difficulty, deadline, signer } = data;
  return (
    <article
      aria-label="成就した誓約契約書"
      style={{
        position: "relative",
        background: "#f4e8d0",
        border: "0.5px solid #d4c8b0",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.4) inset, 0 14px 32px -16px rgba(44,24,16,0.4), 0 2px 4px rgba(44,24,16,0.06)",
        padding: "60px 22px 24px",
        outline: "1px solid #c9a961",
        outlineOffset: "-10px",
      }}
    >
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      {/* CRESTED SEAL — top center, partially overlapping */}
      <div
        style={{
          position: "absolute",
          top: -56,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <HeraldicCrest rarity={rarity} size={140} animate={animate} />
      </div>

      <header style={{ textAlign: "center", marginTop: 20, marginBottom: 14 }}>
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
          VOW PACT &nbsp;·&nbsp; No. {no} &nbsp;·&nbsp; <span style={{ color: "#8b1a1a", fontWeight: 600 }}>FULFILLED</span>
        </p>
      </header>

      <div style={{ margin: "12px 4px 18px" }}>
        <StarDivider />
      </div>

      <Section7 label="目標">
        <p style={accentBodyStyle7}>{goal}</p>
      </Section7>

      <Section7
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
        <p style={accentBodyStyle7}>{trial}</p>
      </Section7>

      <Section7 label="期日">
        <p style={accentBodyStyle7}>
          {deadline} <span style={{ color: "#8b6f47", fontSize: 12, marginLeft: 6 }}>—— 達成</span>
        </p>
      </Section7>

      {/* signature row */}
      <div
        style={{
          marginTop: 22,
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
              borderBottom: "1px solid #2c1810",
              paddingBottom: 4,
              minHeight: 36,
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <Signature name={signer} />
          </div>
        </div>
        <div style={{ marginBottom: -4, marginRight: -2 }}>
          <Seal size={64} rotate={-8} />
        </div>
      </div>
    </article>
  );
}

// ============================================================
// Header — Joju seri
// ============================================================

function FulfilledHeader({ animate }) {
  return (
    <header style={{ textAlign: "center", padding: "32px 24px 20px" }}>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 11,
          letterSpacing: "0.6em",
          color: "#a77b1f",
          fontWeight: 600,
          paddingLeft: "0.6em",
          marginBottom: 10,
          opacity: animate ? 0 : 1,
          animation: animate ? "vp7-fade 0.6s ease-out 0.0s both" : "none",
        }}
      >
        ── FULFILLED ──
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 700,
          fontSize: "clamp(48px, 13vw, 60px)",
          letterSpacing: "0.18em",
          color: "#2c1810",
          lineHeight: 1.1,
          paddingLeft: "0.18em",
          textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          animation: animate ? "vp7-rise 0.8s cubic-bezier(0.2, 1, 0.4, 1) 0.1s both" : "none",
          background: "linear-gradient(180deg, #2c1810 0%, #4a2818 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "#2c1810",
        }}
      >
        <ruby>成就<rt style={{ fontSize: "0.32em", color: "#a77b1f", letterSpacing: "0.1em", fontWeight: 600 }}>じょうじゅ</rt></ruby>せり
      </h1>

      <div
        style={{
          margin: "16px auto 0",
          width: 140,
          height: 1,
          background: "linear-gradient(to right, transparent, #c9a961, transparent)",
        }}
      />

      <p
        style={{
          margin: "12px 0 0",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 14,
          color: "#8b6f47",
          letterSpacing: "0.15em",
          fontStyle: "italic",
          animation: animate ? "vp7-fade 0.6s ease-out 0.5s both" : "none",
        }}
      >
        あなたは試練を乗り越えた
      </p>
    </header>
  );
}

// ============================================================
// Rarity badge + record stats
// ============================================================

function RarityBadge({ rarity }) {
  const r = RARITY[rarity];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px 8px 14px",
        background: r.badgeBg,
        border: `1px solid ${r.primary}33`,
        borderRadius: 999,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: `linear-gradient(180deg, ${r.secondary}, ${r.primary})`,
          boxShadow: `0 0 8px ${r.glow}`,
        }}
      />
      <span style={{ fontSize: 9, letterSpacing: "0.45em", color: r.badgeText, fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 700, paddingLeft: "0.45em" }}>
        {r.en}
      </span>
      <span style={{ width: 1, height: 12, background: `${r.primary}44` }} />
      <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, color: r.badgeText, fontWeight: 600, letterSpacing: "0.08em" }}>
        {r.label}
      </span>
    </div>
  );
}

function RecordStats({ totalDays, keptDays }) {
  const pct = Math.round((keptDays / totalDays) * 100);
  return (
    <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 14 }}>
      <Stat label="期間" value={totalDays} unit="日" />
      <Divider />
      <Stat label="守れた日数" value={keptDays} unit="日" />
      <Divider />
      <Stat label="達成率" value={pct} unit="%" emphasize />
    </div>
  );
}

function Stat({ label, value, unit, emphasize }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#8b6f47", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.35em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: emphasize ? 28 : 22,
            fontWeight: 600,
            color: emphasize ? "#a77b1f" : "#2c1810",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 11, color: "#8b6f47", letterSpacing: "0.06em" }}>{unit}</span>
      </div>
    </div>
  );
}

function Divider() {
  return <span aria-hidden="true" style={{ width: 1, background: "rgba(201,169,97,0.35)" }} />;
}

// ============================================================
// Title (称号)
// ============================================================

function TitleBlock({ title }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 24px 4px",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#8b6f47", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.5em", marginBottom: 12 }}>
        ── BESTOWED TITLE · 授かりし称号 ──
      </div>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 700,
          fontSize: "clamp(22px, 6.4vw, 28px)",
          letterSpacing: "0.12em",
          lineHeight: 1.5,
          color: "#2c1810",
          padding: "0 16px",
        }}
      >
        「{title}」
      </h2>
    </div>
  );
}

// ============================================================
// Action buttons
// ============================================================

function XIcon({ size = 16, color = "#fbf6ec" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function HallIcon({ size = 16, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5l8-3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 8v6M9 11h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function PlusSmall({ size = 14, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ActionButtons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px" }}>
      {/* primary — share to X */}
      <button
        style={{
          height: 56,
          background: "linear-gradient(180deg, #2c1810 0%, #3a2418 100%)",
          color: "#fbf6ec",
          border: "1px solid #2c1810",
          outline: "1px solid #c9a961",
          outlineOffset: "-5px",
          borderRadius: 4,
          fontSize: 15,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
          letterSpacing: "0.18em",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          boxShadow: "0 8px 18px -10px rgba(44,24,16,0.7)",
          paddingLeft: "0.18em",
        }}
      >
        <XIcon size={16} color="#c9a961" />
        <span>
          <ruby>𝕏<rt style={{ fontSize: 0 }}> </rt></ruby> で<ruby>栄光<rt style={{ ...rtStyle, color: "#c9a961" }}>えいこう</rt></ruby>を示す
        </span>
      </button>

      {/* secondary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button
          style={{
            height: 48,
            background: "#ffffff",
            color: "#2c1810",
            border: "1px solid #d4c8b0",
            borderRadius: 4,
            fontSize: 13,
            fontFamily: "'Noto Sans JP', sans-serif",
            letterSpacing: "0.08em",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <HallIcon size={14} />
          <ruby>誓約<rt style={rtStyle}>せいやく</rt></ruby>の<ruby>殿堂<rt style={rtStyle}>でんどう</rt></ruby>
        </button>
        <button
          style={{
            height: 48,
            background: "#ffffff",
            color: "#2c1810",
            border: "1px solid #d4c8b0",
            borderRadius: 4,
            fontSize: 13,
            fontFamily: "'Noto Sans JP', sans-serif",
            letterSpacing: "0.08em",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <PlusSmall />
          新しい<ruby>契約<rt style={rtStyle}>けいやく</rt></ruby>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Confetti / sparkles overlay
// ============================================================

function Sparkles({ count = 14, animate }) {
  const positions = React.useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: 8 + ((i * 73) % 90),
        y: 12 + ((i * 47) % 60),
        size: 3 + (i % 3),
        delay: 0.3 + (i % 7) * 0.15,
      })),
    [count]
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
      {positions.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "#c9a961",
            borderRadius: "50%",
            boxShadow: "0 0 6px #c9a961cc",
            opacity: animate ? 0 : 0.8,
            animation: animate ? `vp7-sparkle 1.6s ease-out ${p.delay}s both` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Screen
// ============================================================

const FULFILLED_DATA = {
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
  deadline: "2026年 8月 2日",
  signer: "Yuto",
};

const TITLES = {
  common: "誓いを守りし者",
  rare: "鍛錬を続けし者",
  epic: "異邦の言葉を求めし者",
  legendary: "鋼の意志を持ちし者",
};

function FulfilledScreen({ width = 412, rarity = "epic", animate = false, totalDays = 90, keptDays = 85 }) {
  return (
    <div
      style={{
        width,
        minHeight: 1200,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 65%, #e8dcc0 100%)",
        boxSizing: "border-box",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Sparkles animate={animate} />

      <FulfilledHeader animate={animate} />

      {/* contract + crest */}
      <div style={{ padding: "36px 16px 8px" }}>
        <AchievedContractCard data={FULFILLED_DATA} rarity={rarity} animate={animate} />
      </div>

      {/* rarity + record */}
      <div style={{ padding: "22px 20px 6px", textAlign: "center" }}>
        <RarityBadge rarity={rarity} />
        <RecordStats totalDays={totalDays} keptDays={keptDays} />
      </div>

      {/* title */}
      <TitleBlock title={TITLES[rarity]} />

      <div style={{ height: 18 }} />

      <ActionButtons />

      <div style={{ height: 32 }} />
    </div>
  );
}

if (typeof document !== "undefined" && !document.getElementById("vp7-style")) {
  const s = document.createElement("style");
  s.id = "vp7-style";
  s.textContent = `
    @keyframes vp7-crest {
      0% { transform: scale(2.6) rotate(-22deg); opacity: 0; }
      45% { transform: scale(1.25) rotate(-6deg); opacity: 1; }
      75% { transform: scale(0.94) rotate(-2deg); }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }
    @keyframes vp7-rise {
      0% { transform: translateY(18px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    @keyframes vp7-fade {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes vp7-sparkle {
      0% { opacity: 0; transform: scale(0.4); }
      30% { opacity: 1; transform: scale(1.6); }
      100% { opacity: 0; transform: scale(0.6) translateY(-12px); }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { FulfilledScreen, HeraldicCrest, RARITY });
