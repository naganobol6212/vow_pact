/* global React, HeraldicCrest, RARITY */

const { useState: useRankState } = React;

// ============================================================
// icons (reuse-pattern)
// ============================================================
function GearIconR({ size = 20, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke={color} strokeWidth="1.4" />
      <path d="M19.4 13.6a7.6 7.6 0 000-3.2l1.9-1.5-2-3.4-2.3.8a7.7 7.7 0 00-2.7-1.6L13.7 2h-3.4l-.6 2.7a7.7 7.7 0 00-2.7 1.6l-2.3-.8-2 3.4 1.9 1.5a7.6 7.6 0 000 3.2l-1.9 1.5 2 3.4 2.3-.8a7.7 7.7 0 002.7 1.6l.6 2.7h3.4l.6-2.7a7.7 7.7 0 002.7-1.6l2.3.8 2-3.4-1.9-1.5z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function HomeIconR({ size = 22, color = "#6b6b6b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIconR({ size = 22, color = "#6b6b6b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5l8-3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 8v6M9 11h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function RankIconR({ size = 22, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19l9-9M19 19l-9-9M14 4l6 6M10 4L4 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="4" r="1" fill={color} />
      <circle cx="10" cy="4" r="1" fill={color} />
    </svg>
  );
}
function LockIconR({ size = 12, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.5" stroke={color} strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
function ArrowUpIconR({ size = 10, color = "#2f7d3a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 11V3M3 7l4-4 4 4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowDownIconR({ size = 10, color = "#a8651e" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 3v8M3 7l4 4 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================
// header
// ============================================================
function RankHeader({ period, onPeriod }) {
  return (
    <header
      style={{
        textAlign: "center",
        padding: "26px 20px 0",
        background: "linear-gradient(180deg, rgba(201,169,97,0.10) 0%, transparent 100%)",
      }}
    >
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 10,
          letterSpacing: "0.6em",
          color: "#a77b1f",
          fontWeight: 600,
          paddingLeft: "0.6em",
          marginBottom: 10,
        }}
      >
        ── LEADERBOARD ──
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "0.16em",
          color: "#2c1810",
          paddingLeft: "0.16em",
          lineHeight: 1.2,
        }}
      >
        ランキング
      </h1>
      <div style={{ margin: "12px auto 14px", width: 110, height: 1, background: "linear-gradient(to right, transparent, #c9a961, transparent)" }} />

      {/* period tabs */}
      <div style={{ display: "inline-flex", borderBottom: "1px solid #d4c8b0" }}>
        {[{ id: "month", label: "今月" }, { id: "all", label: "累計" }].map((p) => {
          const active = period === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPeriod(p.id)}
              style={{
                padding: "10px 28px 12px",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #8b1a1a" : "2px solid transparent",
                color: active ? "#2c1810" : "#8b6f47",
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                letterSpacing: "0.12em",
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

// ============================================================
// type segment
// ============================================================
function TypeSegment({ type, onType }) {
  return (
    <div style={{ padding: "16px 20px 12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "rgba(255,255,255,0.6)",
          border: "1px solid #d4c8b0",
          borderRadius: 4,
          padding: 3,
        }}
      >
        {[
          { id: "achievements", label: "達成数", en: "ACHIEVEMENTS" },
          { id: "score", label: "レアリティスコア", en: "RARITY SCORE" },
        ].map((t) => {
          const active = type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onType(t.id)}
              style={{
                padding: "9px 8px 10px",
                background: active ? "#2c1810" : "transparent",
                border: "none",
                borderRadius: 3,
                color: active ? "#fbf6ec" : "#8b6f47",
                fontFamily: "'Noto Serif JP', serif",
                fontWeight: active ? 600 : 500,
                fontSize: 12,
                letterSpacing: "0.08em",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span>{t.label}</span>
              <span style={{ fontSize: 8, letterSpacing: "0.3em", opacity: 0.7, fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600 }}>
                {t.en}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// podium (top 3)
// ============================================================

const MEDAL = {
  1: { primary: "#c9a961", dark: "#8b6f1f", light: "#fff8de", glow: "rgba(201,169,97,0.45)", label: "GOLD" },
  2: { primary: "#a8a8a8", dark: "#6b6b6b", light: "#f4f4f4", glow: "rgba(168,168,168,0.4)", label: "SILVER" },
  3: { primary: "#c98a4b", dark: "#7e5a35", light: "#fbeede", glow: "rgba(201,138,75,0.4)", label: "BRONZE" },
};

function MedalNumeral({ rank, size = 56 }) {
  const m = MEDAL[rank];
  const numerals = { 1: "Ⅰ", 2: "Ⅱ", 3: "Ⅲ" };
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={`${rank}位`}
    >
      {/* ribbons left/right */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -2,
          top: "50%",
          width: 6,
          height: size + 16,
          background: `linear-gradient(180deg, ${m.primary}, ${m.dark})`,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
          transform: "translateY(-50%) rotate(-12deg)",
          opacity: 0.85,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: -2,
          top: "50%",
          width: 6,
          height: size + 16,
          background: `linear-gradient(180deg, ${m.primary}, ${m.dark})`,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)",
          transform: "translateY(-50%) rotate(12deg)",
          opacity: 0.85,
        }}
      />
      {/* coin */}
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${m.light} 0%, ${m.primary} 55%, ${m.dark} 100%)`,
          border: `1.5px solid ${m.dark}`,
          boxShadow: `0 4px 14px -4px ${m.glow}, inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -2px 3px rgba(0,0,0,0.18)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 700,
          fontSize: size * 0.5,
          color: m.dark,
          letterSpacing: "0.02em",
          textShadow: "0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        {numerals[rank]}
      </span>
    </div>
  );
}

function PodiumRow({ entry, type }) {
  const m = MEDAL[entry.rank];
  const big = entry.rank === 1;
  const value = type === "score" ? entry.score : entry.achievements;
  const unit = type === "score" ? "pt" : "件";
  return (
    <article
      style={{
        position: "relative",
        background: `linear-gradient(135deg, ${m.light} 0%, #fbf6ec 60%)`,
        border: `1px solid ${m.primary}`,
        outline: `1px solid ${m.primary}40`,
        outlineOffset: -5,
        padding: big ? "16px 16px 16px 14px" : "13px 14px 13px 12px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: big
          ? `0 10px 24px -16px ${m.glow}, 0 2px 4px rgba(44,24,16,0.08)`
          : `0 6px 16px -12px ${m.glow}, 0 1px 2px rgba(44,24,16,0.06)`,
      }}
    >
      <MedalNumeral rank={entry.rank} size={big ? 60 : 48} />

      {/* identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: big ? 18 : 16,
              fontWeight: 700,
              color: "#2c1810",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.name}
          </span>
          {entry.isMe && <MeBadge />}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              fontSize: big ? 30 : 26,
              fontWeight: 700,
              color: m.dark,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          <span style={{ fontSize: 11, color: "#8b6f47", letterSpacing: "0.06em" }}>{unit}</span>
          {entry.delta !== undefined && <DeltaPill delta={entry.delta} />}
        </div>
      </div>

      {/* recent crest */}
      <div
        style={{
          flexShrink: 0,
          padding: 4,
          background: "rgba(255,255,255,0.6)",
          border: `1px solid ${m.primary}55`,
          borderRadius: 2,
        }}
        title={`直近: ${RARITY[entry.recent].label}`}
      >
        <HeraldicCrest rarity={entry.recent} size={big ? 56 : 48} />
      </div>
    </article>
  );
}

function DeltaPill({ delta }) {
  if (delta === 0) {
    return (
      <span style={{ marginLeft: 6, fontSize: 10, color: "#8b6f47", letterSpacing: "0.1em" }}>
        ─
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      style={{
        marginLeft: 6,
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 10,
        color: up ? "#2f7d3a" : "#a8651e",
        fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      {up ? <ArrowUpIconR /> : <ArrowDownIconR />}
      {Math.abs(delta)}
    </span>
  );
}

function MeBadge() {
  return (
    <span
      style={{
        fontSize: 9,
        letterSpacing: "0.3em",
        background: "#8b1a1a",
        color: "#fbf6ec",
        padding: "2px 6px 2px 8px",
        borderRadius: 2,
        fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
        fontWeight: 700,
      }}
    >
      YOU
    </span>
  );
}

// ============================================================
// regular row (4-10)
// ============================================================
function RankRow({ entry, type, highlight }) {
  const value = type === "score" ? entry.score : entry.achievements;
  const unit = type === "score" ? "pt" : "件";
  const bg = highlight ? "rgba(139,26,26,0.06)" : "transparent";
  const border = highlight ? "1px solid #8b1a1a" : "1px solid transparent";
  return (
    <article
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        background: bg,
        border,
        borderLeft: highlight ? "3px solid #8b1a1a" : "3px solid transparent",
        position: "relative",
      }}
    >
      <span
        style={{
          width: 32,
          textAlign: "center",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 22,
          fontWeight: 600,
          color: highlight ? "#8b1a1a" : "#8b6f47",
          letterSpacing: "0.02em",
          flexShrink: 0,
        }}
      >
        {entry.rank}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 14,
              fontWeight: highlight ? 700 : 500,
              color: "#2c1810",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entry.name}
          </span>
          {entry.isMe && <MeBadge />}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#2c1810",
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.06em" }}>{unit}</span>
          {entry.delta !== undefined && <DeltaPill delta={entry.delta} />}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: 3,
          background: "rgba(255,255,255,0.6)",
          border: "1px solid #d4c8b0",
          borderRadius: 2,
        }}
        title={`直近: ${RARITY[entry.recent].label}`}
      >
        <HeraldicCrest rarity={entry.recent} size={36} />
      </div>
    </article>
  );
}

function RowDivider() {
  return <div style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(212,200,176,0.7) 20%, rgba(212,200,176,0.7) 80%, transparent)" }} />;
}

// ============================================================
// privacy section
// ============================================================
function PrivacySection({ visible, anonymous, onVisible, onAnonymous }) {
  return (
    <section
      aria-label="公開設定"
      style={{
        margin: "24px 20px 16px",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.55)",
        border: "1px dashed #d4c8b0",
        borderRadius: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <LockIconR />
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "#8b6f47",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.3em",
          }}
        >
          PRIVACY · 公開設定
        </span>
      </div>

      <ToggleRow
        label="ランキングに自分を表示する"
        sub="OFF にすると順位は計算されない"
        checked={visible}
        onChange={onVisible}
      />
      <div style={{ height: 1, background: "rgba(212,200,176,0.5)", margin: "12px 0" }} />
      <ToggleRow
        label="匿名で表示する"
        sub="ニックネームの代わりに「匿名の挑戦者」と表示"
        checked={anonymous}
        disabled={!visible}
        onChange={onAnonymous}
      />
    </section>
  );
}

function ToggleRow({ label, sub, checked, disabled, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: disabled ? 0.45 : 1 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 600, color: "#2c1810", letterSpacing: "0.04em" }}>{label}</div>
        <div style={{ fontSize: 11, color: "#8b6f47", marginTop: 2, letterSpacing: "0.04em" }}>{sub}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          background: checked ? "#2c1810" : "#d4c8b0",
          border: `1px solid ${checked ? "#2c1810" : "#b3a890"}`,
          position: "relative",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: 0,
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: checked ? "#fbf6ec" : "#fff",
            boxShadow: "0 1px 2px rgba(44,24,16,0.25)",
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}

// ============================================================
// nav (re-defined to avoid scope leaks)
// ============================================================
function NavItemR({ icon, label, active }) {
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

// ============================================================
// data
// ============================================================
// 今月 / 達成数
const MONTHLY_ACH = [
  { rank: 1, name: "玄武", achievements: 12, score: 1240, recent: "legendary", delta: 2 },
  { rank: 2, name: "朱雀", achievements: 10, score: 980, recent: "epic", delta: -1 },
  { rank: 3, name: "白虎", achievements: 9, score: 920, recent: "epic", delta: 1 },
  { rank: 4, name: "青龍", achievements: 8, score: 760, recent: "rare", delta: 0 },
  { rank: 5, name: "麒麟", achievements: 7, score: 880, recent: "epic", delta: 3 },
  { rank: 6, name: "鳳凰", achievements: 6, score: 540, recent: "rare", delta: -2 },
  { rank: 7, name: "天狗", achievements: 6, score: 480, recent: "rare", delta: 1 },
  { rank: 8, name: "Yuto", achievements: 5, score: 510, recent: "epic", delta: 4, isMe: true },
  { rank: 9, name: "river_42", achievements: 5, score: 420, recent: "rare", delta: 0 },
  { rank: 10, name: "kintsugi", achievements: 4, score: 380, recent: "common", delta: -3 },
];

// 累計 / レアリティスコア — user out of top 10
const ALL_SCORE = [
  { rank: 1, name: "玄武", achievements: 86, score: 12480, recent: "legendary", delta: 0 },
  { rank: 2, name: "白虎", achievements: 74, score: 10920, recent: "legendary", delta: 1 },
  { rank: 3, name: "朱雀", achievements: 71, score: 10560, recent: "epic", delta: -1 },
  { rank: 4, name: "麒麟", achievements: 64, score: 9810, recent: "epic", delta: 2 },
  { rank: 5, name: "青龍", achievements: 62, score: 8930, recent: "epic", delta: 0 },
  { rank: 6, name: "鳳凰", achievements: 55, score: 7820, recent: "rare", delta: 0 },
  { rank: 7, name: "天狗", achievements: 49, score: 6740, recent: "rare", delta: 1 },
  { rank: 8, name: "yamabushi", achievements: 47, score: 6210, recent: "rare", delta: -1 },
  { rank: 9, name: "kintsugi", achievements: 43, score: 5830, recent: "rare", delta: 0 },
  { rank: 10, name: "river_42", achievements: 41, score: 5440, recent: "rare", delta: 2 },
];
const ME_OUT = { rank: 23, name: "Yuto", achievements: 18, score: 1860, recent: "epic", delta: 5, isMe: true };

// ============================================================
// screen
// ============================================================
function RankScreen({ width = 412, initialPeriod = "month", initialType = "achievements", initialMode = "default" }) {
  const [period, setPeriod] = useRankState(initialPeriod);
  const [type, setType] = useRankState(initialType);
  const [visible, setVisible] = useRankState(initialMode !== "hidden");
  const [anonymous, setAnonymous] = useRankState(false);

  // pick dataset
  const list = period === "all" || type === "score" ? ALL_SCORE : MONTHLY_ACH;
  const userInList = list.find((e) => e.isMe);
  const top3 = list.slice(0, 3);
  const rest = list.slice(3, 10);

  return (
    <div
      style={{
        width,
        minHeight: 1320,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.55em",
            color: "#8b6f47",
            paddingLeft: "0.55em",
          }}
        >
          VOW PACT
        </div>
        <button aria-label="設定" style={{ background: "transparent", border: "none", padding: 6, cursor: "pointer", display: "inline-flex" }}>
          <GearIconR size={20} color="#8b6f47" />
        </button>
      </div>

      <RankHeader period={period} onPeriod={setPeriod} />
      <TypeSegment type={type} onType={setType} />

      {!visible ? (
        <PrivateOverlay onShow={() => setVisible(true)} />
      ) : (
        <>
          {/* podium */}
          <section aria-label="トップ3" style={{ padding: "8px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {top3.map((e) => (
              <PodiumRow key={e.rank} entry={e} type={type} />
            ))}
          </section>

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 20px 6px" }}>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9a96155 50%, transparent)" }} />
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.4em",
                color: "#8b6f47",
                fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
                fontWeight: 600,
                paddingLeft: "0.4em",
              }}
            >
              ── RANK 4 – 10 ──
            </span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9a96155 50%, transparent)" }} />
          </div>

          {/* rest */}
          <section style={{ margin: "0 20px", border: "1px solid #d4c8b0", background: "rgba(255,255,255,0.45)" }}>
            {rest.map((e, i) => (
              <React.Fragment key={e.rank}>
                <RankRow entry={e} type={type} highlight={!!e.isMe} />
                {i < rest.length - 1 && <RowDivider />}
              </React.Fragment>
            ))}
          </section>

          {/* user out of top 10 */}
          {!userInList && (
            <section style={{ margin: "16px 20px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 4px 10px",
                }}
              >
                <span style={{ flex: 1, height: 1, borderTop: "1px dashed #c9a961" }} />
                <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.3em", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600 }}>
                  ⋯
                </span>
                <span style={{ flex: 1, height: 1, borderTop: "1px dashed #c9a961" }} />
              </div>
              <div
                style={{
                  border: "1px solid #8b1a1a",
                  background: "rgba(139,26,26,0.06)",
                  borderLeft: "3px solid #8b1a1a",
                }}
              >
                <RankRow entry={ME_OUT} type={type} highlight />
              </div>
              <p
                style={{
                  margin: "10px 14px 0",
                  fontSize: 11,
                  color: "#8b6f47",
                  fontFamily: "'Noto Serif JP', serif",
                  letterSpacing: "0.05em",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                10位まであと <strong style={{ color: "#8b1a1a", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontSize: 14 }}>3,580</strong> pt。次の契約で殿堂入りを。
              </p>
            </section>
          )}
        </>
      )}

      <PrivacySection
        visible={visible}
        anonymous={anonymous}
        onVisible={setVisible}
        onAnonymous={setAnonymous}
      />

      {/* footer note */}
      <p
        style={{
          margin: "0 20px 18px",
          fontSize: 10,
          color: "#8b6f47",
          textAlign: "center",
          letterSpacing: "0.06em",
          lineHeight: 1.7,
          fontStyle: "italic",
          fontFamily: "'Noto Serif JP', serif",
        }}
      >
        ランキングは毎日 0:00（JST）に更新されます。
      </p>

      {/* nav */}
      <nav
        aria-label="メインナビゲーション"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #d4c8b0",
          background: "rgba(251,246,236,0.85)",
          marginTop: "auto",
        }}
      >
        <NavItemR icon={<HomeIconR />} label="ホーム" />
        <NavItemR icon={<ShieldIconR size={22} />} label="殿堂" />
        <NavItemR icon={<RankIconR size={22} />} label="ランキング" active />
      </nav>
    </div>
  );
}

function PrivateOverlay({ onShow }) {
  return (
    <section
      style={{
        margin: "8px 20px 0",
        padding: "40px 24px",
        textAlign: "center",
        background: "rgba(255,255,255,0.5)",
        border: "1px dashed #b3a890",
      }}
    >
      <div style={{ marginBottom: 14, opacity: 0.55, display: "flex", justifyContent: "center" }}>
        <LockIconR size={28} color="#8b6f47" />
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: "#2c1810",
        }}
      >
        ランキングは非公開
      </h3>
      <p
        style={{
          margin: "8px 0 18px",
          fontSize: 12,
          color: "#8b6f47",
          lineHeight: 1.7,
          letterSpacing: "0.04em",
          fontFamily: "'Noto Serif JP', serif",
        }}
      >
        公開設定をオンにすると
        <br />
        他の挑戦者と順位を競えます。
      </p>
      <button
        onClick={onShow}
        style={{
          padding: "10px 22px",
          background: "#2c1810",
          color: "#fbf6ec",
          border: "1px solid #2c1810",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
          letterSpacing: "0.14em",
          cursor: "pointer",
        }}
      >
        参加する
      </button>
    </section>
  );
}

Object.assign(window, { RankScreen });
