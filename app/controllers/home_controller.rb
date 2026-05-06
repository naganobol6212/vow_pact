# SPA エントリポイント専用。React 起動用 HTML（layouts/application.html.erb）を配信する。
# ApplicationController（ActionController::API + 認証必須）を継承しない理由：
# - HTML view レンダリング機能が必要（ActionController::API は制限あり）
# - ログイン前のユーザーにも届ける必要がある（認証スキップではなく構造的に分離）
class HomeController < ActionController::Base
  layout "application"

  def index
  end

  # 公開契約ページ（/p/:id）。
  # X クローラーは JS を実行しないため、OGP meta タグを HTML に直接埋め込んで配信する。
  # 公開設定 OFF / 存在しない id でも 200 で SPA を返し、React 側で「見つかりません」を表示。
  def public_pact
    @pact = Pact.where(is_public: true).includes(:user).find_by(id: params[:id])
    render :index
  end
end
