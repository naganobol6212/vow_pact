class CleanupExpiredGuestsJob < ApplicationJob
  queue_as :default

  # 30 日経過しても本登録に昇格していないゲストユーザーを削除する。
  # User#dependent: :destroy 連鎖で Pact / CheckIn / Crest / Session も削除される
  # （AiGeneration は dependent: :destroy なのでこれも削除）。
  def perform
    User.expired_guests.find_each(&:destroy!)
  end
end
