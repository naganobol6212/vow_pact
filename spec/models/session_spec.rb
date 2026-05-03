require "rails_helper"

RSpec.describe Session, type: :model do
  describe "factory" do
    it "valid な session を生成できる" do
      session = build(:session)
      expect(session).to be_valid
    end
  end

  describe "associations" do
    it "user に belongs_to" do
      user = create(:user)
      session = create(:session, user: user)
      expect(session.user).to eq(user)
    end

    it "user がないと invalid" do
      session = build(:session, user: nil)
      expect(session).not_to be_valid
    end

    it "User 削除で紐づく session も destroy される" do
      user = create(:user)
      create(:session, user: user)
      expect { user.destroy }.to change { Session.count }.by(-1)
    end
  end
end
