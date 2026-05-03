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
        expect(user.errors[:email]).to include("can't be blank")
      end

      it "メール形式チェック" do
        user = build(:user, email: "not-an-email")
        expect(user).not_to be_valid
        expect(user.errors[:email]).to include("is invalid")
      end

      it "重複は不可（大文字小文字無視）" do
        create(:user, email: "test@example.com")
        duplicate = build(:user, email: "TEST@example.com")
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:email]).to include("has already been taken")
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
        expect(user.errors[:nickname]).to include("can't be blank")
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
        expect(user.errors[:password]).to include("can't be blank")
      end

      it "6文字以上" do
        user = build(:user, password: "12345")
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include("is too short (minimum is 6 characters)")
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
      expect(duplicate.errors[:email]).to include("has already been taken")
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
end
