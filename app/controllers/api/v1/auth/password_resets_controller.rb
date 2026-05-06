module Api
  module V1
    module Auth
      # パスワード再設定の 3 動作を担当：
      # - POST   /api/v1/auth/password_resets         ：再設定メール送信を依頼
      # - GET    /api/v1/auth/password_resets/:token  ：トークン検証（フロントが事前確認用）
      # - PATCH  /api/v1/auth/password_resets/:token  ：新パスワードを設定
      #
      # セキュリティ:
      # - user enumeration 防止：存在しない email でも 200 OK を返す
      # - トークン：urlsafe_base64(32)、有効期限 30 分、一回限り使用
      # - レート制限：1 ユーザー 1 時間 5 回まで
      class PasswordResetsController < Api::V1::BaseController
        allow_unauthenticated_access only: %i[create show update]
        skip_forgery_protection only: %i[create update]

        RESET_RATE_LIMIT = 5
        RESET_RATE_WINDOW = 1.hour

        # POST /api/v1/auth/password_resets
        # body: { email }
        # 常に 202 Accepted を返す（user enumeration 防止）
        def create
          email = params[:email].to_s.strip.downcase
          user = User.find_by(email: email)

          if user.present? && !user.is_guest? && rate_limit_ok?(user)
            token = PasswordResetToken.issue_for!(user)
            PasswordsMailer.reset(token).deliver_later
          end

          # 結果に関わらず同じレスポンスを返す（メアド存在の漏洩防止）
          render json: { message: "再設定リンクを記載したメールを送信しました（該当アカウントが存在する場合）" },
                 status: :accepted
        end

        # GET /api/v1/auth/password_resets/:token
        # トークンが有効か検証する（フロントの事前確認用）
        def show
          token = PasswordResetToken.find_by(token: params[:token])
          unless token && !token.expired? && !token.used?
            render json: {
              errors: [ { code: "invalid_or_expired_token", message: "リンクが無効または期限切れです" } ]
            }, status: :not_found
            return
          end
          render json: { valid: true }, status: :ok
        end

        # PATCH /api/v1/auth/password_resets/:token
        # body: { password, password_confirmation }
        def update
          token = PasswordResetToken.find_by(token: params[:token])
          unless token
            render json: {
              errors: [ { code: "invalid_or_expired_token", message: "リンクが無効です" } ]
            }, status: :not_found
            return
          end

          token.consume!(
            password: params[:password],
            password_confirmation: params[:password_confirmation]
          )
          head :no_content
        rescue ArgumentError => e
          render json: {
            errors: [ { code: "invalid_or_expired_token", message: e.message } ]
          }, status: :unprocessable_entity
        end

        private

        def rate_limit_ok?(user)
          recent_count = user.password_reset_tokens
                             .where(created_at: RESET_RATE_WINDOW.ago..)
                             .count
          recent_count < RESET_RATE_LIMIT
        end
      end
    end
  end
end
