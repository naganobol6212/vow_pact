require "rails_helper"

RSpec.describe "Api::V1::Pacts", type: :request do
  let!(:user) do
    create(:user,
           email: "test@example.com",
           password: "password123",
           password_confirmation: "password123")
  end

  let(:login_params) { { email: "test@example.com", password: "password123" } }

  describe "POST /api/v1/pacts" do
    let(:valid_params) do
      {
        goal: "毎日30分読書する",
        constraint_text: "スマホを別室に置く",
        difficulty: 3,
        deadline: 30.days.from_now.to_date.to_s
      }
    end

    context "ログイン中で有効なパラメータの場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "201 Created を返し、契約を作成する" do
        expect {
          post "/api/v1/pacts", params: valid_params, as: :json
        }.to change(Pact, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["goal"]).to eq("毎日30分読書する")
        expect(response.parsed_body["status"]).to eq("active")
        expect(response.parsed_body["user_id"]).to eq(user.id)
      end

      it "signed_at はクライアント値ではなくサーバ側の現在時刻が設定される" do
        # 1 年後など本来あり得ない値をクライアントが送っても無視されることを保証
        spoofed = 1.year.from_now.iso8601
        post "/api/v1/pacts", params: valid_params.merge(signed_at: spoofed), as: :json

        expect(response).to have_http_status(:created)
        signed_at = Time.parse(response.parsed_body["signed_at"])
        expect(signed_at).to be_within(1.minute).of(Time.current)
      end
    end

    context "active な契約が既に 7 つある場合" do
      before do
        post "/api/v1/auth/login", params: login_params, as: :json
        7.times { create(:pact, user: user, status: :active) }
      end

      it "422 を返し、8 つ目を作成しない" do
        expect {
          post "/api/v1/pacts", params: valid_params, as: :json
        }.not_to change(Pact, :count)

        expect(response).to have_http_status(:unprocessable_content)
        expect(response.parsed_body["errors"].any? { |e| e["field"] == "base" }).to be true
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/pacts", params: valid_params, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/pacts" do
    context "ログイン中の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      let!(:my_pact_active) { create(:pact, user: user, status: :active, goal: "自分の active") }
      let!(:my_pact_completed) { create(:pact, user: user, status: :completed, goal: "自分の完了", completed_at: 1.day.ago) }
      let!(:other_user_pact) do
        other_user = create(:user)
        create(:pact, user: other_user, status: :active, goal: "他人の契約")
      end

      it "200 OK を返し、自分の契約のみを返す" do
        get "/api/v1/pacts", as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to be_an(Array)
        expect(response.parsed_body.size).to eq(2)

        goals = response.parsed_body.map { |p| p["goal"] }
        expect(goals).to include("自分の active", "自分の完了")
        expect(goals).not_to include("他人の契約")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        get "/api/v1/pacts", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /api/v1/pacts/:id" do
    let!(:my_pact) { create(:pact, user: user, goal: "自分の契約") }
    let!(:other_user) { create(:user, email: "other@example.com") }
    let!(:other_pact) { create(:pact, user: other_user, goal: "他人の契約") }

    context "ログイン中で自分の契約を取得する場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返し、契約詳細を返す" do
        get "/api/v1/pacts/#{my_pact.id}", as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["id"]).to eq(my_pact.id)
        expect(response.parsed_body["goal"]).to eq("自分の契約")
      end
    end

    context "ログイン中で他人の契約を取得しようとする場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "404 Not Found を返す（構造的に他人の契約には到達不可）" do
        get "/api/v1/pacts/#{other_pact.id}", as: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "存在しない id の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "404 Not Found を返す" do
        get "/api/v1/pacts/999999", as: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        get "/api/v1/pacts/#{my_pact.id}", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/pacts/:id" do
    let!(:my_pact) do
      create(:pact,
             user: user,
             goal: "元の目標",
             constraint_text: "元の制約",
             difficulty: 3,
             deadline: 30.days.from_now.to_date)
    end
    let!(:other_user) { create(:user, email: "other@example.com") }
    let!(:other_pact) { create(:pact, user: other_user) }

    context "ログイン中で goal / constraint_text を編集する場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返し、編集する" do
        patch "/api/v1/pacts/#{my_pact.id}", params: {
          goal: "新しい目標",
          constraint_text: "新しい制約"
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["goal"]).to eq("新しい目標")
        expect(response.parsed_body["constraint_text"]).to eq("新しい制約")
      end
    end

    context "deadline / difficulty / signed_at を変更しようとする場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返すが、編集禁止属性は無視される" do
        original_deadline = my_pact.deadline
        original_difficulty = my_pact.difficulty

        patch "/api/v1/pacts/#{my_pact.id}", params: {
          goal: "新しい目標",
          deadline: 100.days.from_now.to_date.to_s,
          difficulty: 5,
          signed_at: 1.year.from_now.iso8601
        }, as: :json

        my_pact.reload
        expect(response).to have_http_status(:ok)
        expect(my_pact.goal).to eq("新しい目標")          # ← goal は変更される
        expect(my_pact.deadline).to eq(original_deadline) # ← deadline は変わらず
        expect(my_pact.difficulty).to eq(original_difficulty)
      end
    end

    context "他人の契約を編集しようとする場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "404 Not Found を返す" do
        patch "/api/v1/pacts/#{other_pact.id}", params: { goal: "ハッキング" }, as: :json

        expect(response).to have_http_status(:not_found)
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        patch "/api/v1/pacts/#{my_pact.id}", params: { goal: "x" }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/pacts/:id" do
    let!(:my_pact) { create(:pact, user: user, status: :active) }
    let!(:other_user) { create(:user, email: "other@example.com") }
    let!(:other_pact) { create(:pact, user: other_user, status: :active) }

    context "ログイン中で自分の契約を削除する場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "204 No Content を返し、status を abandoned に変更する（論理削除）" do
        expect {
          delete "/api/v1/pacts/#{my_pact.id}", as: :json
        }.not_to change(Pact, :count)

        expect(response).to have_http_status(:no_content)
        expect(my_pact.reload.status).to eq("abandoned")
      end
    end

    context "他人の契約を削除しようとする場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "404 Not Found を返し、削除しない" do
        delete "/api/v1/pacts/#{other_pact.id}", as: :json

        expect(response).to have_http_status(:not_found)
        expect(other_pact.reload.status).to eq("active")
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        delete "/api/v1/pacts/#{my_pact.id}", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/pacts/:id/title" do
    let!(:my_pact) { create(:pact, user: user, goal: "毎日30分読書する", difficulty: 3, title: nil) }
    let!(:other_user) { create(:user, email: "other@example.com") }
    let!(:other_pact) { create(:pact, user: other_user, title: nil) }

    before do
      # AI 呼び出しは実 API を叩かないようモック
      allow_any_instance_of(::Ai::TitleGenerator).to receive(:generate)
        .and_return([ "沈黙の試練を背負いし者", "誓いの守人", "信念の継承者" ])
    end

    context "ログイン中で自分の契約に title が未設定の場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "200 OK を返し、AI 生成された title の先頭を pact に保存する" do
        post "/api/v1/pacts/#{my_pact.id}/title", as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["title"]).to eq("沈黙の試練を背負いし者")
        expect(my_pact.reload.title).to eq("沈黙の試練を背負いし者")
      end

      it "AiGeneration ログを 1 件作成する" do
        expect {
          post "/api/v1/pacts/#{my_pact.id}/title", as: :json
        }.to change(AiGeneration, :count).by(1)

        log = AiGeneration.last
        expect(log.generation_type).to eq("title_generation")
        expect(log.user_id).to eq(user.id)
      end
    end

    context "title が既に設定済みの場合" do
      let!(:titled_pact) { create(:pact, user: user, title: "既存の称号") }
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "再生成せず、既存 title を維持する（idempotent）" do
        post "/api/v1/pacts/#{titled_pact.id}/title", as: :json

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["title"]).to eq("既存の称号")
        expect(titled_pact.reload.title).to eq("既存の称号")
      end

      it "AI 生成を呼び出さない" do
        expect_any_instance_of(::Ai::TitleGenerator).not_to receive(:generate)
        post "/api/v1/pacts/#{titled_pact.id}/title", as: :json
      end
    end

    context "他人の契約に対して呼ぼうとした場合" do
      before { post "/api/v1/auth/login", params: login_params, as: :json }

      it "404 Not Found を返し、保存しない" do
        post "/api/v1/pacts/#{other_pact.id}/title", as: :json

        expect(response).to have_http_status(:not_found)
        expect(other_pact.reload.title).to be_nil
      end
    end

    context "未ログインの場合" do
      it "401 Unauthorized を返す" do
        post "/api/v1/pacts/#{my_pact.id}/title", as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
