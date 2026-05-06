class PactCompleter
  # 契約の達成判定とステータス更新を担当するサービス。
  # 仕様（Codex レビュー反映後の MVP 版）:
  # - active な契約のみ対象
  # - Time.zone.today >= pact.deadline で判定
  # - 分母 = signed_at.to_date..deadline の日数
  # - 分子 = 期間内の kept チェックインの distinct(checked_on) 件数
  # - kept_days >= 1 かつ kept_days / expected_days >= 0.5 で completed
  # - completed は不可逆（後から訂正されても active に戻らない）
  COMPLIANCE_THRESHOLD = 0.5

  def initialize(pact)
    @pact = pact
  end

  def call
    return @pact unless completable?

    @pact.update!(status: :completed, completed_at: Time.current)
    enqueue_crest_generation_later
    @pact
  end

  private

  def completable?
    return false unless @pact.active?
    return false unless Time.zone.today >= @pact.deadline

    expected_days = (@pact.deadline - @pact.signed_at.to_date).to_i + 1
    return false unless expected_days.positive?

    kept_days = @pact.check_ins.kept
                     .where(checked_on: @pact.signed_at.to_date..@pact.deadline)
                     .distinct
                     .count(:checked_on)

    kept_days.positive? && kept_days.to_f / expected_days >= COMPLIANCE_THRESHOLD
  end

  # 達成した契約に紋章を付与する。
  # MVP は同期生成（CrestGenerator は完全に Ruby 内処理で外部依存なし）。
  # 将来 OpenAI で画像生成等を組み込む場合は Solid Queue にジョブ化する想定。
  def enqueue_crest_generation_later
    CrestGenerator.new(@pact).call
  end
end
