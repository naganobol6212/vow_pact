module Api
  module V1
    class PactsController < Api::V1::BaseController
      def index
        # crest を eager load して N+1 を回避（紋章ギャラリーで参照される）
        pacts = Current.user.pacts.includes(:crest).order(created_at: :desc)
        render json: PactSerializer.new(pacts).serializable_hash, status: :ok
      end

      def show
        pact = Current.user.pacts.includes(:crest).find(params[:id])
        render json: PactSerializer.new(pact).serializable_hash, status: :ok
      end

      def create
        # signed_at はサーバ側で確定する（クライアント時計の改ざんを防ぐ）。
        pact = Current.user.pacts.create!(pact_params.merge(signed_at: Time.current))
        render json: PactSerializer.new(pact).serializable_hash, status: :created
      end

      def update
        pact = Current.user.pacts.find(params[:id])
        pact.update!(edit_params)
        render json: PactSerializer.new(pact).serializable_hash, status: :ok
      end

      # 論理削除：DB からは消さず status を abandoned に変更する
      def destroy
        pact = Current.user.pacts.find(params[:id])
        pact.update!(status: :abandoned)
        head :no_content
      end

      # POST /api/v1/pacts/:id/title
      # 称号を AI で生成して pact.title に保存し、更新後の Pact を返す。
      # 既に title が設定されている場合は再生成しない（idempotent）。
      # クライアントが任意の文字列を渡して上書きする経路を用意せず、必ずサーバ側で生成する。
      def generate_title
        pact = Current.user.pacts.find(params[:id])
        if pact.title.blank?
          titles = ::Ai::Logger.call(
            user: Current.user,
            type: :title_generation,
            model: "gpt-5.4-nano",
            input: { "goal" => pact.goal, "difficulty" => pact.difficulty }
          ) do
            ::Ai::TitleGenerator.new.generate(goal: pact.goal, difficulty: pact.difficulty)
          end
          chosen = Array(titles).first
          pact.update!(title: chosen) if chosen.present?
        end
        render json: PactSerializer.new(pact).serializable_hash, status: :ok
      end

      private

      # signed_at はクライアント値を許可しない（create 時にサーバ側で Time.current を merge）。
      def pact_params
        params.permit(:goal, :constraint_text, :difficulty, :difficulty_reason, :deadline)
      end

      # 編集可能な属性は goal / constraint_text / is_public
      # deadline / difficulty / signed_at は契約時に確定し、後から変更不可
      def edit_params
        params.permit(:goal, :constraint_text, :is_public)
      end
    end
  end
end
