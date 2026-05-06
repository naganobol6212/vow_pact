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
      # 「契約を 1 件以上持つ public ユーザー」が母集団。
      # 0 日のユーザーも含めて表示する（契約直後でも順位を見える化するため）。
      def streak
        public_users = ranking_candidate_users
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
        # 母集団: 契約を 1 件以上持つ public ユーザー。達成 0 件でも母集団に含めて表示する。
        candidates = ranking_candidate_users.index_by(&:id)

        sorted = candidates.values
                           .map { |u| [ u, scores[u.id] || 0 ] }
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

      def build_monthly_my_rank(scores, _rankings)
        my_count = scores[Current.user.id] || 0
        my_rank_value =
          if current_user_in_scope?
            # 自分より高い score を持つ public + pact 持ちユーザーの数 + 1
            higher = ranking_candidate_users
                       .where.not(id: Current.user.id)
                       .where(id: scores.select { |_, c| c > my_count }.keys)
                       .count
            higher + 1
          end

        { rank: my_rank_value, achievement_count: my_count }
      end

      def build_streak_my_rank
        my_streak = Current.user.streak_count
        my_rank_value =
          if current_user_in_scope?
            higher = ranking_candidate_users
                       .where.not(id: Current.user.id)
                       .where("streak_count > ?", my_streak)
                       .count
            higher + 1
          end

        { rank: my_rank_value, streak_count: my_streak }
      end

      # ランキング母集団: 契約を 1 件以上持つ public ユーザー。
      # SELECT DISTINCT を使うと order(streak_count) と整合しないため、サブクエリで絞り込む。
      def ranking_candidate_users
        User.where(is_public: true).where(id: Pact.select(:user_id))
      end

      # ログイン中のユーザーがランキング表示対象に入るか
      def current_user_in_scope?
        Current.user.is_public && Current.user.pacts.exists?
      end

      def user_summary(u)
        { id: u.id, nickname: u.nickname, avatar_url: u.avatar_url }
      end
    end
  end
end
