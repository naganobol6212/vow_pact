module Api
  module V1
    module Auth
      # 「ログインせずに試す」用のゲストユーザーを作成し、即時ログイン状態にする。
      # メールアドレス入力・パスワード入力は不要（サーバ側で auto-generated）。
      # 後で /api/v1/auth/promote から本登録ユーザーへ昇格できる。
      class GuestsController < Api::V1::BaseController
        allow_unauthenticated_access only: [ :create ]
        skip_forgery_protection only: [ :create ]

        def create
          user = User.create_guest!
          start_new_session_for(user)
          render json: UserSerializer.new(user).serializable_hash, status: :created
        end
      end
    end
  end
end
