require "rails_helper"

# /api/v1/public/pacts と /api/v1/public/pacts/:id（広場 + 個別公開ページ用）。
# 認証不要で is_public=true の契約だけを返す。
RSpec.describe "Api::V1::Public::Pacts", type: :request do
  let!(:author_a) { create(:user, nickname: "誓約者A", email: "a@example.com") }
  let!(:author_b) { create(:user, nickname: "誓約者B", email: "b@example.com") }

  # is_public=true の契約を作るヘルパー。validate スキップで is_public を立てる
  # （Pact は is_public のバリデーションを持たないが、保険として）
  def make_public_pact(user:, goal:, signed_at: 1.day.ago)
    p = build(:pact, user: user, goal: goal, signed_at: signed_at,
                      deadline: 30.days.from_now)
    p.is_public = true
    p.save!(validate: false)
    p
  end

  def make_private_pact(user:, goal:)
    p = build(:pact, user: user, goal: goal, deadline: 30.days.from_now)
    p.is_public = false
    p.save!(validate: false)
    p
  end

  describe "GET /api/v1/public/pacts" do
    it "認証なしで 200 OK を返す（広場は誰でも閲覧可能）" do
      make_public_pact(user: author_a, goal: "毎日 30 分読書")

      get "/api/v1/public/pacts", as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["pacts"]).to be_an(Array)
    end

    it "is_public=true の契約だけを返し、非公開は除外する" do
      make_public_pact(user: author_a, goal: "公開契約")
      make_private_pact(user: author_a, goal: "非公開契約")

      get "/api/v1/public/pacts", as: :json

      goals = response.parsed_body["pacts"].map { |p| p["goal"] }
      expect(goals).to include("公開契約")
      expect(goals).not_to include("非公開契約")
    end

    it "新着順 (signed_at desc) に並ぶ" do
      old = make_public_pact(user: author_a, goal: "古い契約", signed_at: 10.days.ago)
      new = make_public_pact(user: author_b, goal: "新しい契約", signed_at: 1.hour.ago)

      get "/api/v1/public/pacts", as: :json

      ids = response.parsed_body["pacts"].map { |p| p["id"] }
      # 新→古 の順
      expect(ids.index(new.id)).to be < ids.index(old.id)
    end

    it "投稿者情報（nickname / avatar_*）を author キーに含める" do
      make_public_pact(user: author_a, goal: "誓約 X")

      get "/api/v1/public/pacts", as: :json

      author = response.parsed_body["pacts"].first["author"]
      expect(author["nickname"]).to eq("誓約者A")
      expect(author).to have_key("avatar_image_url")
      expect(author).to have_key("avatar_url")
    end

    # 本番（Render）で FRONTEND_URL の設定漏れにより avatar URL が
    # http://localhost:3000/... となり Mixed Content でブロックされる事故が
    # 発生したため、Render が自動付与する RENDER_EXTERNAL_URL を二次 fallback
    # として参照する。
    context "FRONTEND_URL が未設定で RENDER_EXTERNAL_URL が設定されている場合" do
      around do |example|
        original_frontend = ENV["FRONTEND_URL"]
        original_render = ENV["RENDER_EXTERNAL_URL"]
        ENV.delete("FRONTEND_URL")
        ENV["RENDER_EXTERNAL_URL"] = "https://vow-pact.onrender.com"
        example.run
      ensure
        ENV["FRONTEND_URL"] = original_frontend
        if original_render
          ENV["RENDER_EXTERNAL_URL"] = original_render
        else
          ENV.delete("RENDER_EXTERNAL_URL")
        end
      end

      it "author.avatar_image_url が RENDER_EXTERNAL_URL のドメインで返る" do
        pact = make_public_pact(user: author_a, goal: "誓約 X")
        author_a.avatar.attach(
          io: StringIO.new("dummy-png"),
          filename: "avatar.png",
          content_type: "image/png"
        )

        get "/api/v1/public/pacts", as: :json

        author = response.parsed_body["pacts"].find { |p| p["id"] == pact.id }["author"]
        expect(author["avatar_image_url"]).to start_with("https://vow-pact.onrender.com/")
        expect(author["avatar_image_url"]).to include("/rails/active_storage/")
      end
    end

    context "ページネーション" do
      before do
        # 25 件作って per_page=20 を確認
        25.times do |i|
          make_public_pact(user: author_a, goal: "契約 #{i}", signed_at: (i + 1).days.ago)
        end
      end

      it "デフォルトで page=1, per_page=20 を返す" do
        get "/api/v1/public/pacts", as: :json

        body = response.parsed_body
        expect(body["pacts"].size).to eq(20)
        expect(body["page"]).to eq(1)
        expect(body["per_page"]).to eq(20)
        expect(body["total_count"]).to eq(25)
        expect(body["next_page"]).to eq(2)
      end

      it "page=2 で残り 5 件を返し、next_page は nil" do
        get "/api/v1/public/pacts", params: { page: 2 }, as: :json

        body = response.parsed_body
        expect(body["pacts"].size).to eq(5)
        expect(body["page"]).to eq(2)
        expect(body["next_page"]).to be_nil
      end

      it "巨大な page でもクラッシュせず空配列を返す" do
        get "/api/v1/public/pacts", params: { page: 99_999 }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["pacts"]).to eq([])
      end
    end
  end

  describe "GET /api/v1/public/pacts/:id" do
    it "is_public=true の契約は 200 OK で詳細を返す" do
      pact = make_public_pact(user: author_a, goal: "公開契約 Y")

      get "/api/v1/public/pacts/#{pact.id}", as: :json

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["goal"]).to eq("公開契約 Y")
    end

    it "is_public=false の契約は 404（存在を隠す）" do
      pact = make_private_pact(user: author_a, goal: "非公開契約 Z")

      get "/api/v1/public/pacts/#{pact.id}", as: :json

      expect(response).to have_http_status(:not_found)
    end
  end
end
