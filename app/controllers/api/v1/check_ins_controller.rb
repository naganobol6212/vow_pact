module Api
  module V1
    class CheckInsController < Api::V1::BaseController
      before_action :set_pact

      # 不正な enum 値（"invalid_status" など）が渡されると Rails は ArgumentError を
      # 投げて 500 で落ちるため、422 に変換してクライアント側でハンドルできるようにする。
      rescue_from ArgumentError, with: :render_invalid_argument

      # GET /api/v1/pacts/:pact_id/check_ins?month=YYYY-MM
      # month を渡された場合は当該月のみ、未指定なら全件返す（カレンダー UI 用）。
      def index
        scope = @pact.check_ins.order(checked_on: :desc)
        if params[:month].present?
          range = month_range(params[:month])
          scope = scope.where(checked_on: range)
        end
        render json: CheckInSerializer.new(scope).serializable_hash, status: :ok
      end

      # POST /api/v1/pacts/:pact_id/check_ins
      def create
        # checked_on / pact_id はクライアント受付不可（チート防止）
        attrs = check_in_params
        check_in, created = ApplicationRecord.transaction do
          ci, c = CheckIns::Upsert.call(pact: @pact, status: attrs[:status], note: attrs[:note])
          PactCompleter.new(@pact).call
          [ ci, c ]
        end

        @pact.reload
        achieved = @pact.completed? && @pact.completed_at.present? &&
                   @pact.completed_at >= 1.minute.ago
        status_code = created ? :created : :ok

        render json: {
          check_in: CheckInSerializer.new(check_in).to_h,
          pact: PactSerializer.new(@pact).to_h,
          achieved: achieved
        }, status: status_code
      end

      # DELETE /api/v1/pacts/:pact_id/check_ins/:id
      # 認可は二段階：自分の pact 配下のみ + その pact の check_ins のみ。
      def destroy
        check_in = @pact.check_ins.find(params[:id])
        check_in.destroy!
        head :no_content
      end

      private

      def set_pact
        @pact = Current.user.pacts.find(params[:pact_id])
      end

      # クライアントから受け取れるのは status / note のみ。
      # checked_on / pact_id はサーバ側で確定する（チート防止）。
      def check_in_params
        params.permit(:status, :note)
      end

      def render_invalid_argument(exception)
        render json: {
          errors: [ { code: "invalid_argument", field: "status", message: exception.message } ]
        }, status: :unprocessable_entity
      end

      # "2026-05" 形式 → Date 範囲。形式不正なら今月にフォールバック。
      def month_range(month_str)
        year, month = month_str.split("-").map(&:to_i)
        start_date = Date.new(year, month, 1)
        start_date..start_date.end_of_month
      rescue StandardError
        Time.zone.today.beginning_of_month..Time.zone.today.end_of_month
      end
    end
  end
end
