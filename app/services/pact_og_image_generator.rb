require "open3"

# 公開された契約から、X (Twitter) カードや OGP に表示する PNG 画像を生成する。
# Twitter カードの推奨サイズは 1200x630（summary_large_image）。
#
# Design 移植版（PR 6）:
# - 羊皮紙 radial gradient + 二重金枠 + 4 隅装飾（screens/ogp.jsx 準拠）
# - 左に HeraldicCrest（rarity 別の SVG 紋章。Common なら⚔ ニュアンス、達成済みは
#   実際の crest.rarity の色）
# - 右に契約書本文（目標 / 制約 / 期日 / 難易度 / 称号）
# - 下部に "SIGN · ENDURE · BE CROWNED" + vowpact.app
class PactOgImageGenerator
  # SVG の論理座標系（コード内の x, y はすべてこの値ベース）。
  # 1200x630 は Twitter Card "summary_large_image" の推奨サイズ。
  WIDTH = 1200
  HEIGHT = 630
  # 出力 PNG のピクセル数。Retina ディスプレイや X 側のダウンスケールで綺麗に見せるため 2x で書き出す。
  RENDER_WIDTH = WIDTH * 2
  RENDER_HEIGHT = HEIGHT * 2

  # カラートークン（PR 1 で application.css に追加した値と同じ）
  COLOR_PARCHMENT       = "#f4e8d0"
  COLOR_PARCHMENT_LIGHT = "#fbf6ec"
  COLOR_PARCHMENT_SOFT  = "#f1e7d2"
  COLOR_INK             = "#2c1810"
  COLOR_SEAL            = "#8b1a1a"
  COLOR_GOLD            = "#c9a961"
  COLOR_GOLD_DEEP       = "#a77b1f"
  COLOR_GOLD_MUTED      = "#8b6f47"
  COLOR_BORDER_SOFT     = "#d4c8b0"

  # HeraldicCrest 用 rarity パレット（HeraldicCrest.tsx と完全一致）
  RARITY_PALETTES = {
    "common"    => { primary: "#7a7060", secondary: "#a89c84", glow: "rgba(168,156,132,0.25)", decorations: 0 },
    "rare"      => { primary: "#3a5a8c", secondary: "#7a9bc2", glow: "rgba(80,130,200,0.35)",  decorations: 1 },
    "epic"      => { primary: "#6b3a8c", secondary: "#a877c7", glow: "rgba(140,80,180,0.4)",   decorations: 2 },
    "legendary" => { primary: "#a77b1f", secondary: "#e8c873", glow: "rgba(232,200,115,0.55)", decorations: 3 }
  }.freeze

  def initialize(pact)
    @pact = pact
  end

  # SVG 文字列を返す。
  def to_svg
    completed = @pact.completed?
    headline  = completed ? "成就せり" : "誓いは刻まれた"
    subtitle  = completed ? "あなたの誓いは見事に達成された。紋章が授けられる。"
                          : "本書に記された誓いは、あなた自身との不動の契約となる。"
    # 達成済みは実際の crest.rarity の色、進行中は仮想 common（落ち着いた灰銀）
    rarity = completed && @pact.crest ? @pact.crest.rarity : "common"

    <<~SVG
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="#{WIDTH}" height="#{HEIGHT}" viewBox="0 0 #{WIDTH} #{HEIGHT}">
        #{defs_svg}
        #{background_svg}
        #{frame_svg}
        #{corner_ornaments_svg}
        #{top_brand_svg}

        <!-- 左側：HeraldicCrest（盾形紋章） -->
        #{heraldic_crest_svg(cx: 270, cy: 340, size: 280, rarity: rarity)}

        <!-- 右側：契約書本文 -->
        <g>
          <!-- ヘッドライン -->
          <text x="580" y="160" font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
                font-size="48" font-weight="700"
                fill="#{COLOR_SEAL}" style="fill:#{COLOR_SEAL};">#{escape(headline)}</text>

          <!-- サブタイトル -->
          <text x="580" y="200" font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
                font-size="18"
                fill="#{COLOR_INK}" fill-opacity="0.7"
                style="fill:#{COLOR_INK};fill-opacity:0.7;">#{escape(subtitle)}</text>

          <!-- 区切り（金線 + 星） -->
          #{divider_svg(x1: 580, x2: 1110, y: 230)}

          <!-- 目標 -->
          <text x="580" y="278" font-family="'Cormorant Garamond', 'Noto Serif JP', serif"
                font-size="14" font-weight="600" letter-spacing="6"
                fill="#{COLOR_GOLD_MUTED}" style="fill:#{COLOR_GOLD_MUTED};">GOAL</text>
          #{wrap_text(@pact.goal, x: 580, y: 312, width: 540, font_size: 28, color: COLOR_INK, max_lines: 2)}

          <!-- 制約 -->
          <text x="580" y="386" font-family="'Cormorant Garamond', 'Noto Serif JP', serif"
                font-size="14" font-weight="600" letter-spacing="6"
                fill="#{COLOR_GOLD_MUTED}" style="fill:#{COLOR_GOLD_MUTED};">TRIAL</text>
          #{wrap_text(@pact.constraint_text, x: 580, y: 418, width: 540, font_size: 22, color: COLOR_INK, max_lines: 2)}

          <!-- 期日・難易度 -->
          <text x="580" y="488" font-family="'Cormorant Garamond', 'Noto Serif JP', serif"
                font-size="13" font-weight="600" letter-spacing="6"
                fill="#{COLOR_GOLD_MUTED}" style="fill:#{COLOR_GOLD_MUTED};">DEADLINE</text>
          <text x="580" y="518" font-family="'Noto Serif JP', serif" font-size="22"
                fill="#{COLOR_INK}" style="fill:#{COLOR_INK};">#{@pact.deadline}</text>

          <text x="850" y="488" font-family="'Cormorant Garamond', 'Noto Serif JP', serif"
                font-size="13" font-weight="600" letter-spacing="6"
                fill="#{COLOR_GOLD_MUTED}" style="fill:#{COLOR_GOLD_MUTED};">DIFFICULTY</text>
          <text x="850" y="518" font-family="'Noto Serif JP', serif" font-size="22">
            #{difficulty_marks_svg}
          </text>
        </g>

        #{title_banner_svg}
        #{footer_svg}
      </svg>
    SVG
  end

  # SVG を PNG に変換する。
  def to_png
    if rsvg_available?
      png_via_rsvg
    elsif imagemagick_available?
      png_via_imagemagick
    else
      Rails.logger.warn("[PactOgImage] neither rsvg-convert nor convert available, using fallback")
      fallback_png
    end
  end

  private

  # =====================================================================
  # SVG 部品
  # =====================================================================

  def defs_svg
    <<~SVG
      <defs>
        <radialGradient id="og-bg" cx="35%" cy="40%" r="85%">
          <stop offset="0%" stop-color="#{COLOR_PARCHMENT_LIGHT}"/>
          <stop offset="55%" stop-color="#{COLOR_PARCHMENT_SOFT}"/>
          <stop offset="100%" stop-color="#e2d2ad"/>
        </radialGradient>
        <linearGradient id="og-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.06"/>
          <stop offset="50%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.08"/>
        </linearGradient>
      </defs>
    SVG
  end

  def background_svg
    <<~SVG
      <rect width="100%" height="100%" fill="url(#og-bg)"/>
      <rect width="100%" height="100%" fill="url(#og-edge)"/>
    SVG
  end

  # 二重の金枠（外: 太、内: 細）。
  def frame_svg
    <<~SVG
      <rect x="28" y="28" width="#{WIDTH - 56}" height="#{HEIGHT - 56}"
            fill="none" stroke="#{COLOR_GOLD}" stroke-width="2.5"/>
      <rect x="42" y="42" width="#{WIDTH - 84}" height="#{HEIGHT - 84}"
            fill="none" stroke="#{COLOR_GOLD}" stroke-width="1" stroke-opacity="0.55"/>
    SVG
  end

  # 4 隅の鉤型装飾（CornerOrnament を OGP 用にスケールアップ）。
  def corner_ornaments_svg
    [
      [ 70, 70, 0 ],
      [ WIDTH - 70, 70, 90 ],
      [ 70, HEIGHT - 70, -90 ],
      [ WIDTH - 70, HEIGHT - 70, 180 ]
    ].map do |x, y, rot|
      <<~SVG
        <g transform="translate(#{x},#{y}) rotate(#{rot})" opacity="0.85">
          <path d="M0 0 L60 0 M0 0 L0 60" stroke="#{COLOR_GOLD}" stroke-width="2"/>
          <circle cx="0" cy="0" r="4" fill="#{COLOR_GOLD}"/>
          <path d="M14 0 L18 -3 L18 3 Z" fill="#{COLOR_GOLD}"/>
          <path d="M0 14 L-3 18 L3 18 Z" fill="#{COLOR_GOLD}"/>
        </g>
      SVG
    end.join
  end

  # 上部のブランド帯
  def top_brand_svg
    <<~SVG
      <text x="#{WIDTH / 2}" y="105" text-anchor="middle"
            font-family="'Cormorant Garamond', serif"
            font-size="20" font-weight="700" letter-spacing="13"
            fill="#{COLOR_GOLD_DEEP}" style="fill:#{COLOR_GOLD_DEEP};">── VOW PACT · MMXXVI ──</text>
    SVG
  end

  # 区切り線（金線 + 中央の星）
  def divider_svg(x1:, x2:, y:)
    star_x = (x1 + x2) / 2
    s = 8
    <<~SVG
      <path d="M #{x1} #{y} L #{star_x - s - 4} #{y}" stroke="#{COLOR_GOLD}" stroke-width="1.5" opacity="0.6"/>
      <path d="M #{star_x} #{y - s} L #{star_x + s * 0.3} #{y - s * 0.3} L #{star_x + s} #{y} L #{star_x + s * 0.3} #{y + s * 0.3} L #{star_x} #{y + s} L #{star_x - s * 0.3} #{y + s * 0.3} L #{star_x - s} #{y} L #{star_x - s * 0.3} #{y - s * 0.3} Z" fill="#{COLOR_GOLD}"/>
      <path d="M #{star_x + s + 4} #{y} L #{x2} #{y}" stroke="#{COLOR_GOLD}" stroke-width="1.5" opacity="0.6"/>
    SVG
  end

  # フッター: 左 SIGN · ENDURE · BE CROWNED / 右 vowpact.app
  def footer_svg
    <<~SVG
      <g opacity="0.78">
        <text x="70" y="#{HEIGHT - 50}"
              font-family="'Cormorant Garamond', serif"
              font-size="14" font-weight="600" letter-spacing="6"
              fill="#{COLOR_GOLD_DEEP}" style="fill:#{COLOR_GOLD_DEEP};">SIGN · ENDURE · BE CROWNED</text>
        <text x="#{WIDTH - 70}" y="#{HEIGHT - 50}" text-anchor="end"
              font-family="'Cormorant Garamond', serif"
              font-size="14" font-weight="600" letter-spacing="6"
              fill="#{COLOR_GOLD_DEEP}" style="fill:#{COLOR_GOLD_DEEP};">vowpact.app</text>
      </g>
    SVG
  end

  # 称号バナー（pact.title が存在するときのみ）
  def title_banner_svg
    return "" if @pact.title.blank?

    <<~SVG
      <g transform="translate(0, 562)">
        <rect x="580" y="0" width="540" height="50" rx="2"
              fill="rgba(201,169,97,0.10)" stroke="#{COLOR_GOLD}" stroke-width="1"/>
        <text x="850" y="20" text-anchor="middle"
              font-family="'Cormorant Garamond', serif" font-size="11"
              fill="#{COLOR_GOLD_DEEP}" letter-spacing="6"
              style="fill:#{COLOR_GOLD_DEEP};">── TITLE GRANTED ──</text>
        <text x="850" y="42" text-anchor="middle"
              font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="18" font-weight="700"
              fill="#{COLOR_INK}" style="fill:#{COLOR_INK};">#{escape(@pact.title.to_s)}</text>
      </g>
    SVG
  end

  # =====================================================================
  # HeraldicCrest（盾形紋章）— React 版 HeraldicCrest.tsx の Ruby 移植
  # =====================================================================

  # 中央に "誓" 字、上部冠、下部星（rarity の decorations + 1 個）、月桂樹、外周 8 ドット環。
  # cx/cy は紋章の中心座標、size はピクセル幅。
  def heraldic_crest_svg(cx:, cy:, size:, rarity:)
    palette = RARITY_PALETTES[rarity.to_s] || RARITY_PALETTES["common"]
    primary = palette[:primary]
    secondary = palette[:secondary]
    glow = palette[:glow]
    decorations = palette[:decorations]

    # SVG 内部は viewBox 0 0 140 140 で描いて scale で size に合わせる
    scale = size.to_f / 140.0
    half = size / 2.0
    # transform 内では `(cx - half), (cy - half)` で平行移動 → scale → 内部 viewBox
    # viewBox 内の中心 (70, 70) を size の中央に置く
    star_paths = (0...(decorations + 1)).map do |i|
      offset = (i - decorations / 2.0) * 8
      "<path d=\"M#{offset} -3 L#{offset + 1.4} -0.6 L#{offset + 4} -0.2 L#{offset + 2} 1.6 L#{offset + 2.6} 4.4 L#{offset} 3 L#{offset - 2.6} 4.4 L#{offset - 2} 1.6 L#{offset - 4} -0.2 L#{offset - 1.4} -0.6 Z\" fill=\"#{primary}\"/>"
    end.join

    # 外周 8 ドット
    dots = (0...8).map do |i|
      angle = (i.to_f / 8) * Math::PI * 2 - Math::PI / 2
      cx_d = 70 + Math.cos(angle) * 60
      cy_d = 70 + Math.sin(angle) * 60
      r = i.even? ? 1.2 : 0.6
      "<circle cx=\"#{cx_d.round(2)}\" cy=\"#{cy_d.round(2)}\" r=\"#{r}\" fill=\"#{primary}\"/>"
    end.join

    <<~SVG
      <g transform="translate(#{cx - half}, #{cy - half}) scale(#{scale})">
        <!-- ラジアルグロー（背景） -->
        <circle cx="70" cy="70" r="80" fill="#{glow}" opacity="0.9"/>
        <defs>
          <linearGradient id="og-shield-#{rarity}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#{secondary}"/>
            <stop offset="100%" stop-color="#{primary}"/>
          </linearGradient>
          <linearGradient id="og-band-#{rarity}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#{COLOR_PARCHMENT_LIGHT}"/>
            <stop offset="100%" stop-color="#e8dec6"/>
          </linearGradient>
        </defs>

        <!-- 月桂樹 左 -->
        <g transform="translate(8, 60) rotate(-8)" opacity="0.8">
          <path d="M0 35 Q-2 25 0 18 Q-3 10 -2 0 Q3 8 5 18 Q3 28 0 35z" fill="#{secondary}" opacity="0.6"/>
          <path d="M-4 30 Q-8 25 -10 20" stroke="#{primary}" stroke-width="1" fill="none"/>
          <path d="M-4 18 Q-8 14 -10 10" stroke="#{primary}" stroke-width="1" fill="none"/>
        </g>
        <!-- 月桂樹 右（鏡像） -->
        <g transform="translate(132, 60) rotate(8) scale(-1, 1)" opacity="0.8">
          <path d="M0 35 Q-2 25 0 18 Q-3 10 -2 0 Q3 8 5 18 Q3 28 0 35z" fill="#{secondary}" opacity="0.6"/>
          <path d="M-4 30 Q-8 25 -10 20" stroke="#{primary}" stroke-width="1" fill="none"/>
          <path d="M-4 18 Q-8 14 -10 10" stroke="#{primary}" stroke-width="1" fill="none"/>
        </g>

        <!-- 盾本体 -->
        <path d="M70 14 L108 22 L108 70 Q108 100 70 122 Q32 100 32 70 L32 22 Z"
              fill="url(#og-shield-#{rarity})" stroke="#{primary}" stroke-width="1.5"/>

        <!-- 内側ハイライト -->
        <path d="M70 18 L104 25 L104 70 Q104 96 70 116 Q36 96 36 70 L36 25 Z"
              fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.8"/>

        <!-- 中央バンド -->
        <path d="M37 56 L103 56 L103 76 Q103 80 100 82 L70 90 L40 82 Q37 80 37 76 Z"
              fill="url(#og-band-#{rarity})" stroke="#{primary}" stroke-width="1"/>

        <!-- 中央の "誓" 字 -->
        <text x="70" y="78" text-anchor="middle"
              font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="22" font-weight="700"
              fill="#{primary}" style="fill:#{primary};">誓</text>

        <!-- 上部の冠 -->
        <g transform="translate(70, 28)">
          <path d="M-12 6 L-8 -2 L-4 4 L0 -6 L4 4 L8 -2 L12 6 Z" fill="#{secondary}" stroke="#{primary}" stroke-width="0.8"/>
          <circle cx="0" cy="-6" r="1.6" fill="#{primary}"/>
        </g>

        <!-- 下部の星（rarity の装飾レベル） -->
        <g transform="translate(70, 102)">#{star_paths}</g>

        <!-- 外周 8 ドット環 -->
        <g opacity="0.6">#{dots}</g>
      </g>
    SVG
  end

  # =====================================================================
  # PNG 変換
  # =====================================================================

  def rsvg_available?
    @rsvg_available ||= system("which rsvg-convert > /dev/null 2>&1")
  end

  def imagemagick_available?
    @imagemagick_available ||= system("which convert > /dev/null 2>&1")
  end

  # Open3.capture3 は配列形式で渡すためシェル展開はされない。
  # 引数の補完値（RENDER_WIDTH/HEIGHT）は Integer 定数で攻撃面はないが、
  # Brakeman の Execute チェックは式展開を一律警告するため、Integer() で型を明示する。
  def png_via_rsvg
    width  = Integer(RENDER_WIDTH)
    height = Integer(RENDER_HEIGHT)
    cmd = [ "rsvg-convert", "--width=#{width}", "--height=#{height}", "--format=png" ]
    out, err, status = Open3.capture3(*cmd, stdin_data: to_svg, binmode: true)
    return out if status.success?
    Rails.logger.error("[PactOgImage] rsvg-convert failed: #{err}")
    fallback_png
  end

  def png_via_imagemagick
    width  = Integer(RENDER_WIDTH)
    height = Integer(RENDER_HEIGHT)
    cmd = [ "convert", "-background", "transparent", "-density", "200",
            "svg:-", "-resize", "#{width}x#{height}", "png:-" ]
    out, err, status = Open3.capture3(*cmd, stdin_data: to_svg, binmode: true)
    return out if status.success?
    Rails.logger.error("[PactOgImage] convert failed: #{err}")
    fallback_png
  end

  # 動的画像生成が利用できない環境向けの静的フォールバック。
  # 1x1 グレーの PNG（最終フォールバック）。OG image としては機能しないが、500 エラーは回避。
  def fallback_png
    Base64.decode64(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
  end

  # =====================================================================
  # ヘルパー
  # =====================================================================

  # 文字列を最大 max_lines 行に折り返す。漢字・かな前提で半角=2 文字相当の概算。
  def wrap_text(text, x:, y:, width:, font_size:, color:, max_lines: 2)
    return "" if text.blank?

    chars_per_line = (width / (font_size * 1.0)).floor
    chars = text.to_s.chars
    lines = []
    buffer = []
    chars.each do |c|
      buffer << c
      if buffer.size >= chars_per_line
        lines << buffer.join
        buffer = []
        break if lines.size >= max_lines
      end
    end
    lines << buffer.join if buffer.any? && lines.size < max_lines

    if lines.size == max_lines && (chars_per_line * max_lines) < chars.size
      last = lines.last
      lines[-1] = "#{last[0...-1]}…"
    end

    lines.each_with_index.map do |line, i|
      line_y = y + (i * (font_size + 8))
      <<~LINE.chomp
        <text x="#{x}" y="#{line_y}" font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="#{font_size}" fill="#{color}" font-weight="700"
              style="fill:#{color};">#{escape(line)}</text>
      LINE
    end.join("\n")
  end

  # SignedPage と同じく "⚔ × n（seal）+ ⚔ × (5-n)（薄墨） {n}/5" を tspan で色分け表示。
  def difficulty_marks_svg
    n = [ [ @pact.difficulty.to_i, 0 ].max, 5 ].min
    parts = []
    parts << "<tspan fill=\"#{COLOR_SEAL}\" style=\"fill:#{COLOR_SEAL};\">#{'⚔' * n}</tspan>" if n.positive?
    parts << "<tspan fill=\"#{COLOR_INK}\" fill-opacity=\"0.3\" style=\"fill:#{COLOR_INK};fill-opacity:0.3;\">#{'⚔' * (5 - n)}</tspan>" if n < 5
    parts << "<tspan fill=\"#{COLOR_INK}\" fill-opacity=\"0.6\" font-size=\"18\">  #{n} / 5</tspan>"
    parts.join
  end

  # SVG 中の文字を XML エスケープ。
  def escape(text)
    text.to_s.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
  end
end
