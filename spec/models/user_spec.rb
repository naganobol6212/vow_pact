require "rails_helper"

RSpec.describe User, type: :model do
  describe "factory" do
    it "valid な user を生成できる" do
      user = build(:user)
      expect(user).to be_valid
    end
  end

  describe "validations" do
    describe "email" do
      it "必須" do
        user = build(:user, email: nil)
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it "メール形式チェック" do
        user = build(:user, email: "not-an-email")
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it "重複は不可（大文字小文字無視）" do
        create(:user, email: "test@example.com")
        duplicate = build(:user, email: "TEST@example.com")
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:email]).to be_present
      end

      it "DB レベルの UNIQUE 制約も大文字小文字無視（バリデーションをすり抜けても止まる）" do
        create(:user, email: "test@example.com")
        # validate: false で Rails のバリデーションをスキップ → DB 制約だけが残る
        bypass = build(:user, email: "TEST@Example.com")
        expect {
          bypass.save(validate: false)
        }.to raise_error(ActiveRecord::RecordNotUnique)
      end
    end

    describe "nickname" do
      it "必須" do
        user = build(:user, nickname: nil)
        expect(user).not_to be_valid
        expect(user.errors[:nickname]).to be_present
      end

      it "1〜30文字" do
        expect(build(:user, nickname: "a")).to be_valid
        expect(build(:user, nickname: "a" * 30)).to be_valid
        expect(build(:user, nickname: "a" * 31)).not_to be_valid
      end
    end

    describe "password" do
      it "必須（新規作成時）" do
        user = User.new(email: "x@example.com", nickname: "X", password: nil)
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end

      it "6文字以上" do
        user = build(:user, password: "12345")
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end
    end

    describe "avatar_url" do
      it "URL 形式（任意）" do
        expect(build(:user, avatar_url: "https://example.com/a.jpg")).to be_valid
        expect(build(:user, avatar_url: nil)).to be_valid
        expect(build(:user, avatar_url: "")).to be_valid
        expect(build(:user, avatar_url: "not-a-url")).not_to be_valid
      end
    end

    describe "streak_count / longest_streak" do
      it "0 以上の整数" do
        expect(build(:user, streak_count: -1)).not_to be_valid
        expect(build(:user, streak_count: 0)).to be_valid
        expect(build(:user, longest_streak: -1)).not_to be_valid
        expect(build(:user, longest_streak: 0)).to be_valid
      end
    end
  end

  describe "正規化（before_validation）" do
    it "email を保存前に小文字化する" do
      user = create(:user, email: "Mixed@Example.COM")
      expect(user.reload.email).to eq("mixed@example.com")
    end

    it "email の前後空白を除去する" do
      user = create(:user, email: "  test@example.com  ")
      expect(user.reload.email).to eq("test@example.com")
    end

    it "nickname の前後空白を除去する" do
      user = create(:user, nickname: "  山田  ")
      expect(user.reload.nickname).to eq("山田")
    end

    it "validation 前に正規化されているので、空白入り email でも uniqueness で弾かれる" do
      create(:user, email: "test@example.com")
      duplicate = build(:user, email: "  TEST@example.com  ")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to be_present
    end
  end

  describe "has_secure_password" do
    let(:user) { create(:user, password: "mypassword") }

    it "正しいパスワードで authenticate できる" do
      expect(user.authenticate("mypassword")).to eq(user)
    end

    it "間違ったパスワードでは authenticate できない" do
      expect(user.authenticate("wrong")).to be(false)
    end

    it "password_digest が保存され、平文 password は保存されない" do
      expect(user.password_digest).to be_present
      expect(user.password_digest).not_to eq("mypassword")
    end
  end

  describe "Guest user" do
    describe ".create_guest!" do
      it "is_guest=true / nickname=ゲスト / email=guest_xxx@guest.local の User を作成" do
        guest = described_class.create_guest!
        expect(guest).to be_persisted
        expect(guest.is_guest).to be true
        expect(guest.nickname).to eq(User::GUEST_NICKNAME)
        expect(guest.email).to match(/\Aguest_[0-9a-f]{16}@guest\.local\z/)
        expect(guest.is_public).to be false
      end

      it "create_guest! は何度呼んでも email が衝突しない" do
        guests = 5.times.map { described_class.create_guest! }
        expect(guests.map(&:email).uniq.size).to eq(5)
      end
    end

    describe "#promote_to_registered!" do
      let(:guest) { described_class.create_guest! }

      it "email / password / nickname を更新し is_guest=false に切り替える" do
        guest.promote_to_registered!(
          email: "real@example.com",
          password: "password123",
          password_confirmation: "password123",
          nickname: "勇者"
        )
        guest.reload
        expect(guest.email).to eq("real@example.com")
        expect(guest.is_guest).to be false
        expect(guest.nickname).to eq("勇者")
        expect(guest.authenticate("password123")).to eq(guest)
      end

      it "nickname 未指定なら既存の nickname を保持" do
        guest.promote_to_registered!(
          email: "real2@example.com", password: "password123", password_confirmation: "password123"
        )
        expect(guest.reload.nickname).to eq(User::GUEST_NICKNAME)
      end

      it "既に登録済みのユーザーを promote しようとすると ArgumentError" do
        registered = create(:user, is_guest: false)
        expect {
          registered.promote_to_registered!(
            email: "x@example.com", password: "password123", password_confirmation: "password123"
          )
        }.to raise_error(ArgumentError)
      end

      it "promote 後も既存の Pact が引き継がれる（同じ User なので id 不変）" do
        pact = create(:pact, user: guest, signed_at: 1.day.ago)
        guest.promote_to_registered!(
          email: "real3@example.com", password: "password123", password_confirmation: "password123"
        )
        expect(guest.reload.pacts).to include(pact)
      end
    end

    describe "scopes" do
      let!(:guest1) { described_class.create_guest! }
      let!(:guest2) { described_class.create_guest! }
      let!(:registered) { create(:user, is_guest: false) }

      it "guest scope で is_guest=true のみ取得" do
        expect(described_class.guest).to match_array([ guest1, guest2 ])
      end

      it "registered scope で is_guest=false のみ取得" do
        expect(described_class.registered).to include(registered)
        expect(described_class.registered).not_to include(guest1, guest2)
      end

      it "expired_guests は GUEST_EXPIRATION より古いゲストのみ" do
        old_guest = described_class.create_guest!
        old_guest.update_columns(created_at: 31.days.ago)

        expect(described_class.expired_guests).to include(old_guest)
        expect(described_class.expired_guests).not_to include(guest1, registered)
      end
    end
  end
end
