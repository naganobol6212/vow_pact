class StreakCalculator
  # 仕様（Issue #12 / docs/data_model.md / Codex レビュー反映後）:
  # - 起点は「今日 OR 昨日」。今日も昨日も kept が無ければ streak = 0
  # - 同日に複数契約で kept があっても 1 日 1 カウント
  # - kept     : 連続を伸ばす
  # - broken   : そこで連続が切れる
  # - skipped  : 切らないが伸ばさない（その日は飛ばして前日と接続）
  # - abandoned / completed の契約のチェックインも履歴として算入する（過去達成は奪わない）
  def initialize(user)
    @user = user
  end

  def recalculate!
    # 同一 user の並行 check-in で streak がレースしないよう row lock を取る。
    @user.with_lock do
      new_streak = calculate_current_streak
      new_longest = [ @user.longest_streak.to_i, new_streak ].max
      @user.update_columns(
        streak_count: new_streak,
        longest_streak: new_longest,
        updated_at: Time.current
      )
    end
  end

  private

  def calculate_current_streak
    statuses_by_date = build_statuses_by_date
    return 0 if statuses_by_date.empty?

    today = Time.zone.today
    cursor = decide_starting_cursor(statuses_by_date, today)
    return 0 if cursor.nil?

    walk_back_streak(statuses_by_date, cursor)
  end

  # その日の「最終的な扱い」を 1 つに集約：
  # 同日 kept があれば :kept、kept が無く broken があれば :broken、
  # 残りは :skipped。kept 優先（複数契約で 1 日 1 カウントの実現）。
  def build_statuses_by_date
    # Rails の enum は pluck で文字列を返す（"kept" / "broken" / "skipped"）。
    rows = @user.check_ins.pluck(:checked_on, :status)
    grouped = rows.group_by(&:first)
    grouped.transform_values do |arr|
      statuses = arr.map { |row| row[1].to_sym }.uniq
      next :kept   if statuses.include?(:kept)
      next :broken if statuses.include?(:broken)
      :skipped
    end
  end

  # 起点：今日 kept / skipped なら今日から、昨日 kept / skipped なら昨日から、
  # それ以外（broken or 何も無い）は streak = 0
  def decide_starting_cursor(statuses_by_date, today)
    today_status = statuses_by_date[today]
    return today if today_status == :kept
    return today if today_status == :skipped

    yesterday = today - 1
    yesterday_status = statuses_by_date[yesterday]
    return nil if today_status == :broken
    return yesterday if yesterday_status == :kept
    return yesterday if yesterday_status == :skipped

    nil
  end

  # cursor から逆順に走査して連続日数を数える。
  # kept で +1、skipped はスキップ（前日と接続）、broken or 履歴無しで終了。
  def walk_back_streak(statuses_by_date, cursor)
    streak = 0
    while cursor
      status = statuses_by_date[cursor]
      case status
      when :kept
        streak += 1
        cursor -= 1
      when :skipped
        cursor -= 1
      else # :broken or nil
        break
      end
    end
    streak
  end
end
