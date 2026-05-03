/* global React, HeraldicCrest, RARITY, rtStyle */

const { useState: useHallState } = React;

// ============================================================
// icons
// ============================================================
function ArrowIcon8({ dir = "down", size = 12, color = "#2c1810" }) {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ transform: `rotate(${rot}deg)` }} fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FlameIcon8({ size = 14, color = "#c9a961" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22c-4.5 0-7-3-7-7 0-3 2-5.5 3-7 0 1.5 1 2.5 2 2.5 0-3 1.5-6 5-8.5-1 4 4 6 4 11 0 5-2.5 9-7 9z" fill={color} stroke="#8b6f47" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}
function HomeIcon8({ size = 22, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldIcon8({ size = 22, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5l8 3v6.5c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V5.5l8-3z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 8v6M9 11h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function RankIcon8({ size = 22, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19l9-9M19 19l-9-9M14 4l6 6M10 4L4 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="4" r="1" fill={color} />
      <circle cx="10" cy="4" r="1" fill={color} />
    </svg>
  );
}
function GearIcon8({ size = 20, color = "#2c1810" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke={color} strokeWidth="1.4" />
      <path d="M19.4 13.6a7.6 7.6 0 000-3.2l1.9-1.5-2-3.4-2.3.8a7.7 7.7 0 00-2.7-1.6L13.7 2h-3.4l-.6 2.7a7.7 7.7 0 00-2.7 1.6l-2.3-.8-2 3.4 1.9 1.5a7.6 7.6 0 000 3.2l-1.9 1.5 2 3.4 2.3-.8a7.7 7.7 0 002.7 1.6l.6 2.7h3.4l.6-2.7a7.7 7.7 0 002.7-1.6l2.3.8 2-3.4-1.9-1.5z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================
// header
// ============================================================
function HallHeader() {
  return (
    <header
      style={{
        textAlign: "center",
        padding: "26px 20px 22px",
        background: "linear-gradient(180deg, rgba(201,169,97,0.10) 0%, transparent 100%)",
        borderBottom: "1px solid #d4c8b0",
        position: "relative",
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
        ── HALL OF VOWS ──
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 7.6vw, 34px)",
          letterSpacing: "0.16em",
          color: "#2c1810",
          paddingLeft: "0.16em",
          lineHeight: 1.2,
        }}
      >
        <ruby>誓約<rt style={{ fontSize: "0.32em", color: "#a77b1f", letterSpacing: "0.1em", fontWeight: 600 }}>せいやく</rt></ruby>の<ruby>殿堂<rt style={{ fontSize: "0.32em", color: "#a77b1f", letterSpacing: "0.1em", fontWeight: 600 }}>でんどう</rt></ruby>
      </h1>
      <div style={{ margin: "12px auto 0", width: 110, height: 1, background: "linear-gradient(to right, transparent, #c9a961, transparent)" }} />
      <p
        style={{
          margin: "10px 0 0",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 12,
          color: "#8b6f47",
          letterSpacing: "0.1em",
          fontStyle: "italic",
        }}
      >
        あなたが乗り越えた試練の記録
      </p>
    </header>
  );
}

// ============================================================
// stats
// ============================================================
function StatsBlock({ achievedCount, scoreTotal, streak }) {
  return (
    <section
      aria-label="統計"
      style={{
        margin: "16px 20px 0",
        padding: "14px 8px",
        background: "rgba(255,255,255,0.55)",
        border: "1px solid #d4c8b0",
        outline: "1px solid #c9a96155",
        outlineOffset: "-5px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 6,
      }}
    >
      <StatCol label="達成" en="ACHIEVED" value={achievedCount} unit="件" emphasize />
      <StatDivider8 />
      <StatCol label="スコア" en="SCORE" value={scoreTotal} unit="pt" />
      <StatDivider8 />
      <StatCol label="連続" en="STREAK" value={streak} unit="日" icon={<FlameIcon8 size={12} />} />
    </section>
  );
}
function StatCol({ label, en, value, unit, emphasize, icon }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "#8b6f47", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.4em", marginBottom: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
        {icon}
        <span>{en}</span>
      </div>
      <div style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontSize: emphasize ? 26 : 22,
            fontWeight: 600,
            color: emphasize ? "#a77b1f" : "#2c1810",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 10, color: "#8b6f47" }}>{unit}</span>
      </div>
      <div style={{ fontSize: 9, color: "#8b6f47", letterSpacing: "0.2em", marginTop: 3 }}>{label}</div>
    </div>
  );
}
function StatDivider8() {
  return <span aria-hidden="true" style={{ background: "rgba(201,169,97,0.35)", width: 1, alignSelf: "stretch" }} />;
}

// ============================================================
// filter / sort bar
// ============================================================

const FILTERS = [
  { id: "all", label: "全て" },
  { id: "fulfilled", label: "達成" },
  { id: "active", label: "進行中" },
  { id: "abandoned", label: "破棄" },
];
const SORTS = [
  { id: "recent", label: "新しい順" },
  { id: "rarity", label: "レアリティ順" },
];

function FilterBar({ filter, sort, onFilter, onSort }) {
  return (
    <div style={{ padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* filter pills */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilter(f.id)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                background: active ? "#2c1810" : "transparent",
                color: active ? "#fbf6ec" : "#8b6f47",
                border: `1px solid ${active ? "#2c1810" : "#d4c8b0"}`,
                borderRadius: 999,
                fontSize: 12,
                fontFamily: "'Noto Serif JP', serif",
                fontWeight: 500,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      {/* sort */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "#8b6f47", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600, paddingLeft: "0.3em" }}>
          {SORTS.find((s) => s.id === sort)?.label === "新しい順" ? "RECENT" : "BY RARITY"}
        </span>
        <div style={{ display: "inline-flex", border: "1px solid #d4c8b0", borderRadius: 4, overflow: "hidden" }}>
          {SORTS.map((s) => {
            const active = sort === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSort(s.id)}
                style={{
                  padding: "6px 12px",
                  background: active ? "#f4e8d0" : "#ffffff",
                  color: "#2c1810",
                  border: "none",
                  fontSize: 11,
                  fontFamily: "'Noto Serif JP', serif",
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  borderLeft: active ? "1px solid #c9a96155" : "none",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// trophy card (mini contract)
// ============================================================
function TrophyCard({ item }) {
  const { goal, rarity, achievedAt, no, totalDays, keptPct } = item;
  const r = RARITY[rarity];
  return (
    <button
      style={{
        background: "#f4e8d0",
        border: "0.5px solid #d4c8b0",
        outline: "1px solid #c9a96177",
        outlineOffset: "-4px",
        padding: "30px 12px 14px",
        position: "relative",
        cursor: "pointer",
        textAlign: "center",
        boxShadow: "0 6px 16px -10px rgba(44,24,16,0.35), 0 1px 2px rgba(44,24,16,0.05)",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "#2c1810",
        overflow: "visible",
      }}
      aria-label={`${goal}（${r.label}）の達成記録`}
    >
      {/* No. */}
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "#8b6f47",
          fontWeight: 600,
          paddingLeft: "0.25em",
        }}
      >
        No. {no}
      </span>

      {/* tiny seal corner */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontSize: 9,
          color: "#8b1a1a",
          letterSpacing: "0.2em",
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
        }}
      >
        ✓
      </span>

      {/* crest */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <HeraldicCrest rarity={rarity} size={84} />
      </div>

      {/* divider */}
      <div style={{ width: 60, height: 1, background: `linear-gradient(to right, transparent, ${r.primary}55, transparent)`, margin: "0 auto 8px" }} />

      {/* goal */}
      <p
        style={{
          margin: "0 0 8px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.45,
          color: "#2c1810",
          letterSpacing: "0.02em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 36,
        }}
      >
        {goal}
      </p>

      {/* rarity pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 8px",
          background: r.badgeBg,
          border: `1px solid ${r.primary}33`,
          borderRadius: 999,
          marginBottom: 6,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: r.primary,
          }}
        />
        <span style={{ fontSize: 9, letterSpacing: "0.2em", color: r.badgeText, fontFamily: "'Noto Serif JP', serif", fontWeight: 600 }}>
          {r.label}
        </span>
      </div>

      {/* date + pct */}
      <div style={{ fontSize: 9, color: "#8b6f47", letterSpacing: "0.08em", display: "flex", justifyContent: "center", gap: 10 }}>
        <span>{achievedAt}</span>
        <span aria-hidden="true">·</span>
        <span>
          <ruby>達成率<rt style={{ fontSize: "0.5em", color: "#8b6f47" }}>たっせいりつ</rt></ruby> {keptPct}%
        </span>
      </div>
    </button>
  );
}

// ============================================================
// abandoned card (grayscale)
// ============================================================
function AbandonedCard({ item }) {
  const { goal, no, abandonedAt } = item;
  return (
    <article
      style={{
        background: "rgba(244, 232, 208, 0.45)",
        border: "0.5px dashed #b3a890",
        padding: "30px 12px 14px",
        position: "relative",
        textAlign: "center",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "#7a7060",
        filter: "grayscale(0.85)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "#8b6f47",
          fontWeight: 600,
        }}
      >
        No. {no}
      </span>
      <span
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontSize: 8,
          letterSpacing: "0.3em",
          color: "#8b6f47",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 600,
        }}
      >
        ABANDONED
      </span>

      {/* placeholder where crest would be — empty silhouette */}
      <div
        style={{
          width: 84,
          height: 84,
          margin: "0 auto 10px",
          borderRadius: "50%",
          border: "1.5px dashed #a89c84",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a89c84",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 11,
          letterSpacing: "0.15em",
          background: "rgba(255,255,255,0.4)",
        }}
        aria-hidden="true"
      >
        破棄
      </div>

      <div style={{ width: 60, height: 1, background: "rgba(168, 156, 132, 0.4)", margin: "0 auto 8px" }} />

      <p
        style={{
          margin: "0 0 8px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.45,
          color: "#7a7060",
          letterSpacing: "0.02em",
          textDecoration: "line-through",
          textDecorationColor: "#a89c84",
          textDecorationThickness: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 36,
        }}
      >
        {goal}
      </p>

      <div style={{ fontSize: 9, color: "#8b6f47", letterSpacing: "0.08em", marginBottom: 8 }}>
        {abandonedAt} 破棄
      </div>

      <button
        style={{
          padding: "5px 12px",
          background: "transparent",
          border: "1px solid #8b6f47",
          color: "#8b6f47",
          fontSize: 11,
          fontFamily: "'Noto Serif JP', serif",
          letterSpacing: "0.08em",
          cursor: "pointer",
          borderRadius: 2,
        }}
      >
        再挑戦する
      </button>
    </article>
  );
}

// ============================================================
// active card (in progress)
// ============================================================
function ActiveCard({ item }) {
  const { goal, no, daysLeft, rarity } = item;
  const r = RARITY[rarity];
  return (
    <article
      style={{
        background: "#ffffff",
        border: `0.5px solid ${r.primary}55`,
        padding: "30px 12px 14px",
        position: "relative",
        textAlign: "center",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "#2c1810",
        boxShadow: "0 4px 12px -8px rgba(44,24,16,0.2)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "#8b6f47",
          fontWeight: 600,
        }}
      >
        No. {no}
      </span>
      <span
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontSize: 8,
          letterSpacing: "0.3em",
          color: "#8b1a1a",
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          fontWeight: 700,
        }}
      >
        ACTIVE
      </span>

      {/* faint outlined crest preview */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: 0.35 }}>
        <HeraldicCrest rarity={rarity} size={84} />
      </div>

      <div style={{ width: 60, height: 1, background: `linear-gradient(to right, transparent, ${r.primary}66, transparent)`, margin: "0 auto 8px" }} />

      <p
        style={{
          margin: "0 0 8px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.45,
          letterSpacing: "0.02em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 36,
        }}
      >
        {goal}
      </p>

      <div style={{ fontSize: 11, fontFamily: "'Noto Serif JP', serif", color: "#2c1810", letterSpacing: "0.05em" }}>
        期日まで <span style={{ fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", color: "#8b1a1a", fontWeight: 700, fontSize: 16 }}>{daysLeft}</span>日
      </div>
    </article>
  );
}

// ============================================================
// nav
// ============================================================
function NavItem8({ icon, label, active }) {
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
const HALL_DATA = [
  { id: 1, no: "001", goal: "TOEIC 800点を達成する", rarity: "epic", achievedAt: "2026.04", totalDays: 90, keptPct: 94, status: "fulfilled", scoreOrder: 4 },
  { id: 2, no: "002", goal: "毎日読書1冊を続ける", rarity: "rare", achievedAt: "2026.03", totalDays: 30, keptPct: 87, status: "fulfilled", scoreOrder: 2 },
  { id: 3, no: "003", goal: "朝5時起床の習慣を作る", rarity: "common", achievedAt: "2026.02", totalDays: 21, keptPct: 81, status: "fulfilled", scoreOrder: 1 },
  { id: 4, no: "004", goal: "副業で月10万円を達成", rarity: "legendary", achievedAt: "2026.01", totalDays: 180, keptPct: 96, status: "fulfilled", scoreOrder: 5 },
  { id: 5, no: "005", goal: "体重を5kg減らす", rarity: "rare", achievedAt: "2025.12", totalDays: 60, keptPct: 89, status: "fulfilled", scoreOrder: 3 },
];
const ACTIVE_DATA = [
  { id: 6, no: "006", goal: "毎日30分のランニング", rarity: "rare", daysLeft: 73, status: "active" },
  { id: 7, no: "007", goal: "週3回の自炊を続ける", rarity: "common", daysLeft: 45, status: "active" },
];
const ABANDONED_DATA = [
  { id: 8, no: "008", goal: "毎朝瞑想を10分行う", abandonedAt: "2026.03", status: "abandoned" },
  { id: 9, no: "009", goal: "禁酒を1ヶ月続ける", abandonedAt: "2026.02", status: "abandoned" },
];

// ============================================================
// screen
// ============================================================

function HallScreen({ width = 412, initialFilter = "all", initialSort = "recent", initialMode = "default" }) {
  const [filter, setFilter] = useHallState(initialFilter);
  const [sort, setSort] = useHallState(initialSort);

  const isEmpty = initialMode === "empty";

  const allItems = [...HALL_DATA, ...ACTIVE_DATA, ...ABANDONED_DATA];
  let visible = allItems;
  if (filter === "fulfilled") visible = HALL_DATA;
  else if (filter === "active") visible = ACTIVE_DATA;
  else if (filter === "abandoned") visible = ABANDONED_DATA;

  if (sort === "rarity") {
    visible = [...visible].sort((a, b) => (b.scoreOrder || 0) - (a.scoreOrder || 0));
  }

  const achievedCount = HALL_DATA.length + 7; // total 12 (5 shown + 7 older)
  const score = 850;
  const streak = 7;

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
      {/* top bar — settings only on right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px 0",
        }}
      >
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
          <GearIcon8 size={20} color="#8b6f47" />
        </button>
      </div>

      <HallHeader />

      {!isEmpty && <StatsBlock achievedCount={achievedCount} scoreTotal={score} streak={streak} />}

      {isEmpty ? (
        <HallEmpty />
      ) : (
        <>
          <FilterBar filter={filter} sort={sort} onFilter={setFilter} onSort={setSort} />

          <main style={{ flex: 1, padding: "8px 20px 24px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {visible.map((item) =>
                item.status === "fulfilled" ? (
                  <TrophyCard key={item.id} item={item} />
                ) : item.status === "abandoned" ? (
                  <AbandonedCard key={item.id} item={item} />
                ) : (
                  <ActiveCard key={item.id} item={item} />
                )
              )}
            </div>

            {visible.length === 0 && (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#8b6f47", fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontStyle: "italic" }}>
                該当する契約はありません。
              </div>
            )}
          </main>
        </>
      )}

      {/* bottom nav */}
      <nav
        aria-label="メインナビゲーション"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #d4c8b0",
          background: "rgba(251,246,236,0.85)",
        }}
      >
        <NavItem8 icon={<HomeIcon8 />} label="ホーム" />
        <NavItem8 icon={<ShieldIcon8 size={22} />} label="殿堂" active />
        <NavItem8 icon={<RankIcon8 size={22} />} label="ランキング" />
      </nav>
    </div>
  );
}

function HallEmpty() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 28px", textAlign: "center" }}>
      <div style={{ marginBottom: 18, opacity: 0.4 }}>
        <HeraldicCrest rarity="common" size={120} />
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
        殿堂はまだ静かだ
      </h2>
      <p
        style={{
          margin: "10px 0 24px",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 13,
          color: "#6b6b6b",
          lineHeight: 1.7,
          letterSpacing: "0.04em",
          maxWidth: 260,
        }}
      >
        最初の試練を乗り越えたとき、
        <br />
        ここにあなたの紋章が刻まれる。
      </p>
      <button
        style={{
          padding: "12px 24px",
          background: "#2c1810",
          color: "#fbf6ec",
          border: "1px solid #2c1810",
          borderRadius: 4,
          fontSize: 13,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 600,
          letterSpacing: "0.14em",
          cursor: "pointer",
          boxShadow: "0 6px 14px -8px rgba(44,24,16,0.6)",
        }}
      >
        契約を結ぶ
      </button>
    </div>
  );
}

Object.assign(window, { HallScreen });
