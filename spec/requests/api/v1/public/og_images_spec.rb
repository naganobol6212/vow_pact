require "rails_helper"

RSpec.describe "Api::V1::Public::OgImages", type: :request do
  let(:user) do
    create(:user, nickname: "OG画像テスト", email: "og@example.com",
                  password: "password123", password_confirmation: "password123")
  end

  describe "GET /api/v1/public/pacts/:id/og.png" do
    context "is_public=true の契約" do
      let!(:pact) do
        p = build(:pact, user: user, goal: "OG 画像テスト目標")
        p.is_public = true
        p.save!(validate: false)
        p
      end

      it "200 OK で image/png を返す" do
        get "/api/v1/public/pacts/#{pact.id}/og.png"
        expect(response).to have_http_status(:ok)
        expect(response.media_type).to eq("image/png")
        expect(response.body.bytesize).to be > 0
      end

      it "ETag と Last-Modified を返す（条件付き GET 用）" do
        get "/api/v1/public/pacts/#{pact.id}/og.png"
        expect(response.headers["ETag"]).to be_present
        expect(response.headers["Last-Modified"]).to be_present
      end

      it "If-None-Match 付きで叩くと 304 Not Modified を返す（生成スキップ）" do
        get "/api/v1/public/pacts/#{pact.id}/og.png"
        etag = response.headers["ETag"]

        get "/api/v1/public/pacts/#{pact.id}/og.png", headers: { "If-None-Match" => etag }
        expect(response).to have_http_status(:not_modified)
      end

      it "キャッシュ可能（Cache-Control: public）" do
        get "/api/v1/public/pacts/#{pact.id}/og.png"
        expect(response.headers["Cache-Control"]).to include("public")
      end
    end

    context "is_public=false の契約" do
      let!(:private_pact) do
        p = build(:pact, user: user, goal: "ひみつ")
        p.is_public = false
        p.save!(validate: false)
        p
      end

      it "404 Not Found を返す" do
        get "/api/v1/public/pacts/#{private_pact.id}/og.png"
        expect(response).to have_http_status(:not_found)
      end
    end

    context "存在しない id" do
      it "404 Not Found を返す" do
        get "/api/v1/public/pacts/999999/og.png"
        expect(response).to have_http_status(:not_found)
      end
    end

    context "Rails.cache に PNG を保存する（初回生成 → 以降 cache hit）" do
      # 本番では Solid Cache、テストでは :null_store がデフォルトで保存されないため、
      # 一時的に memory_store に切り替えて挙動を検証する。
      around do |example|
        original = Rails.cache
        Rails.application.config.action_controller.perform_caching = true
        Rails.cache = ActiveSupport::Cache::MemoryStore.new
        example.run
      ensure
        Rails.cache = original
      end

      let!(:pact) do
        p = build(:pact, user: user, goal: "キャッシュ検証")
        p.is_public = true
        p.save!(validate: false)
        p
      end

      it "1 回目のリクエストで PactOgImageGenerator が呼ばれ、2 回目は cache から返す" do
        png_bytes = "fake-png-bytes"
        allow_any_instance_of(PactOgImageGenerator).to receive(:to_png).and_return(png_bytes)

        # 1 回目: 生成が走る
        get "/api/v1/public/pacts/#{pact.id}/og.png"
        expect(response).to have_http_status(:ok)
        expect(response.body).to eq(png_bytes)

        # cache key には pact.id と updated_at が含まれている
        cached = Rails.cache.read([ "pact_og_image", pact.id, pact.updated_at.to_i ])
        expect(cached).to eq(png_bytes)

        # 2 回目: 別のリクエストでも生成は走らない（fresh_when の 304 を避けるため別の curl 相当）
        # ETag を変えるために cache_key だけが効くようキャッシュを別途検証
        expect_any_instance_of(PactOgImageGenerator).not_to receive(:to_png)
        get "/api/v1/public/pacts/#{pact.id}/og.png", headers: { "If-None-Match" => "different-etag" }
        # If-None-Match が一致しないので 200 で再ヒット → cache から返却
        expect(response).to have_http_status(:ok)
        expect(response.body).to eq(png_bytes)
      end
    end
  end
end
