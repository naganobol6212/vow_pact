/* global React */
const { useState } = React;

// ---------- SVG パーツ ----------

const StarDivider = ({ color = "#c9a961" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }} aria-hidden="true">
    <span style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${color}66, ${color})` }} />
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 0.5 L8.3 5.2 L13 5.7 L9.4 8.6 L10.6 13.3 L7 10.6 L3.4 13.3 L4.6 8.6 L1 5.7 L5.7 5.2 Z"
        fill={color}
      />
    </svg>
    <span style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${color}66, ${color})` }} />
  </div>
);

const DifficultyStars = ({ value = 4, max = 5 }) => (
  <span
    role="img"
    aria-label={`難易度 ${value} / ${max}`}
    style={{ color: "#8b1a1a", letterSpacing: "0.15em", fontSize: 13 }}
  >
    {"★".repeat(value)}
    <span style={{ color: "#d4b8b8" }}>{"★".repeat(max - value)}</span>
  </span>
);

// 朱印（中世ファンタジー紋章 × 篆刻風）
let __sealIdCounter = 0;
const Seal = ({ size = 88, rotate = -8 }) => {
  // 同一ページ内に複数置かれてもfilter idが衝突しないようにユニーク化
  const uid = React.useMemo(() => `seal-${++__sealIdCounter}`, []);
  return (
    <div
      aria-label="朱印 誓約"
      role="img"
      style={{
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(0 2px 1px rgba(139,26,26,0.2))",
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          {/* 押印のかすれ */}
          <filter id={`${uid}-rough`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
          {/* インクむら */}
          <filter id={`${uid}-ink`}>
            <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="2" seed="11" />
            <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.10  0 0 0 0 0.10  0 0 0 0.4 0" />
            <feComposite in2="SourceGraphic" operator="in" />
            <feComposite in="SourceGraphic" operator="over" />
          </filter>
          {/* 円周文字パス */}
          <path id={`${uid}-arc`} d="M 50 50 m -34 0 a 34 34 0 1 1 68 0 a 34 34 0 1 1 -68 0" />
        </defs>

        <g filter={`url(#${uid}-rough)`}>
          {/* 背景の薄い朱 */}
          <circle cx="50" cy="50" r="46" fill="rgba(139,26,26,0.10)" />
          {/* 外円（太） */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#8b1a1a" strokeWidth="3.2" />
          {/* 二重外円（細） */}
          <circle cx="50" cy="50" r="42" fill="none" stroke="#8b1a1a" strokeWidth="0.7" opacity="0.7" />
          {/* 内円（紋章エリア） */}
          <circle cx="50" cy="50" r="28" fill="none" stroke="#8b1a1a" strokeWidth="1" opacity="0.85" />

          {/* 円周の篆刻風文字 上半 */}
          <text fill="#8b1a1a" fontFamily="'Cormorant Garamond','Noto Serif JP',serif" fontSize="6.5" fontWeight="700" letterSpacing="3">
            <textPath href={`#${uid}-arc`} startOffset="50%" textAnchor="middle">
              VOW · PACT · MMXXVI
            </textPath>
          </text>

          {/* 中央の紋章：剣を交差 + 月桂冠 */}
          <g transform="translate(50 50)">
            {/* 月桂冠 左 */}
            <path
              d="M -22 -2 Q -26 -10 -22 -18 M -22 -2 Q -28 -6 -27 -12 M -22 -2 Q -28 2 -27 8 M -22 -2 Q -26 6 -22 14"
              stroke="#8b1a1a"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* 月桂冠 右 */}
            <path
              d="M 22 -2 Q 26 -10 22 -18 M 22 -2 Q 28 -6 27 -12 M 22 -2 Q 28 2 27 8 M 22 -2 Q 26 6 22 14"
              stroke="#8b1a1a"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* 交差した剣 */}
            <g stroke="#8b1a1a" strokeWidth="1.4" fill="none" strokeLinecap="round">
              {/* 剣1 \ 方向 */}
              <line x1="-14" y1="-14" x2="14" y2="14" />
              <line x1="-16" y1="-12" x2="-12" y2="-16" />{/* 鍔 */}
              <line x1="-18" y1="-18" x2="-15" y2="-15" />{/* 柄頭 */}
              {/* 剣2 / 方向 */}
              <line x1="14" y1="-14" x2="-14" y2="14" />
              <line x1="16" y1="-12" x2="12" y2="-16" />
              <line x1="18" y1="-18" x2="15" y2="-15" />
            </g>
            {/* 中央のひし形（要石） */}
            <path d="M 0 -3 L 3 0 L 0 3 L -3 0 Z" fill="#8b1a1a" />
          </g>

          {/* 下部の小さなラベル */}
          <text
            x="50"
            y="86"
            textAnchor="middle"
            fontFamily="'Noto Serif JP', serif"
            fontSize="7"
            fontWeight="700"
            fill="#8b1a1a"
            letterSpacing="2"
          >
            誓 約
          </text>
        </g>
      </svg>
    </div>
  );
};

// 角飾り（コーナー装飾、控えめ）
const CornerOrnament = ({ position }) => {
  const map = {
    tl: { top: 10, left: 10, transform: "rotate(0deg)" },
    tr: { top: 10, right: 10, transform: "rotate(90deg)" },
    bl: { bottom: 10, left: 10, transform: "rotate(-90deg)" },
    br: { bottom: 10, right: 10, transform: "rotate(180deg)" },
  };
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      style={{ position: "absolute", ...map[position], opacity: 0.55 }}
      aria-hidden="true"
    >
      <path
        d="M2 8 L2 2 L8 2 M2 2 L7 7"
        stroke="#c9a961"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

// 手書き署名風
const Signature = ({ name = "Yuto" }) => (
  <span
    style={{
      fontFamily: "'Caveat', 'Dancing Script', 'Noto Serif JP', cursive",
      fontSize: 30,
      color: "#2c1810",
      lineHeight: 1,
      transform: "rotate(-2deg)",
      display: "inline-block",
    }}
  >
    {name}
  </span>
);

// ---------- 契約書カード本体 ----------

function ContractCard({ data }) {
  const {
    no = "001",
    goal,
    trial,
    difficulty = 4,
    deadline,
    signer = "Yuto",
  } = data;

  return (
    <article
      aria-label="誓約契約書"
      style={{
        position: "relative",
        background: "#f4e8d0",
        border: "0.5px solid #d4c8b0",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 28px -16px rgba(44,24,16,0.35), 0 2px 4px rgba(44,24,16,0.06)",
        padding: "36px 26px 28px",
        // 内側の二重罫線
        outline: "1px solid #c9a961",
        outlineOffset: "-10px",
      }}
    >
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      {/* タイトル */}
      <header style={{ textAlign: "center", marginBottom: 18 }}>
        <h2
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: "clamp(22px, 6.4vw, 28px)",
            letterSpacing: "0.45em",
            color: "#2c1810",
            margin: 0,
            paddingLeft: "0.45em" /* letter-spacing分の中央調整 */,
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
          VOW PACT &nbsp;·&nbsp; No. {no}
        </p>
      </header>

      <div style={{ margin: "16px 4px 22px" }}>
        <StarDivider />
      </div>

      {/* 前文 */}
      <p
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 15,
          color: "#2c1810",
          textAlign: "center",
          letterSpacing: "0.08em",
          margin: "0 0 26px",
        }}
      >
        我、ここに以下を誓う。
      </p>

      {/* 目標 */}
      <Section label="目標">
        <p style={accentBodyStyle}>{goal}</p>
      </Section>

      {/* 試練 */}
      <Section
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
        <p style={accentBodyStyle}>{trial}</p>
      </Section>

      {/* 期日 */}
      <Section label="期日">
        <p style={accentBodyStyle}>{deadline}</p>
      </Section>

      {/* 署名欄 */}
      <div
        style={{
          marginTop: 28,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.3em",
              color: "#8b6f47",
              marginBottom: 10,
            }}
          >
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
        <div style={{ marginBottom: -6, marginRight: -4 }}>
          <Seal />
        </div>
      </div>
    </article>
  );
}

const accentBodyStyle = {
  fontFamily: "'Noto Serif JP', serif",
  fontSize: 16,
  lineHeight: 1.7,
  color: "#2c1810",
  borderLeft: "2px solid #8b1a1a",
  padding: "2px 0 2px 12px",
  margin: 0,
  letterSpacing: "0.02em",
};

function Section({ label, right, children }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
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

// ---------- 画面本体 ----------

function SignedScreen({ width = 412 }) {
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
        minHeight: 900,
        background: "#fbf6ec",
        backgroundImage:
          "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 100%)",
        padding: "28px 20px 36px",
        boxSizing: "border-box",
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
      }}
    >
      {/* 上部：成立アナウンス */}
      <header style={{ textAlign: "center", marginBottom: 22 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.55em",
            color: "#c9a961",
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            fontWeight: 600,
            paddingLeft: "0.55em",
            marginBottom: 14,
          }}
        >
          VOW PACT
        </div>
        <h1
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 8vw, 34px)",
            color: "#2c1810",
            margin: 0,
            letterSpacing: "0.08em",
            lineHeight: 1.4,
          }}
        >
          <ruby>
            誓<rt style={rtStyle}>ちか</rt>
          </ruby>
          いは
          <ruby>
            刻<rt style={rtStyle}>きざ</rt>
          </ruby>
          まれた
        </h1>
        <div style={{ margin: "16px auto 0", width: 120 }}>
          <StarDivider />
        </div>
      </header>

      {/* 中央：契約書 */}
      <ContractCard data={data} />

      {/* 下部：称号 + アクション */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        {/* 称号カード — 金枠で「授かりもの」感を出す */}
        <div
          role="figure"
          aria-label="授かりし称号"
          style={{
            position: "relative",
            padding: "22px 18px 20px",
            background:
              "linear-gradient(180deg, rgba(201,169,97,0.10) 0%, rgba(201,169,97,0.04) 100%)",
            border: "1px solid #c9a961",
            outline: "1px solid #c9a96155",
            outlineOffset: "-5px",
          }}
        >
          {/* ラベル — 上部のリボン風 */}
          <div
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fbf6ec",
              padding: "0 12px",
              fontSize: 10,
              letterSpacing: "0.5em",
              color: "#c9a961",
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              fontWeight: 600,
              paddingLeft: "calc(12px + 0.5em)",
              whiteSpace: "nowrap",
            }}
          >
            TITLE GRANTED
          </div>

          {/* 上の装飾 */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <svg width="44" height="14" viewBox="0 0 44 14" aria-hidden="true">
              <path d="M0 7 L18 7" stroke="#c9a961" strokeWidth="0.8" />
              <path
                d="M22 1.5 L23.4 5.5 L27.5 5.7 L24.2 8.2 L25.4 12.2 L22 9.8 L18.6 12.2 L19.8 8.2 L16.5 5.7 L20.6 5.5 Z"
                fill="#c9a961"
              />
              <path d="M26 7 L44 7" stroke="#c9a961" strokeWidth="0.8" />
            </svg>
          </div>

          <div
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              color: "#2c1810",
              fontSize: 22,
              letterSpacing: "0.08em",
              lineHeight: 1.5,
            }}
          >
            <ruby>沈黙<rt style={rtStyle}>ちんもく</rt></ruby>の
            <ruby>試練<rt style={rtStyle}>しれん</rt></ruby>を
            <ruby>背負<rt style={rtStyle}>せお</rt></ruby>いし
            <span style={{ color: "#8b1a1a" }}>者</span>
          </div>

          <div
            style={{
              marginTop: 10,
              fontFamily: "'Noto Serif JP', serif",
              fontStyle: "italic",
              color: "#8b6f47",
              fontSize: 11,
              letterSpacing: "0.18em",
            }}
          >
            — One who bears the silent trial —
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>
              𝕏
            </span>
            <span>で<ruby>天下<rt style={rtStyle}>てんか</rt></ruby>に<ruby>宣<rt style={rtStyle}>せん</rt></ruby>する</span>
          </PrimaryButton>
          <SecondaryButton>ホームに戻る</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

const rtStyle = {
  fontSize: "0.45em",
  letterSpacing: "0.05em",
  color: "#8b6f47",
  fontWeight: 400,
};

function PrimaryButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        height: 48,
        width: "100%",
        background: "#2c1810",
        color: "#f4e8d0",
        border: "1px solid #2c1810",
        borderRadius: 4,
        fontSize: 15,
        fontFamily: "'Noto Serif JP', serif",
        letterSpacing: "0.12em",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 6px 14px -8px rgba(44,24,16,0.6)",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...rest }) {
  return (
    <button
      {...rest}
      style={{
        height: 44,
        width: "100%",
        background: "#ffffff",
        color: "#2c1810",
        border: "1px solid #d4c8b0",
        borderRadius: 4,
        fontSize: 14,
        fontFamily: "'Noto Sans JP', sans-serif",
        cursor: "pointer",
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </button>
  );
}

Object.assign(window, { SignedScreen, ContractCard, Seal, StarDivider, rtStyle, DifficultyStars, Signature, CornerOrnament });
