# SPA エントリポイント専用。React 起動用 HTML（layouts/application.html.erb）を配信する。
# ApplicationController（ActionController::API + 認証必須）を継承しない理由：
# - HTML view レンダリング機能が必要（ActionController::API は制限あり）
# - ログイン前のユーザーにも届ける必要がある（認証スキップではなく構造的に分離）
class HomeController < ActionController::Base
  layout "application"

  def index
  end
end
