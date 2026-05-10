require "rails_helper"

# /p/:id は X クローラー（Twitterbot 等）が JS を実行しなくても OGP を取得できるよう、
# サーバーサイドで og:* / twitter:* meta タグを HTML に埋め込んで配信するルート。
RSpec.describe "/p/:id 公開契約シェアページ", type: :request do
  let!(:user) do
    create(:user, nickname: "テスト誓約者", email: "share@example.com",
                  password: "password123", password_confirmation: "password123")
  end

  describe "GET /p/:id" do
    context "is_public=true の契約の場合" do
      let!(:pact) do
        # validate スキップで is_public=true な契約を作る
        p = build(:pact, user: user, goal: "毎日 30 分読書する",
                          constraint_text: "夜 22 時以降スマホを触らない",
                          deadline: Date.parse("2026-06-30"))
        p.is_public = true
        p.save!(validate: false)
        p
      end

      it "200 OK で HTML を返す" do
        get "/p/#{pact.id}"
        expect(response).to have_http_status(:ok)
        expect(response.media_type).to eq("text/html")
      end

      it "OGP meta タグ（og:image / twitter:image 含む）を HTML に直接埋め込む" do
        get "/p/#{pact.id}"
        body = response.body

        # 主要 meta が存在すること
        expect(body).to include('property="og:title"')
        expect(body).to include('property="og:description"')
        expect(body).to include('property="og:url"')
        expect(body).to include('name="twitter:card"')

        # 動的 OG 画像生成（PR 6 で再有効化）。og:image / twitter:image を出し、
        # twitter:card は summary_large_image。
        expect(body).to include('property="og:image"')
        expect(body).to include('name="twitter:image"')
        expect(body).to include('content="summary_large_image"')
        # og:image の URL は /api/v1/public/pacts/:id/og.png を指す
        expect(body).to match(%r{/api/v1/public/pacts/#{pact.id}/og\.png})
        # 推奨サイズ
        expect(body).to include('property="og:image:width"')
        expect(body).to include('content="1200"')
        expect(body).to include('property="og:image:height"')
        expect(body).to include('content="630"')

        # 契約の中身が description / title に入っている
        expect(body).to include("毎日 30 分読書する")
        expect(body).to include("夜 22 時以降スマホを触らない")
        expect(body).to include("テスト誓約者")
      end
    end

    context "is_public=false の契約の場合" do
      let!(:private_pact) do
        p = build(:pact, user: user, goal: "ひみつの目標",
                          deadline: Date.parse("2026-06-30"))
        p.is_public = false
        p.save!(validate: false)
        p
      end

      it "200 OK だが OGP meta は付かない（React 側で「見つかりません」表示）" do
        get "/p/#{private_pact.id}"
        expect(response).to have_http_status(:ok)
        expect(response.body).not_to include('property="og:title"')
        expect(response.body).not_to include("ひみつの目標")
      end
    end

    context "存在しない id の場合" do
      it "200 OK だが OGP meta は付かない" do
        get "/p/999999"
        expect(response).to have_http_status(:ok)
        expect(response.body).not_to include('property="og:title"')
      end
    end
  end
end
