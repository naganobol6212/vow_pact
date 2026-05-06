require "open3"

# 公開された契約から、X (Twitter) カードや OGP に表示する PNG 画像を生成する。
# Twitter カードの推奨サイズは 1200x630（summary_large_image）。
# 中世ファンタジー風の羊皮紙デザインで、契約の「目標」「制約」「期日」「難易度」を表示。
class PactOgImageGenerator
  WIDTH = 1200
  HEIGHT = 630

  COLOR_PARCHMENT = "#f4e8d0"
  COLOR_INK       = "#2c1810"
  COLOR_SEAL      = "#8b1a1a"
  COLOR_GOLD      = "#c9a961"

  def initialize(pact)
    @pact = pact
  end

  # SVG 文字列を返す。
  # PNG に変換する場合は #to_png を呼ぶ（ImageMagick 必須）。
  def to_svg
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

        <!-- 二重罫線 -->
        <rect x="36" y="36" width="#{WIDTH - 72}" height="#{HEIGHT - 72}" fill="none" stroke="#{COLOR_GOLD}" stroke-width="2"/>
        <rect x="48" y="48" width="#{WIDTH - 96}" height="#{HEIGHT - 96}" fill="none" stroke="#{COLOR_GOLD}" stroke-width="1" stroke-opacity="0.5"/>

        <!-- 上部ロゴ：誓約 ⚔ 契約 -->
        <text x="#{WIDTH / 2}" y="120" text-anchor="middle"
              font-family="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
              font-size="42" font-weight="bold" fill="#{COLOR_SEAL}">
          誓約 <tspan fill="#{COLOR_GOLD}">⚔</tspan> 契約
        </text>
        <text x="#{WIDTH / 2}" y="160" text-anchor="middle"
              font-family="'Cormorant Garamond', serif" font-size="20"
              fill="#{COLOR_GOLD}" letter-spacing="6">VOW PACT</text>

        <!-- セパレータ -->
        <line x1="#{WIDTH / 2 - 200}" y1="200" x2="#{WIDTH / 2 + 200}" y2="200"
              stroke="#{COLOR_GOLD}" stroke-width="1.5"/>

        <!-- 「誓い」のラベル -->
        <text x="100" y="260" font-family="'Noto Serif JP', serif" font-size="22"
              fill="#{COLOR_INK}" fill-opacity="0.6">目標</text>

        <!-- 目標本文 -->
        #{wrap_text(@pact.goal, x: 100, y: 305, width: 980, font_size: 36, color: COLOR_INK, max_lines: 2)}

        <!-- 制約 -->
        <text x="100" y="400" font-family="'Noto Serif JP', serif" font-size="22"
              fill="#{COLOR_INK}" fill-opacity="0.6">制約</text>
        #{wrap_text(@pact.constraint_text, x: 100, y: 440, width: 980, font_size: 28, color: COLOR_INK, max_lines: 2)}

        <!-- 下段：期日 / 難易度 -->
        <text x="100" y="540" font-family="'Noto Serif JP', serif" font-size="22"
              fill="#{COLOR_INK}" fill-opacity="0.6">期日</text>
        <text x="100" y="580" font-family="'Noto Serif JP', serif" font-size="32"
              fill="#{COLOR_INK}">#{@pact.deadline}</text>

        <text x="700" y="540" font-family="'Noto Serif JP', serif" font-size="22"
              fill="#{COLOR_INK}" fill-opacity="0.6">難易度</text>
        <text x="700" y="582" font-family="'Noto Serif JP', serif" font-size="36"
              fill="#{COLOR_SEAL}">#{difficulty_marks}</text>

        <!-- 達成済みなら左上に紋章バッジ -->
        #{@pact.completed? ? completed_badge : ""}
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
    cmd = [ "rsvg-convert", "--width=#{WIDTH}", "--height=#{HEIGHT}", "--format=png" ]
    out, err, status = Open3.capture3(*cmd, stdin_data: to_svg, binmode: true)
    return out if status.success?
    Rails.logger.error("[PactOgImage] rsvg-convert failed: #{err}")
    fallback_png
  end

  def png_via_imagemagick
    cmd = [ "convert", "-background", "transparent", "-density", "144", "svg:-", "png:-" ]
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
