/* global React, ContractCard, Seal, rtStyle */

const { useState: useDetailState } = React;

// ============================================================
// icons
// ============================================================
function ChkOk({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7l3 3 5-6" stroke="#2f7d3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChkBad({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 4l6 6M10 4l-6 6" stroke="#8b1a1a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ChkSkip({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8" stroke="#8b6f47" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function BackArrowD({ size = 14, color = "#8b6f47" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 3L4 7l5 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PencilD({ size = 14, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 13L4 10l7-7 3 3-7 7-3 1z M10 4l3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShareD({ size = 13, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2 L14 14 M14 2 L2 14" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================
// status badge with seal stamped on the contract
// ============================================================
function DaysLeftBanner({ days }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: "rgba(255,255,255,0.55)",
        border: "1px solid #c9a961",
        outline: "1px solid #c9a96155",
        outlineOffset: "-4px",
        padding: "12px 16px",
        margin: "0 0 18px",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: "#a77b1f",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.4em",
            marginBottom: 4,
          }}
        >
          DAYS REMAINING
        </div>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 12, color: "#2c1810", letterSpacing: "0.06em" }}>
          期日まで
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: 44,
            fontWeight: 700,
            color: "#8b1a1a",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          {days}
        </span>
        <span style={{ fontSize: 14, color: "#8b6f47", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.1em" }}>日</span>
      </div>
    </div>
  );
}

// ============================================================
// stats (sub-header)
// ============================================================
function StatsRow({ keptPct, streak, daysLeft }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 6,
        background: "rgba(255,255,255,0.55)",
        border: "1px solid #d4c8b0",
        padding: "12px 8px",
        marginBottom: 18,
      }}
    >
      <StatCell en="KEPT" jp="達成率" value={keptPct} unit="%" emphasize />
      <Divider />
      <StatCell en="STREAK" jp="連続" value={streak} unit="日" />
      <Divider />
      <StatCell en="LEFT" jp="残り" value={daysLeft} unit="日" />
    </div>
  );
}
function StatCell({ en, jp, value, unit, emphasize }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 8,
          letterSpacing: "0.35em",
          color: "#8b6f47",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 600,
          paddingLeft: "0.35em",
          marginBottom: 3,
        }}
      >
        {en}
      </div>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: emphasize ? 24 : 20,
            fontWeight: 600,
            color: emphasize ? "#a77b1f" : "#2c1810",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 10, color: "#8b6f47" }}>{unit}</span>
      </div>
      <div style={{ fontSize: 9, color: "#8b6f47", letterSpacing: "0.18em", marginTop: 3 }}>{jp}</div>
    </div>
  );
}
function Divider() {
  return <span aria-hidden="true" style={{ background: "rgba(201,169,97,0.35)", width: 1, alignSelf: "stretch" }} />;
}

// ============================================================
// check-in history (calendar dot grid + list)
// ============================================================

const HISTORY = [
  // newest first; 10 days
  { d: "10/30", status: "ok" },
  { d: "10/29", status: "ok" },
  { d: "10/28", status: "ok" },
  { d: "10/27", status: "ok" },
  { d: "10/26", status: "ok" },
  { d: "10/25", status: "skip" },
  { d: "10/24", status: "bad" },
  { d: "10/23", status: "ok" },
  { d: "10/22", status: "ok" },
  { d: "10/21", status: "bad" },
];

const STATUS = {
  ok: { label: "守れた", icon: <ChkOk />, color: "#2f7d3a", bg: "rgba(47,125,58,0.1)", border: "#2f7d3a" },
  bad: { label: "守れなかった", icon: <ChkBad />, color: "#8b1a1a", bg: "rgba(139,26,26,0.08)", border: "#8b1a1a" },
  skip: { label: "スキップ", icon: <ChkSkip />, color: "#8b6f47", bg: "rgba(139,111,71,0.08)", border: "#8b6f47" },
  none: { label: "未記録", icon: null, color: "#a89c84", bg: "transparent", border: "#d4c8b0" },
};

