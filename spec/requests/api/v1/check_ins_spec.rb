require "rails_helper"

RSpec.describe "Api::V1::CheckIns", type: :request do
  let!(:user) do
    create(:user, email: "test@example.com",
           password: "password123", password_confirmation: "password123")
  end
  let(:login_params) { { email: "test@example.com", password: "password123" } }
  let!(:pact) { create(:pact, user: user, signed_at: 3.days.ago) }

  before { post "/api/v1/auth/login", params: login_params, as: :json }

  describe "POST /api/v1/pacts/:pact_id/check_ins" do
    context "新規作成（同日初回）" do
      it "201 Created を返し、check_in / pact / achieved を含むレスポンスを返す" do
        expect {
          post "/api/v1/pacts/#{pact.id}/check_ins", params: { status: "kept", note: "やった" }, as: :json
        }.to change(CheckIn, :count).by(1)

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["check_in"]["status"]).to eq("kept")
        expect(body["check_in"]["note"]).to eq("やった")
        expect(body["check_in"]["checked_on"]).to eq(Time.zone.today.to_s)
        expect(body["pact"]["id"]).to eq(pact.id)
        expect(body["achieved"]).to be false
      end
    end

    context "同日 2 回（訂正）" do
      before do
        post "/api/v1/pacts/#{pact.id}/check_ins", params: { status: "kept" }, as: :json
      end

      it "200 OK を返し、新規レコードは増えず status が更新される" do
        expect {
          post "/api/v1/pacts/#{pact.id}/check_ins", params: { status: "broken", note: "破った" }, as: :json
        }.not_to change(CheckIn, :count)

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["check_in"]["status"]).to eq("broken")
        expect(body["check_in"]["note"]).to eq("破った")
      end
    end

    context "checked_on を渡してもサーバー側で当日に上書きされる（チート防止）" do
      it "クライアント値は無視される" do
        post "/api/v1/pacts/#{pact.id}/check_ins",
             params: { status: "kept", checked_on: "2020-01-01" }, as: :json

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["check_in"]["checked_on"]).to eq(Time.zone.today.to_s)
      end
    end

    context "他人の pact に POST すると" do
      let!(:other_user) { create(:user, email: "other@example.com") }
      let!(:other_pact) { create(:pact, user: other_user, signed_at: 1.day.ago) }

      it "404 Not Found を返す" do
        post "/api/v1/pacts/#{other_pact.id}/check_ins", params: { status: "kept" }, as: :json
        expect(response).to have_http_status(:not_found)
      end
    end

    context "active でない pact への POST" do
      it "422 Unprocessable Content（pact_must_be_active）" do
        pact.update!(status: :abandoned)
        post "/api/v1/pacts/#{pact.id}/check_ins", params: { status: "kept" }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    context "未ログイン" do
      it "401 Unauthorized を返す" do
        delete "/api/v1/auth/logout"
        post "/api/v1/pacts/#{pact.id}/check_ins", params: { status: "kept" }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "達成判定（completed 化）" do
      let!(:completable_pact) do
        # deadline が今日の pact を validation skip で作る
        p = build(:pact, user: user, signed_at: 1.day.ago.beginning_of_day, deadline: Time.zone.today)
        p.save!(validate: false)
        # 期間 2 日中、昨日 kept（既に 50%）
        p.check_ins.new(checked_on: Time.zone.today - 1, status: :kept).save!(validate: false)
        p
      end

      it "今日 kept にすると completed に遷移し achieved=true を返す" do
        post "/api/v1/pacts/#{completable_pact.id}/check_ins",
             params: { status: "kept" }, as: :json

        expect(response).to have_http_status(:created)
        body = response.parsed_body
        expect(body["pact"]["status"]).to eq("completed")
        expect(body["achieved"]).to be true
      end
    end
  end

  describe "GET /api/v1/pacts/:pact_id/check_ins" do
    before do
      pact.check_ins.new(checked_on: 2.days.ago.to_date, status: :kept).save!(validate: false)
      pact.check_ins.new(checked_on: 1.day.ago.to_date, status: :broken).save!(validate: false)
      pact.check_ins.new(checked_on: Time.zone.today, status: :kept).save!(validate: false)
    end

    it "全件返す（checked_on 降順）" do
      get "/api/v1/pacts/#{pact.id}/check_ins"
      expect(response).to have_http_status(:ok)
      list = response.parsed_body
      expect(list.size).to eq(3)
      expect(list.first["checked_on"]).to eq(Time.zone.today.to_s)
    end

    it "month=YYYY-MM で当該月のみに絞る" do
      this_month = Time.zone.today.strftime("%Y-%m")
      get "/api/v1/pacts/#{pact.id}/check_ins", params: { month: this_month }
      expect(response).to have_http_status(:ok)
      list = response.parsed_body
      list.each do |ci|
        expect(ci["checked_on"]).to start_with(this_month)
      end
    end

    it "他人の pact からは 404" do
      other_user = create(:user, email: "other@example.com")
      other_pact = create(:pact, user: other_user, signed_at: 1.day.ago)
      get "/api/v1/pacts/#{other_pact.id}/check_ins"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/pacts/:pact_id/check_ins/:id" do
    let!(:check_in) do
      ci = pact.check_ins.new(checked_on: 1.day.ago.to_date, status: :kept)
      ci.save!(validate: false)
      ci
    end

    it "204 No Content を返し、レコードを削除する" do
      expect {
        delete "/api/v1/pacts/#{pact.id}/check_ins/#{check_in.id}"
      }.to change(CheckIn, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "他人の pact 経由では 404 Not Found" do
      other_user = create(:user, email: "other@example.com")
      other_pact = create(:pact, user: other_user, signed_at: 1.day.ago)

      delete "/api/v1/pacts/#{other_pact.id}/check_ins/#{check_in.id}"
      expect(response).to have_http_status(:not_found)
    end

    it "自分の pact だが、別 pact の check_in id を指定すると 404" do
      other_pact = create(:pact, user: user, signed_at: 1.day.ago)
      delete "/api/v1/pacts/#{other_pact.id}/check_ins/#{check_in.id}"
      expect(response).to have_http_status(:not_found)
    end
  end
end
