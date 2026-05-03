/* global React */

const { useState: useStep3State, useMemo: useStep3Memo } = React;
const _rt3 = { fontSize: "0.45em", letterSpacing: "0.05em", color: "#8b6f47", fontWeight: 400 };

// reference "today" so the calendar is deterministic
const TODAY = new Date(2026, 4, 1); // 2026-05-01 (month is 0-indexed)
const MIN_DATE = new Date(2026, 4, 8); // today + 7

// ========== icons ==========
function ArrowIcon3({ dir = "right", size = 14, color = "#2c1810" }) {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ transform: `rotate(${rot}deg)` }} fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ========== step indicator ==========
function StepBar3({ current = 3, total = 4, labels = ["目標", "試練", "期日", "署名"] }) {
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

// ========== contract recap ==========
function ContractRecap3({ goal, trials }) {
  return (
    <div
      style={{
        margin: "0 20px 14px",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.6)",
        border: "1px solid #d4c8b0",
        borderLeft: "2px solid #8b1a1a",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.4em", marginBottom: 3 }}>
        あなたの目標
      </div>
      <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 14, color: "#2c1810", letterSpacing: "0.03em", marginBottom: 8 }}>
        {goal}
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.4em", marginBottom: 3 }}>
        授かりし試練（{trials.length}）
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {trials.map((t, i) => (
          <li
            key={i}
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 12,
              color: "#3a2418",
              letterSpacing: "0.02em",
              lineHeight: 1.6,
              paddingLeft: 12,
              position: "relative",
            }}
          >
            <span style={{ position: "absolute", left: 0, color: "#8b1a1a" }}>・</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ========== prompt ==========
function Prompt3() {
  return (
    <div style={{ padding: "4px 24px 18px", textAlign: "center" }}>
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
        いつまでに<ruby>達成<rt style={_rt3}>たっせい</rt></ruby>する？
      </h2>
      <div style={{ margin: "12px auto 0", width: 80, height: 1, background: "linear-gradient(to right, transparent, #c9a961, transparent)" }} />
    </div>
  );
}

// ========== preset chips ==========
const PRESETS = [
  { label: "7日後", days: 7 },
  { label: "30日後", days: 30 },
  { label: "90日後", days: 90 },
  { label: "180日後", days: 180 },
  { label: "1年後", days: 365 },
];

function PresetChips({ selectedDays, onSelect }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
      {PRESETS.map((p) => {
        const active = selectedDays === p.days;
        return (
          <button
            key={p.days}
            onClick={() => onSelect(p.days)}
            aria-pressed={active}
            style={{
              padding: "8px 16px",
              background: active ? "#2c1810" : "#ffffff",
              color: active ? "#fbf6ec" : "#2c1810",
              border: `1px solid ${active ? "#2c1810" : "#d4c8b0"}`,
              outline: active ? "1px solid #c9a961" : "none",
              outlineOffset: "-3px",
              borderRadius: 999,
              fontSize: 13,
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

// ========== calendar ==========
function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function daysBetween(a, b) {
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function Calendar({ value, onChange, viewMonth, onViewMonthChange }) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: prevMonthDays - startWeekday + i + 1, otherMonth: true, date: new Date(year, month - 1, prevMonthDays - startWeekday + i + 1) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false, date: new Date(year, month, d) });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - daysInMonth - startWeekday + 1;
    cells.push({ day: d, otherMonth: true, date: new Date(year, month + 1, d) });
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d4c8b0",
        padding: "14px 12px 10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px 10px" }}>
        <button
          onClick={() => onViewMonthChange(new Date(year, month - 1, 1))}
          aria-label="前の月"
          style={{ background: "none", border: "1px solid #d4c8b0", borderRadius: 4, width: 28, height: 28, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowIcon3 dir="left" size={12} color="#8b6f47" />
        </button>
        <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 15, fontWeight: 600, letterSpacing: "0.1em", color: "#2c1810" }}>
          {year}年 {month + 1}月
        </div>
        <button
          onClick={() => onViewMonthChange(new Date(year, month + 1, 1))}
          aria-label="次の月"
          style={{ background: "none", border: "1px solid #d4c8b0", borderRadius: 4, width: 28, height: 28, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowIcon3 dir="right" size={12} color="#8b6f47" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {weekdays.map((w, i) => (
          <div
            key={w}
            style={{
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: i === 0 ? "#8b1a1a" : i === 6 ? "#5b6f8b" : "#8b6f47",
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              padding: "4px 0",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((c, i) => {
          const isSelected = sameDay(value, c.date);
          const isToday = sameDay(TODAY, c.date);
          const tooEarly = c.date < MIN_DATE;
          const disabled = c.otherMonth || tooEarly;
          const dow = c.date.getDay();
          const baseColor = c.otherMonth ? "#cdbfa0" : dow === 0 ? "#8b1a1a" : dow === 6 ? "#5b6f8b" : "#2c1810";
          return (
            <button
              key={i}
              onClick={() => !disabled && onChange(c.date)}
              disabled={disabled}
              style={{
                aspectRatio: "1 / 1",
                background: isSelected ? "#8b1a1a" : isToday ? "rgba(201,169,97,0.18)" : "transparent",
                color: isSelected ? "#fbf6ec" : disabled ? "#cdbfa0" : baseColor,
                border: isSelected ? "1px solid #6b1414" : isToday ? "1px solid #c9a961" : "1px solid transparent",
                borderRadius: "50%",
                fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
                fontSize: 14,
                fontWeight: isSelected || isToday ? 600 : 500,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: tooEarly && !c.otherMonth ? 0.35 : 1,
                position: "relative",
                padding: 0,
                lineHeight: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label={`${c.date.getMonth() + 1}月${c.day}日`}
            >
              {c.day}
              {isToday && !isSelected && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    fontSize: 7,
                    color: "#8b6f47",
                    letterSpacing: "0.1em",
                    fontFamily: "'Noto Serif JP', serif",
                  }}
                  aria-hidden="true"
                >
                  今日
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 8, padding: "6px 4px 0", borderTop: "1px dashed #e8dec6", display: "flex", gap: 12, fontSize: 9, color: "#8b6f47", letterSpacing: "0.08em", justifyContent: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8b1a1a" }} />選択中
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid #c9a961", background: "rgba(201,169,97,0.18)" }} />今日
        </span>
        <span>※ 最短7日後から</span>
      </div>
    </div>
  );
}

// ========== preview ==========
function DatePreview({ date }) {
  if (!date) {
    return (
      <div
        style={{
          padding: "18px 16px",
          textAlign: "center",
          background: "rgba(255,255,255,0.4)",
          border: "1px dashed #d4c8b0",
          color: "#8b6f47",
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 13,
          letterSpacing: "0.08em",
          fontStyle: "italic",
        }}
      >
        期日が定まっていない
      </div>
    );
  }
  const days = daysBetween(new Date(TODAY), new Date(date));
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return (
    <div
      style={{
        padding: "18px 16px",
        textAlign: "center",
        background: "linear-gradient(180deg, #fbf6ec 0%, #f4e8d0 100%)",
        border: "1px solid #c9a961",
        outline: "1px solid #d4c8b0",
        outlineOffset: "-5px",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.5em", marginBottom: 8 }}>
        DEADLINE · 期日
      </div>
      <div
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 22,
          fontWeight: 600,
          color: "#2c1810",
          letterSpacing: "0.04em",
          lineHeight: 1.4,
        }}
      >
        {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日
        <span style={{ fontSize: 14, color: "#8b6f47", marginLeft: 6 }}>（{weekdays[date.getDay()]}）</span>
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 13,
          color: "#3a2418",
          letterSpacing: "0.05em",
        }}
      >
        まで <span style={{ color: "#8b1a1a", fontWeight: 700, fontSize: 28, fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", margin: "0 2px" }}>{days}</span> 日
      </div>
    </div>
  );
}

// ========== footer ==========
function StepFooter3({ canProceed, onBack, onNext }) {
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
        <ArrowIcon3 dir="left" />
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
        <ArrowIcon3 dir="right" color={canProceed ? "#fbf6ec" : "#8b6f47aa"} />
      </button>
    </footer>
  );
}

// ========== screen ==========

const SAMPLE_GOAL = "TOEIC 800点を達成する";
const SAMPLE_TRIALS = ["SNSを1日30分以内に制限する", "朝6時起床を厳守する"];

function Step3Screen({ width = 412, initialMode = "empty" }) {
  // empty | preset30 | preset365 | custom
  const presetByMode = { preset30: 30, preset365: 365 };
  const customDate = new Date(2026, 6, 15); // July 15

  const initialDate =
    initialMode === "preset30" ? addDays(TODAY, 30) :
    initialMode === "preset365" ? addDays(TODAY, 365) :
    initialMode === "custom" ? customDate : null;

  const [date, setDate] = useStep3State(initialDate);
  const [presetDays, setPresetDays] = useStep3State(presetByMode[initialMode] || null);
  const [viewMonth, setViewMonth] = useStep3State(initialDate || new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));

  const onPreset = (days) => {
    const d = addDays(TODAY, days);
    setDate(d);
    setPresetDays(days);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const onCalendarPick = (d) => {
    setDate(d);
    setPresetDays(null);
  };

  return (
    <div
      style={{
        width,
        minHeight: 1100,
        background: "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      <header style={{ padding: "20px 20px 14px", textAlign: "center" }}>
        <StepBar3 current={3} />
        <h1
          style={{
            margin: "18px 0 4px",
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.18em",
          }}
        >
          <ruby>契約書<rt style={_rt3}>けいやくしょ</rt></ruby>を<ruby>結<rt style={_rt3}>むす</rt></ruby>ぶ
        </h1>
        <p style={{ margin: 0, fontSize: 12, color: "#8b6f47", letterSpacing: "0.15em", fontFamily: "'Noto Serif JP', serif" }}>
          Step 3：期日を定める
        </p>
      </header>

      <ContractRecap3 goal={SAMPLE_GOAL} trials={SAMPLE_TRIALS} />

      <main style={{ flex: 1, padding: "0 20px 20px", display: "flex", flexDirection: "column" }}>
        <Prompt3 />

        {/* preview at top so it's visually anchored */}
        <DatePreview date={date} />

        {/* preset chips */}
        <div style={{ marginTop: 18, marginBottom: 8 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.4em", marginBottom: 10, fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif" }}>
            QUICK · 早見
          </div>
          <PresetChips selectedDays={presetDays} onSelect={onPreset} />
        </div>

        {/* divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 12px" }}>
          <span style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
          <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.4em", paddingLeft: "0.4em", fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif", fontWeight: 600 }}>
            OR
          </span>
          <span style={{ flex: 1, height: 1, background: "rgba(201,169,97,0.4)" }} />
        </div>

        {/* calendar */}
        <Calendar value={date} onChange={onCalendarPick} viewMonth={viewMonth} onViewMonthChange={setViewMonth} />
      </main>

      <StepFooter3 canProceed={!!date} onBack={() => {}} onNext={() => {}} />
    </div>
  );
}

Object.assign(window, { Step3Screen });
