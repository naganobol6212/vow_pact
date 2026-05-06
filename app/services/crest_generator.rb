class CrestGenerator
  # 達成した契約に対して紋章を生成するサービス。
  # PactCompleter から呼ばれる前提だが、independently に呼んでも安全（冪等）。
  #
  # レアリティ計算（PactCompleter と整合）:
  #   total_score = difficulty × compliance_rate × period_score
  #     - difficulty: 1..5
  #     - compliance_rate: kept_days / 期間日数（PactCompleter と同分母）
  #     - period_score: 期間日数 / 30.0、ただし 0.5..6.0 にクランプ
  #       （短すぎる契約と長すぎる契約で score が爆発しないように）
  #
  # スコア → rarity:
  #   0..1.0    → common
  #   1.0..2.5  → rare
  #   2.5..4.0  → epic
  #   それ以上  → legendary
  PERIOD_SCORE_RANGE = 0.5..6.0

  BASE_SHAPES     = %w[shield_round shield_pointed shield_square heater kite].freeze
  CENTRAL_MOTIFS  = %w[sword moon flame eye book wolf eagle dragon star phoenix].freeze
  DECORATIONS     = %w[wings chains plants stars thunderbolt].freeze
  COLOR_PALETTES  = %w[crimson_gold midnight_silver emerald_bronze indigo_pearl
                      ruby_obsidian sapphire_ivory amber_jet violet_steel
                      onyx_rose verdant_copper].freeze
  SHIMMER_BY_RARITY = { "common" => 1, "rare" => 2, "epic" => 3, "legendary" => 4 }.freeze

  def initialize(pact)
    @pact = pact
  end

  def call
    return nil unless @pact.completed?
    return @pact.crest if @pact.crest.present?  # 冪等性

    rarity = calculate_rarity
    crest_data = build_crest_data(rarity)

    Crest.create!(
      pact: @pact,
      rarity: rarity,
      crest_data: crest_data,
      generated_at: Time.current
    )
  end

  private

  def calculate_rarity
    score = @pact.difficulty * compliance_rate * period_score
    case score
    when 0..1.0   then :common
    when 1.0..2.5 then :rare
    when 2.5..4.0 then :epic
    else               :legendary
    end
  end

  # PactCompleter と同じ分母（期間日数）。チート防止 + 仕様統一。
  def compliance_rate
    expected_days = (@pact.deadline - @pact.signed_at.to_date).to_i + 1
    return 0.0 unless expected_days.positive?

    kept_days = @pact.check_ins.kept
                     .where(checked_on: @pact.signed_at.to_date..@pact.deadline)
                     .distinct
                     .count(:checked_on)

    [ kept_days.to_f / expected_days, 1.0 ].min
  end

  def period_score
    days = (@pact.deadline - @pact.signed_at.to_date).to_i + 1
    raw = days / 30.0
    raw.clamp(*PERIOD_SCORE_RANGE.minmax)
  end

  def build_crest_data(rarity)
    {
      "base_shape"     => BASE_SHAPES.sample,
      "central_motif"  => CENTRAL_MOTIFS.sample,
      "decoration"     => DECORATIONS.sample,
      "color_palette"  => COLOR_PALETTES.sample,
      "shimmer_level"  => SHIMMER_BY_RARITY.fetch(rarity.to_s, 1)
    }
  end
end
