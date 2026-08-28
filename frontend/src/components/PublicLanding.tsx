interface PublicLandingProps {
  configured: boolean;
  busy: boolean;
  error: string | null;
  onSignIn: () => void | Promise<void>;
}

const FEATURES = [
  ["01", "歷屆題庫", "依年份、科目與隨機模式建立練習。"],
  ["02", "即時解析", "作答後立即核對答案並閱讀題目詳解。"],
  ["03", "個人紀錄", "跨裝置同步進度、錯題本、收藏與成績。"],
] as const;

export function PublicLanding({ configured, busy, error, onSignIn }: PublicLandingProps) {
  return (
    <div className="public-desktop">
      <header className="system-titlebar">
        <div className="window-controls" aria-hidden="true"><span /><span /></div>
        <div className="system-app-name">
          <strong>高業學習系統</strong>
          <span>GAOYE STUDY SYSTEM 1993</span>
        </div>
        <div className="drive-ready">
          <span aria-hidden="true" /> NETWORK READY
        </div>
      </header>

      <main className="public-manual">
        <section className="public-intro" aria-labelledby="landing-title">
          <div className="flex items-start justify-between gap-6 border-b-4 border-charcoal pb-5">
            <div>
              <span className="system-label">README.TXT / START HERE</span>
              <h1 id="landing-title" className="mt-3 text-4xl font-black leading-[1.06] sm:text-5xl">
                高業學習系統
              </h1>
              <p className="mt-3 text-base font-bold text-ink-soft sm:text-lg">
                證券商高級業務員考古題練習平台
              </p>
            </div>
            <div className="system-disk hidden shrink-0 sm:block" aria-hidden="true"><span /></div>
          </div>

          <p className="mt-5 max-w-2xl text-[0.94rem] leading-7 text-ink-soft">
            以歷屆試題建立你的專屬複習紀錄。介面取材自 1990 年代日系教學軟體，
            專注於清楚作答、快速核對，以及能真正延續到下一次登入的學習進度。
          </p>

          <section className="mt-7" aria-labelledby="feature-title">
            <div className="mb-3 flex items-center justify-between border-b-2 border-charcoal pb-2">
              <h2 id="feature-title" className="font-mono text-xs font-black">DIRECTORY / FEATURES</h2>
              <span className="font-mono text-[0.58rem] font-bold text-ink-faint">3 FILES</span>
            </div>
            <ol className="grid gap-2">
              {FEATURES.map(([number, title, description]) => (
                <li key={number} className="public-feature-row">
                  <b>{number}</b>
                  <span><strong>{title}</strong><small>{description}</small></span>
                  <em aria-hidden="true">■</em>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-line pt-4">
            <p className="font-mono text-[0.62rem] font-bold text-ink-faint">
              OPEN SOURCE · RESPONSIVE · CLOUD SYNC
            </p>
            <a
              className="coffee-icon-link"
              href="https://buymeacoffee.com/allenchenhan99"
              target="_blank"
              rel="noreferrer"
              aria-label="Buy Me a Coffee，支持網站維護"
              title="Buy Me a Coffee"
            >
              <CoffeeCupIcon />
            </a>
          </div>
        </section>

        <aside className="public-login" aria-labelledby="login-title">
          <div className="public-login-titlebar">
            <span>LOGIN MODULE</span>
            <span>AUTH.EXE</span>
          </div>
          <div className="p-5 sm:p-7">
            <div className="mx-auto grid h-20 w-20 place-items-center border-4 border-charcoal bg-machine" aria-hidden="true">
              <span className="font-mono text-3xl font-black text-crt">ID</span>
            </div>
            <h2 id="login-title" className="mt-5 text-center text-xl font-black">登入後開始練習</h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-ink-soft">
              使用 Google 帳號建立個人學習空間，安全保存每次作答、錯題與收藏。
            </p>

            <button
              type="button"
              className="google-login-button mt-6 w-full"
              disabled={!configured || busy}
              onClick={() => void onSignIn()}
            >
              <GoogleIcon />
              <span>{busy ? "連線中…" : "使用 Google 登入"}</span>
            </button>

            {!configured && (
              <p className="login-status" role="status">登入服務設定中，請稍後再試。</p>
            )}
            {error && <p className="login-error" role="alert">{error}</p>}

            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t-2 border-line pt-4 font-mono text-[0.62rem] font-bold">
              <dt className="text-ink-faint">ACCESS</dt><dd>MEMBERS ONLY</dd>
              <dt className="text-ink-faint">SAVE</dt><dd>CLOUD + DEVICE CACHE</dd>
              <dt className="text-ink-faint">PROVIDER</dt><dd>GOOGLE OAUTH</dd>
            </dl>
          </div>
        </aside>
      </main>

      <footer className="system-statusbar" role="contentinfo">
        <span><b>READY</b>　SIGN IN REQUIRED</span>
        <span>README / LOGIN</span>
        <span>SECURE SESSION</span>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.7 4.7 0 0 1-2 3.1v2.8h3.5c2-1.9 2.7-4.7 2.7-8Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.8-2.4l-3.5-2.8c-1 .6-2.1 1-3.3 1a6 6 0 0 1-5.6-4.1H2.8v2.9A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.7a6 6 0 0 1 0-3.8V7H2.8a10 10 0 0 0 0 9.6l3.6-2.9Z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 3.9 1.5l3-3A10 10 0 0 0 2.8 7l3.6 2.9A6 6 0 0 1 12 5.9Z" />
    </svg>
  );
}

function CoffeeCupIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" shapeRendering="crispEdges">
      <path fill="currentColor" d="M7 8h16v3h3v3h3v7h-3v3h-5v3H8v-3H5V11h2V8Zm16 6v7h3v-7h-3Zm-12-3v4h2v-4h-2Zm5 0v4h2v-4h-2Z" />
    </svg>
  );
}
