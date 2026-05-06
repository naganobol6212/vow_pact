module Api
  module V1
    class RankingsController < Api::V1::BaseController
      TOP_LIMIT = 10

      # GET /api/v1/rankings/monthly
      # 「今月 completed になった pact 数」のランキング。
      # is_public = true のユーザーのみ一覧表示、自分は private でも my_rank を返す。
      def monthly
        # Date#end_of_month は 00:00:00 として解釈されるため、月末当日の datetime レコードが
        # ほぼ取得できない。Time.zone.now を使って TimeWithZone（23:59:59.999...）にする。
        now         = Time.zone.now
        month_start = now.beginning_of_month
        month_end   = now.end_of_month

        # ユーザーごとの completed 数を算出
        scores = Pact.completed
                     .where(completed_at: month_start..month_end)
                     .group(:user_id)
                     .count

        rankings = build_monthly_rankings(scores)
        my_rank  = build_monthly_my_rank(scores, rankings)

        render json: {
          month: Time.zone.today.strftime("%Y-%m"),
          rankings: rankings,
          my_rank: my_rank
        }, status: :ok
      end

      # GET /api/v1/rankings/streak
      # users.streak_count による連続日数ランキング。
      def streak
        # streak_count = 0 のユーザーは除外（圏外なので一覧に出さない）。
        public_users = User.where(is_public: true)
                           .where("streak_count > 0")
                           .order(streak_count: :desc, updated_at: :asc, id: :asc)
                           # TOP_LIMIT 件 + α を取れば、同点タイ用に余裕を持って取れる。
                           .limit(TOP_LIMIT * 2)

        rankings = []
        last_score = nil
        last_rank = 0
        public_users.each_with_index do |u, idx|
          # 直前のスコアと比較する（last_score を更新する前に）
          # TOP_LIMIT 件に達していて、かつスコアが変わったら終了。
          # 同点タイは TOP_LIMIT を超えても全員含める。
          break if rankings.size >= TOP_LIMIT && u.streak_count != last_score

          rank = (u.streak_count == last_score) ? last_rank : idx + 1
          last_score = u.streak_count
          last_rank  = rank
          rankings << { rank: rank, user: user_summary(u), streak_count: u.streak_count }
        end

        my_rank = build_streak_my_rank
        render json: { rankings: rankings, my_rank: my_rank }, status: :ok
      end

      private

      def build_monthly_rankings(scores)
        users = User.where(is_public: true, id: scores.keys).index_by(&:id)
        sorted = scores
                 .select { |uid, _| users.key?(uid) }
                 .map { |uid, count| [ users[uid], count ] }
                 .sort_by { |u, count| [ -count, u.updated_at, u.id ] }

        rankings = []
        last_score = nil
        last_rank = 0
        sorted.each_with_index do |(u, count), idx|
          # 同点タイは TOP_LIMIT を超えても全員含める（streak と挙動を揃える）。
          break if rankings.size >= TOP_LIMIT && count != last_score

          rank = (count == last_score) ? last_rank : idx + 1
          last_score = count
          last_rank = rank
          rankings << { rank: rank, user: user_summary(u), achievement_count: count }
        end
        rankings
      end

      def build_monthly_my_rank(scores, rankings)
        my_count = scores[Current.user.id] || 0
        # 自分の順位は「自分より高い score を持つ public users + 自分」で計算
        higher = User.where(is_public: true)
                     .where.not(id: Current.user.id)
                     .where(id: scores.select { |_, c| c > my_count }.keys)
                     .count
        my_rank_value = higher + 1

        # 自分が圏外なら my_rank.rank は nil
        my_rank_value = nil if my_count.zero? && rankings.none? { |r| r[:user][:id] == Current.user.id }

        { rank: my_rank_value, achievement_count: my_count }
      end

      def build_streak_my_rank
        my_streak = Current.user.streak_count
        higher = User.where(is_public: true)
                     .where.not(id: Current.user.id)
                     .where("streak_count > ?", my_streak)
                     .count
        my_rank_value = my_streak.zero? ? nil : higher + 1
        { rank: my_rank_value, streak_count: my_streak }
      end

      def user_summary(u)
        { id: u.id, nickname: u.nickname, avatar_url: u.avatar_url }
      end
    end
  end
end
