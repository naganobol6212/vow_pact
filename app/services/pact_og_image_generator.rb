require "open3"

# 公開された契約から、X (Twitter) カードや OGP に表示する PNG 画像を生成する。
# Twitter カードの推奨サイズは 1200x630（summary_large_image）。
# 中世ファンタジー風の羊皮紙デザインで、契約の「目標」「制約」「期日」「難易度」を表示。
class PactOgImageGenerator
  # SVG の論理座標系（コード内の x, y はすべてこの値ベース）。
  # 1200x630 は Twitter Card "summary_large_image" の推奨サイズ。
  WIDTH = 1200
  HEIGHT = 630
  # 出力 PNG のピクセル数。Retina ディスプレイや X 側のダウンスケールで綺麗に見せるため 2x で書き出す。
  # SVG 内の座標計算は WIDTH/HEIGHT ベースのまま（レンダラー側で拡大）。
  RENDER_WIDTH = WIDTH * 2
  RENDER_HEIGHT = HEIGHT * 2

  COLOR_PARCHMENT = "#f4e8d0"
  COLOR_INK       = "#2c1810"
  COLOR_SEAL      = "#8b1a1a"
  COLOR_GOLD      = "#c9a961"

  def initialize(pact)
    @pact = pact
  end

  # SVG 文字列を返す。
  # PNG に変換する場合は #to_png を呼ぶ（rsvg-convert または ImageMagick）。
  # SignedPage（締結後画面）と同じ「誓いは刻まれた」「成就せり」のヘッドライン構成にしている。
  def to_svg
    completed = @pact.completed?
    headline  = completed ? "成就せり" : "誓いは刻まれた"
    subtitle  = completed ? "あなたの誓いは見事に達成された。紋章が授けられる。"
                          : "本書に記された誓いは、あなた自身との不動の契約となる。"
    seal_symbol = completed ? "🏆" : "⚔"

    <<~SVG
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" width="#{WIDTH}" height="#{HEIGHT}" viewBox="0 0 #{WIDTH} #{HEIGHT}">
        <defs>
          <radialGradient id="parchment" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stop-color="#fbf6ec"/>
            <stop offset="60%" stop-color="#f1e7d2"/>
            <stop offset="100%" stop-color="#ead9b8"/>
          </radialGradient>
        </defs>

        <!-- 背景：羊皮紙風グラデーション -->
        <rect width="100%" height="100%" fill="url(#parchment)"/>

        <!-- 二重罫線（外枠） -->
        <rect x="36" y="36" width="#{WIDTH - 72}" height="#{HEIGHT - 72}" fill="none" stroke="#{COLOR_GOLD}" stroke-width="2"/>
        <rect x="48" y="48" width="#{WIDTH - 96}" height="#{HEIGHT - 96}" fill="none" stroke="#{COLOR_GOLD}" stroke-width="1" stroke-opacity="0.5"/>

        <!-- 中央上のシール（円 + シンボル） -->
        <circle cx="#{WIDTH / 2}" cy="110" r="55" fill="#{COLOR_SEAL}" fill-opacity="0.1"
                stroke="#{COLOR_GOLD}" stroke-width="3"/>
        <text x="#{WIDTH / 2}" y="135" text-anchor="middle" font-size="60">#{seal_symbol}</text>

        <!-- ヘッドライン: fill は style でも明示する（rsvg-convert の一部環境で
             attribute fill より style fill の方が確実に効くケースがあるため） -->
        <text x="#{WIDTH / 2}" y="220" text-anchor="middle"
              font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="48" font-weight="bold"
              fill="#{COLOR_SEAL}" style="fill:#{COLOR_SEAL};">#{headline}</text>

        <!-- サブタイトル -->
        <text x="#{WIDTH / 2}" y="280" text-anchor="middle"
              font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="22"
              fill="#{COLOR_INK}" fill-opacity="0.7" style="fill:#{COLOR_INK};fill-opacity:0.7;">#{subtitle}</text>

        <!-- 契約書ボックス -->
        <rect x="80" y="340" width="#{WIDTH - 160}" height="240" rx="12"
              fill="#{COLOR_PARCHMENT}" stroke="#{COLOR_GOLD}" stroke-width="2"/>

        <!-- 目標 -->
        <text x="100" y="370" font-family="'Noto Serif JP', serif" font-size="20"
              fill="#{COLOR_INK}" fill-opacity="0.6">目標</text>
        #{wrap_text(@pact.goal, x: 100, y: 405, width: 1000, font_size: 32, color: COLOR_INK, max_lines: 1)}

        <!-- 制約 -->
        <text x="100" y="450" font-family="'Noto Serif JP', serif" font-size="20"
              fill="#{COLOR_INK}" fill-opacity="0.6">制約</text>
        #{wrap_text(@pact.constraint_text, x: 100, y: 485, width: 1000, font_size: 26, color: COLOR_INK, max_lines: 1)}

        <!-- 期日 -->
        <text x="100" y="525" font-family="'Noto Serif JP', serif" font-size="20"
              fill="#{COLOR_INK}" fill-opacity="0.6">期日</text>
        <text x="100" y="560" font-family="'Noto Serif JP', serif" font-size="28"
              fill="#{COLOR_INK}">#{@pact.deadline}</text>

        <!-- 難易度 -->
        <text x="600" y="525" font-family="'Noto Serif JP', serif" font-size="20"
              fill="#{COLOR_INK}" fill-opacity="0.6">難易度</text>
        <text x="600" y="560" font-family="'Noto Serif JP', serif" font-size="28">
          #{difficulty_marks_svg}
        </text>

        <!-- 右下のブランディング -->
        <text x="#{WIDTH - 60}" y="615" text-anchor="end"
              font-family="'Cormorant Garamond', serif" font-size="14"
              fill="#{COLOR_GOLD}" letter-spacing="3">VOW PACT</text>
      </svg>
    SVG
  end

  # SVG を PNG に変換する。
  # 優先順位: rsvg-convert（日本語フォントに強い）→ ImageMagick convert → フォールバック PNG。
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

  def rsvg_available?
    @rsvg_available ||= system("which rsvg-convert > /dev/null 2>&1")
  end

  def imagemagick_available?
    @imagemagick_available ||= system("which convert > /dev/null 2>&1")
  end

  def png_via_rsvg
    cmd = [ "rsvg-convert", "--width=#{RENDER_WIDTH}", "--height=#{RENDER_HEIGHT}", "--format=png" ]
    out, err, status = Open3.capture3(*cmd, stdin_data: to_svg, binmode: true)
    return out if status.success?
    Rails.logger.error("[PactOgImage] rsvg-convert failed: #{err}")
    fallback_png
  end

  def png_via_imagemagick
    cmd = [ "convert", "-background", "transparent", "-density", "200",
            "svg:-", "-resize", "#{RENDER_WIDTH}x#{RENDER_HEIGHT}", "png:-" ]
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

  # 文字列を最大 max_lines 行に折り返す簡易ラッパー。
  # 漢字・かな前提で、半角は 2 文字 = 1 文字幅相当として概算する。
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

    # 最後の行が max_lines に達して余りがあれば省略記号を付ける
    if lines.size == max_lines && (chars_per_line * max_lines) < chars.size
      last = lines.last
      lines[-1] = "#{last[0...-1]}…"
    end

    lines.each_with_index.map do |line, i|
      line_y = y + (i * (font_size + 8))
      escaped = line.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
      <<~LINE.chomp
        <text x="#{x}" y="#{line_y}" font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="#{font_size}" fill="#{color}" font-weight="bold">#{escaped}</text>
      LINE
    end.join("\n")
  end

  def difficulty_marks
    n = [ [ @pact.difficulty.to_i, 0 ].max, 5 ].min
    ("⚔" * n) + ("⚔" * (5 - n))
  end

  # SignedPage と同じく「⚔ × n（seal）+ ⚔ × (5-n)（薄墨） {n}/5」を tspan で色分け表示。
  # dx は rsvg-convert / X 上のレンダラーで意図しない位置にずれる場合があるため空白で代用。
  def difficulty_marks_svg
    n = [ [ @pact.difficulty.to_i, 0 ].max, 5 ].min
    parts = []
    parts << "<tspan fill=\"#{COLOR_SEAL}\">#{'⚔' * n}</tspan>" if n.positive?
    parts << "<tspan fill=\"#{COLOR_INK}\" fill-opacity=\"0.3\">#{'⚔' * (5 - n)}</tspan>" if n < 5
    parts << "<tspan fill=\"#{COLOR_INK}\" fill-opacity=\"0.6\" font-size=\"20\">  #{n} / 5</tspan>"
    parts.join
  end

  def completed_badge
    <<~SVG
      <g transform="translate(#{WIDTH - 240}, 100)">
        <circle cx="80" cy="80" r="76" fill="#{COLOR_GOLD}" fill-opacity="0.2"
                stroke="#{COLOR_GOLD}" stroke-width="3"/>
        <text x="80" y="100" text-anchor="middle" font-size="60">🏆</text>
        <text x="80" y="172" text-anchor="middle" font-size="22"
              font-family="'Noto Serif JP', serif" fill="#{COLOR_SEAL}" font-weight="bold">成就</text>
      </g>
    SVG
  end
end
