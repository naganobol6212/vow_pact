require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot for better performance and memory savings (ignored by Rake tasks).
  config.eager_load = true

  # Full error reports are disabled.
  config.consider_all_requests_local = false

  # Turn on fragment caching in view templates.
  config.action_controller.perform_caching = true

  # Cache assets for far-future expiry since they are all digest stamped.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # Assume all access to the app is happening through a SSL-terminating reverse proxy.
  # config.assume_ssl = true

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = true

  # Skip http-to-https redirect for the default health check endpoint.
  # config.ssl_options = { redirect: { exclude: ->(request) { request.path == "/up" } } }

  # Log to STDOUT with the current request id as a default log tag.
  config.log_tags = [ :request_id ]
  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)

  # Change to "debug" to log everything (including potentially personally-identifiable information!).
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  # Prevent health checks from clogging up the logs.
  config.silence_healthcheck_path = "/up"

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # cache store: 当面は in-process MemoryStore を使う。
  # Solid Cache の migration（db/cache_migrate/）が未生成で本番 DB にテーブルが無く、
  # Rails.cache.fetch 時に「relation does not exist」で 500 になっていたため。
  # Render Free tier は単一プロセス + 短いライフサイクル（30 分でスピンダウン）なので、
  # 本格的な永続キャッシュが必要になった段階で `bin/rails solid_cache:install` で
  # migration を作成して Solid Cache に戻す。
  #
  # トレードオフ:
  #   - スピンダウン後の最初のアクセスはキャッシュが空のため OG image 生成に 10 秒以上かかり、
  #     X クローラーのタイムアウトに引っかかる可能性がある（SignedPage の useEffect で
  #     ユーザー操作中に先取りフェッチして温める対応で緩和）。
  #   - PNG（数百 KB）をそのまま保持するとメモリを食うので、compress: true で gzip 圧縮する。
  config.cache_store = :memory_store, {
    size: 256.megabytes,
    compress: true,
    compress_threshold: 1.kilobyte
  }

  # Replace the default in-process and non-durable queuing backend for Active Job.
  config.active_job.queue_adapter = :solid_queue
  config.solid_queue.connects_to = { database: { writing: :queue } }

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Set host to be used by links generated in mailer templates.
  # FRONTEND_URL（例: https://vow-pact.onrender.com）からホストを抽出して使う。
  # スキームなしの値（"vow-pact.onrender.com" 等）だと URI.parse が host=nil を返して
  # メール内 URL がサイレントに壊れるため、起動時にアーリーフェイルさせる。
  _frontend_url = ENV.fetch("FRONTEND_URL", "https://vow-pact.onrender.com")
  _host = URI.parse(_frontend_url).host
  raise "FRONTEND_URL '#{_frontend_url}' が無効です（https:// などのスキームを含めてください）" if _host.nil?
  config.action_mailer.default_url_options = { host: _host }

  # SMTP 環境変数が揃っていれば実際にメールを送る。揃っていなければ :test 配信で skip。
  # （MVP 段階ではメールサービス契約前でも本番起動できるようにする）
  if ENV["SMTP_HOST"].present? && ENV["SMTP_USERNAME"].present? && ENV["SMTP_PASSWORD"].present?
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = {
      address: ENV["SMTP_HOST"],
      port: ENV.fetch("SMTP_PORT", 587).to_i,
      user_name: ENV["SMTP_USERNAME"],
      password: ENV["SMTP_PASSWORD"],
      authentication: :plain,
      enable_starttls_auto: true
    }
  else
    # SMTP 未設定時：メールは送らない（ログには enqueue されたことが記録される）
    config.action_mailer.delivery_method = :test
  end

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Only use :id for inspections in production.
  config.active_record.attributes_for_inspect = [ :id ]

  # Enable DNS rebinding protection and other `Host` header attacks.
  # Render が管理するドメインのみ許可（DNS rebinding 攻撃対策）。
  # 先頭ドット形式は onrender.com とその全サブドメインを安全に許可（正規表現より厳密）。
  config.hosts = [
    "vow-pact.onrender.com", # 本番ユーザートラフィック用
    ".onrender.com"          # プレビュー / staging デプロイ URL 用
  ]
  # Skip DNS rebinding protection for the default health check endpoint.
  config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end
