# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_06_064749) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "ai_generations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "error_message"
    t.integer "generation_type", null: false
    t.jsonb "input_data", default: {}, null: false
    t.integer "latency_ms"
    t.string "model", null: false
    t.jsonb "output_data", default: {}, null: false
    t.bigint "pact_id"
    t.integer "status", null: false
    t.integer "tokens_used"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["generation_type"], name: "index_ai_generations_on_generation_type"
    t.index ["pact_id"], name: "index_ai_generations_on_pact_id"
    t.index ["user_id", "created_at"], name: "index_ai_generations_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_ai_generations_on_user_id"
  end

  create_table "check_ins", force: :cascade do |t|
    t.date "checked_on", null: false
    t.datetime "created_at", null: false
    t.text "note"
    t.bigint "pact_id", null: false
    t.integer "status", null: false
    t.datetime "updated_at", null: false
    t.index ["checked_on"], name: "index_check_ins_on_checked_on"
    t.index ["pact_id", "checked_on"], name: "index_check_ins_on_pact_id_and_checked_on", unique: true
    t.index ["pact_id"], name: "index_check_ins_on_pact_id"
  end

  create_table "crests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "crest_data", default: {}, null: false
    t.datetime "generated_at", null: false
    t.bigint "pact_id", null: false
    t.integer "rarity", null: false
    t.datetime "updated_at", null: false
    t.index ["pact_id"], name: "index_crests_on_pact_id", unique: true
    t.index ["rarity"], name: "index_crests_on_rarity"
  end

  create_table "pacts", force: :cascade do |t|
    t.datetime "completed_at"
    t.text "constraint_text", null: false
    t.datetime "created_at", null: false
    t.date "deadline", null: false
    t.integer "difficulty", null: false
    t.text "difficulty_reason"
    t.text "goal", null: false
    t.datetime "signed_at", null: false
    t.integer "status", default: 0, null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["deadline"], name: "index_pacts_on_deadline"
    t.index ["status"], name: "index_pacts_on_status"
    t.index ["user_id", "status"], name: "index_pacts_on_user_id_and_status"
    t.index ["user_id"], name: "index_pacts_on_user_id"
  end

  create_table "password_reset_tokens", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.string "token", null: false
    t.datetime "updated_at", null: false
    t.datetime "used_at"
    t.bigint "user_id", null: false
    t.index ["token"], name: "index_password_reset_tokens_on_token", unique: true
    t.index ["user_id", "created_at"], name: "index_password_reset_tokens_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_password_reset_tokens_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.boolean "is_guest", default: false, null: false
    t.boolean "is_public", default: true, null: false
    t.integer "longest_streak", default: 0, null: false
    t.string "nickname", null: false
    t.string "password_digest", null: false
    t.integer "streak_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.index ["is_guest", "created_at"], name: "index_users_on_is_guest_and_created_at"
  end

  add_foreign_key "ai_generations", "pacts"
  add_foreign_key "ai_generations", "users"
  add_foreign_key "check_ins", "pacts"
  add_foreign_key "crests", "pacts"
  add_foreign_key "pacts", "users"
  add_foreign_key "password_reset_tokens", "users"
  add_foreign_key "sessions", "users"
end