function HistoryGrid({ history }) {
  // 30 cells: first 20 unrecorded, last 10 actual data (oldest -> newest)
  const cells = [];
  for (let i = 0; i < 20; i++) cells.push({ status: "none", d: null });
  for (let i = history.length - 1; i >= 0; i--) cells.push(history[i]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: 4, marginBottom: 14 }}>
      {cells.map((c, i) => {
        const s = STATUS[c.status];
        return (
          <span
            key={i}
            title={c.d ? `${c.d} ${s.label}` : "未記録"}
            style={{
              width: "100%",
              aspectRatio: "1",
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {c.status === "ok" && <ChkOk size={9} />}
            {c.status === "bad" && <ChkBad size={9} />}
            {c.status === "skip" && <ChkSkip size={9} />}
          </span>
        );
      })}
    </div>
  );
}

function HistoryLegend() {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "0 2px 6px" }}>
      {[
        ["ok", "守れた"],
        ["bad", "守れなかった"],
        ["skip", "スキップ"],
        ["none", "未記録"],
      ].map(([k, label]) => {
        const s = STATUS[k];
        return (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#8b6f47", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.04em" }}>
            <span
              style={{
                width: 12, height: 12,
                background: s.bg,
                border: `1px solid ${s.border}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: 1,
              }}
            >
              {k === "ok" && <ChkOk size={8} />}
              {k === "bad" && <ChkBad size={8} />}
              {k === "skip" && <ChkSkip size={8} />}
            </span>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function HistoryList({ history }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.55)", border: "1px solid #d4c8b0" }}>
      {history.slice(0, 7).map((h, i) => {
        const s = STATUS[h.status];
        return (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px",
              borderBottom: i < 6 ? "1px solid rgba(212,200,176,0.5)" : "none",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 22, height: 22, borderRadius: "50%",
                background: s.bg, border: `1px solid ${s.border}`,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </span>
            <span style={{ flex: 1, fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontSize: 14, fontWeight: 600, color: "#2c1810", letterSpacing: "0.04em" }}>
              {h.d}
            </span>
            <span style={{ fontSize: 11, color: s.color, fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.06em", fontWeight: 600 }}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// abandon confirm modal
// ============================================================
function AbandonModal({ onCancel, onConfirm }) {
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
        <div
          style={{
            fontSize: 9, letterSpacing: "0.4em",
            color: "#8b1a1a",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 700,
            paddingLeft: "0.4em",
            marginBottom: 10,
          }}
        >
          ── ABANDON PACT ──
        </div>
        <h3
          style={{
            margin: "0 0 12px",
            fontFamily: "'Noto Serif JP', serif",
            fontSize: 20, fontWeight: 700,
            color: "#2c1810",
            letterSpacing: "0.08em",
            lineHeight: 1.4,
          }}
        >
          契約を破棄しますか？
        </h3>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            color: "#2c1810",
            lineHeight: 1.8,
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "0.04em",
          }}
        >
          破棄した契約は殿堂に
          <strong style={{ color: "#8b1a1a" }}>「破棄した契約」</strong>
          として記録されます。
        </p>
        <div
          style={{
            padding: "8px 12px",
            background: "rgba(139,26,26,0.06)",
            borderLeft: "3px solid #8b1a1a",
            fontSize: 11,
            color: "#8b1a1a",
            fontFamily: "'Noto Serif JP', serif",
            letterSpacing: "0.04em",
            lineHeight: 1.7,
            marginBottom: 18,
          }}
        >
          ⚠ この操作は取り消せません。
        </div>
        <div style={{ display: "flex", gap: 10 }}>
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
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px 12px",
              background: "#8b1a1a", color: "#fbf6ec",
              border: "1px solid #8b1a1a", borderRadius: 2,
              fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.14em", cursor: "pointer",
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
// action buttons
// ============================================================
function PrimaryD({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "14px 16px",
        background: "#8b1a1a", color: "#fbf6ec",
        border: "1px solid #8b1a1a", borderRadius: 2,
        fontFamily: "'Noto Serif JP', serif", fontSize: 14, fontWeight: 700,
        letterSpacing: "0.2em", cursor: "pointer",
        boxShadow: "0 8px 18px -10px rgba(139,26,26,0.6)",
      }}
    >
      {children}
    </button>
  );
}
function SecondaryD({ children, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "12px 14px",
        background: "rgba(255,255,255,0.85)", color: "#2c1810",
        border: "1px solid #2c1810", borderRadius: 2,
        fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 600,
        letterSpacing: "0.14em", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// ============================================================
// section header (compact)
// ============================================================
function SecHead({ jp, en }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
      <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 700, color: "#2c1810", letterSpacing: "0.16em" }}>{jp}</span>
      <span style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontSize: 9, letterSpacing: "0.4em", color: "#a77b1f", fontWeight: 600, paddingLeft: "0.4em" }}>{en}</span>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, #c9a96155, transparent)", marginBottom: 2 }} />
    </div>
  );
}

// ============================================================
// detail screen
// ============================================================
function DetailScreen({ width = 412, mode = "default" }) {
  const [confirm, setConfirm] = useDetailState(mode === "abandon");
  const checkedInToday = mode === "checked-in";

  const data = {
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
    deadline: "2026年 8月 2日 まで",
    signer: "Yuto",
  };

  return (
    <div
      style={{
        width,
        minHeight: 1500,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      {/* status spacer */}
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
          aria-label="ホームに戻る"
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
          <BackArrowD />
          ホームに戻る
        </button>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: 11,
            letterSpacing: "0.45em",
            color: "#8b6f47",
            fontWeight: 600,
            paddingLeft: "0.45em",
            whiteSpace: "nowrap",
          }}
        >
          PACT &nbsp;·&nbsp; No. {data.no}
        </div>
        <span />
      </header>

      <main style={{ padding: "20px 20px 24px" }}>
        <DaysLeftBanner days={73} />

        <StatsRow keptPct={78} streak={5} daysLeft={73} />

        {/* contract — with seal stamped */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          <ContractCard data={data} />
          <div
            style={{
              position: "absolute",
              top: 36,
              right: 28,
              transform: "rotate(-8deg)",
              filter: "drop-shadow(0 2px 4px rgba(139,26,26,0.25))",
              pointerEvents: "none",
            }}
          >
            <Seal size={84} rotate={0} />
          </div>
        </div>

        {/* check-in history */}
        <section style={{ marginBottom: 28 }}>
          <SecHead jp="チェックイン履歴" en="CHECK-IN HISTORY" />

          <div
            style={{
              padding: "14px 12px 10px",
              background: "rgba(255,255,255,0.5)",
              border: "1px solid #d4c8b0",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                padding: "0 4px",
              }}
            >
              <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.15em", fontFamily: "'Noto Serif JP', serif" }}>
                直近 30 日
              </span>
              <span style={{ fontSize: 9, color: "#a77b1f", letterSpacing: "0.3em", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.3em" }}>
                LAST 30 DAYS
              </span>
            </div>
            <HistoryGrid history={HISTORY} />
            <HistoryLegend />
          </div>

          <div style={{ marginBottom: 6, fontSize: 11, color: "#8b6f47", letterSpacing: "0.06em", paddingLeft: 4, fontFamily: "'Noto Serif JP', serif" }}>
            最近の記録
          </div>
          <HistoryList history={HISTORY} />

          {/* gentle encouragement */}
          <p
            style={{
              margin: "12px 4px 0",
              fontSize: 11,
              color: "#8b6f47",
              fontFamily: "'Noto Serif JP', serif",
              letterSpacing: "0.04em",
              lineHeight: 1.7,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            一日守れぬ日があっても、誓いそのものは折れぬ。
          </p>
        </section>

        {/* actions */}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!checkedInToday && (
            <PrimaryD>今日のチェックイン</PrimaryD>
          )}
          {checkedInToday && (
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(47,125,58,0.08)",
                border: "1px solid #2f7d3a",
                borderLeft: "3px solid #2f7d3a",
                fontSize: 12,
                color: "#2f7d3a",
                fontFamily: "'Noto Serif JP', serif",
                letterSpacing: "0.06em",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              ✓ 今日のチェックインは完了しています
            </div>
          )}
          <SecondaryD icon={<PencilD />}>契約書を編集する</SecondaryD>
          <SecondaryD icon={<span style={{ fontFamily: "'Noto Serif JP', serif', sans-serif", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>𝕏</span>}>
            経過を共有する
          </SecondaryD>

          <div style={{ marginTop: 10, textAlign: "center" }}>
            <button
              onClick={() => setConfirm(true)}
              style={{
                background: "transparent", border: "none",
                padding: "10px 14px",
                color: "#8b1a1a",
                fontFamily: "'Noto Serif JP', serif", fontSize: 12,
                letterSpacing: "0.12em", cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                textDecorationColor: "#8b1a1a55",
                textDecorationThickness: 1,
              }}
            >
              契約を破棄する
            </button>
          </div>
        </section>
      </main>

      {confirm && (
        <AbandonModal
          onCancel={() => setConfirm(false)}
          onConfirm={() => setConfirm(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { DetailScreen });
