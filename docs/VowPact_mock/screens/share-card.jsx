/* global React, Seal, StarDivider, rtStyle */

// X投稿用 正方形シェアカード（1080×1080想定）— A. 羊皮紙
function ShareCard({ size = 540 }) {
  return <ShareCardParchment size={size} />;
}

function ShareCardParchment({ size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(ellipse at top, #fbf6ec 0%, #f1e7d2 60%, #ead9b8 100%)",
        position: "relative",
        boxSizing: "border-box",
        padding: 36,
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
        overflow: "hidden",
      }}
    >
      {/* 内側の二重罫線 */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          border: "1px solid #c9a961",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 30,
          border: "0.5px solid #c9a961aa",
        }}
      />

      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* ヘッダー */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.6em",
              color: "#c9a961",
              fontWeight: 600,
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              paddingLeft: "0.6em",
            }}
          >
            VOW PACT
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              fontSize: 40,
              color: "#2c1810",
              margin: "16px 0 0",
              letterSpacing: "0.08em",
              lineHeight: 1.3,
            }}
          >
            <ruby>誓<rt style={rtStyle}>ちか</rt></ruby>いは<ruby>刻<rt style={rtStyle}>きざ</rt></ruby>まれた
          </h1>
          <div style={{ margin: "20px auto 0", width: 160 }}>
            <StarDivider />
          </div>
        </div>

        {/* 中央：契約内容 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            margin: "20px 8px",
            gap: 18,
          }}
        >
          <ShareField label="目標">
            TOEIC 800<ruby>点<rt style={rtStyle}>てん</rt></ruby>を<ruby>達成<rt style={rtStyle}>たっせい</rt></ruby>する
          </ShareField>
          <ShareField
            label="試練"
            right={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#8b6f47", letterSpacing: "0.25em" }}>
                  <ruby>難易度<rt style={{ fontSize: "0.55em", color: "#8b6f47" }}>なんいど</rt></ruby>
                </span>
                <Stars value={4} />
              </span>
            }
          >
            SNSを1日30分以内に<ruby>制限<rt style={rtStyle}>せいげん</rt></ruby>する
          </ShareField>
          <ShareField label="期日">2026年 8月 2日 まで</ShareField>
        </div>

        {/* 称号バッジ — 金枠で目立たせる */}
        <div
          role="figure"
          aria-label="授かりし称号"
          style={{
            position: "relative",
            margin: "8px 0 18px",
            padding: "18px 20px 16px",
            background:
              "linear-gradient(180deg, rgba(201,169,97,0.12) 0%, rgba(201,169,97,0.04) 100%)",
            border: "1px solid #c9a961",
            outline: "1px solid #c9a96155",
            outlineOffset: "-5px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#f4ecd6",
              padding: "0 14px",
              fontSize: 11,
              letterSpacing: "0.5em",
              color: "#c9a961",
              fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
              fontWeight: 600,
              paddingLeft: "calc(14px + 0.5em)",
              whiteSpace: "nowrap",
            }}
          >
            TITLE GRANTED
          </div>
          <div
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "0.08em",
              color: "#2c1810",
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
              marginTop: 6,
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

        {/* フッター：署名 + 朱印 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            paddingTop: 16,
            borderTop: "1px solid #c9a96155",
          }}
        >
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.35em", color: "#8b6f47", marginBottom: 6 }}>
              契約者
            </div>
            <div
              style={{
                fontFamily: "'Caveat','Noto Serif JP',cursive",
                fontSize: 38,
                transform: "rotate(-2deg)",
                color: "#2c1810",
                lineHeight: 1,
              }}
            >
              Yuto
            </div>
          </div>
          <Seal size={104} rotate={-8} />
        </div>
      </div>
    </div>
  );
}

// （B/Cバリエーションは廃止）
function _UnusedDark({ size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(ellipse at center, #3a2418 0%, #2c1810 60%, #1a0e08 100%)",
        position: "relative",
        boxSizing: "border-box",
        padding: 40,
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#f4e8d0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 28,
          border: "1px solid #c9a96166",
        }}
      />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", textAlign: "center" }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.6em",
            color: "#c9a961",
            fontWeight: 600,
            fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
            paddingLeft: "0.6em",
          }}
        >
          VOW PACT · No. 001
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              fontSize: 56,
              margin: 0,
              letterSpacing: "0.1em",
              lineHeight: 1.3,
              color: "#f4e8d0",
            }}
          >
            <ruby>誓<rt style={{ ...rtStyle, color: "#c9a961" }}>ちか</rt></ruby>いは
            <br />
            <ruby>刻<rt style={{ ...rtStyle, color: "#c9a961" }}>きざ</rt></ruby>まれた
          </h1>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Seal size={130} rotate={-8} />
          </div>

          <div
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: 18,
              color: "#f4e8d0cc",
              letterSpacing: "0.08em",
              lineHeight: 1.7,
            }}
          >
            TOEIC 800<ruby>点<rt style={{ ...rtStyle, color: "#c9a961" }}>てん</rt></ruby>を
            <ruby>達成<rt style={{ ...rtStyle, color: "#c9a961" }}>たっせい</rt></ruby>する
            <br />
            <span style={{ color: "#c9a961", fontStyle: "italic" }}>—— 期日 2026.08.02</span>
          </div>
        </div>

        <div
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontStyle: "italic",
            color: "#c9a961",
            fontSize: 14,
            letterSpacing: "0.08em",
          }}
        >
          沈黙の<ruby>試練<rt style={{ ...rtStyle, color: "#c9a961" }}>しれん</rt></ruby>を
          <ruby>背負<rt style={{ ...rtStyle, color: "#c9a961" }}>せお</rt></ruby>いし者
        </div>
      </div>
    </div>
  );
}

// （ミニマル案は廃止）
function _UnusedMinimal({ size }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#f4e8d0",
        position: "relative",
        boxSizing: "border-box",
        padding: 56,
        fontFamily: "'Noto Sans JP', system-ui, sans-serif",
        color: "#2c1810",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.6em",
          color: "#8b6f47",
          fontWeight: 600,
          fontFamily: "'Cormorant Garamond', 'Noto Serif JP', serif",
          paddingLeft: "0.6em",
        }}
      >
        VOW PACT
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.4em",
              color: "#8b6f47",
              marginBottom: 18,
            }}
          >
            我、ここに以下を誓う。
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontWeight: 600,
              fontSize: 56,
              margin: 0,
              letterSpacing: "0.04em",
              lineHeight: 1.35,
              color: "#2c1810",
              borderLeft: "3px solid #8b1a1a",
              paddingLeft: 22,
            }}
          >
            TOEIC<br />800<ruby>点<rt style={rtStyle}>てん</rt></ruby>を<br />
            <ruby>達成<rt style={rtStyle}>たっせい</rt></ruby>する
          </h1>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.35em", color: "#8b6f47", marginBottom: 8 }}>
            期日
          </div>
          <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 22, letterSpacing: "0.06em" }}>
            2026年 8月 2日
          </div>
          <div
            style={{
              fontFamily: "'Caveat','Noto Serif JP',cursive",
              fontSize: 32,
              transform: "rotate(-2deg)",
              color: "#2c1810",
              marginTop: 14,
            }}
          >
            Yuto
          </div>
        </div>
        <Seal size={110} rotate={-8} />
      </div>
    </div>
  );
}

function ShareField({ label, right, children }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#8b6f47", fontWeight: 600, paddingLeft: "0.4em" }}>
          【{label}】
        </div>
        {right}
      </div>
      <div
        style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: 18,
          color: "#2c1810",
          borderLeft: "2px solid #8b1a1a",
          paddingLeft: 12,
          lineHeight: 1.6,
          letterSpacing: "0.02em",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Stars({ value = 4, max = 5 }) {
  return (
    <span style={{ color: "#8b1a1a", letterSpacing: "0.15em", fontSize: 13 }}>
      {"★".repeat(value)}
      <span style={{ color: "#d4b8b8" }}>{"★".repeat(max - value)}</span>
    </span>
  );
}

Object.assign(window, { ShareCard });
