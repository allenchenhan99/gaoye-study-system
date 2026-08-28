import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { AuthUser } from "../hooks/useAuth";
import type { SyncStatus } from "../hooks/useCloudProgress";

interface SystemShellProps {
  bankSize: number;
  user?: AuthUser;
  onSignOut?: () => void | Promise<void>;
  syncStatus?: SyncStatus;
  syncError?: string | null;
  accountBusy?: boolean;
  accountError?: string | null;
  children: ReactNode;
}

const MENU_ITEMS = [
  { to: "/", label: "首頁", shortcut: "F1", end: true },
  { to: "/practice/random", label: "學習", shortcut: "F2" },
  { to: "/stats", label: "紀錄", shortcut: "F9" },
  { to: "/review/wrong", label: "錯題本", shortcut: "F7" },
  { to: "/review/favorites", label: "收藏", shortcut: "F8" },
] as const;

function routeStatus(pathname: string): string {
  if (pathname.startsWith("/practice")) return "STUDY SESSION";
  if (pathname === "/exam") return "EXAM MODE";
  if (pathname.startsWith("/review/wrong")) return "WRONG BOOK";
  if (pathname.startsWith("/review/favorites")) return "FAVORITES";
  if (pathname === "/stats") return "RECORD VIEW";
  return "HOME / LESSON SELECT";
}

export function SystemShell({
  bankSize,
  user,
  onSignOut,
  syncStatus,
  syncError,
  accountBusy,
  accountError,
  children,
}: SystemShellProps) {
  const { pathname } = useLocation();
  const syncLabel = getSyncLabel(syncStatus);

  return (
    <div className="system-desktop">
      <header className="system-titlebar">
        <div className="window-controls" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="system-app-name">
          <strong>高業學習系統</strong>
          <span>GAOYE STUDY SYSTEM 1993</span>
        </div>
        <div className="drive-ready">
          <span aria-hidden="true" /> {syncLabel}
        </div>
      </header>

      <nav className="system-menubar" aria-label="系統選單">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : false}
            className={({ isActive }) => (isActive ? "is-active" : undefined)}
          >
            <kbd>{item.shortcut}</kbd>
            {item.label}
          </NavLink>
        ))}
        <a
          className="system-support-link"
          href="https://buymeacoffee.com/allenchenhan99"
          target="_blank"
          rel="noreferrer"
          aria-label="支持網站維護"
        >
          <kbd aria-hidden="true">♥</kbd>
          支持網站維護
        </a>
        {user && (
          <button
            type="button"
            className="system-account-button"
            disabled={accountBusy}
            onClick={() => void onSignOut?.()}
            aria-label={`${user.email ?? user.name ?? "使用者"}，登出`}
            title="登出"
          >
            <span aria-hidden="true">●</span>
            {user.name ?? user.email ?? "GOOGLE USER"}
            <kbd>LOGOUT</kbd>
          </button>
        )}
        <span className="system-edition">114 年度版</span>
      </nav>

      <main className="system-main">
        {accountError && (
          <div className="account-warning" role="alert">{accountError}</div>
        )}
        {syncError && (
          <div className="sync-warning" role="status">{syncError}</div>
        )}
        {children}
      </main>

      <footer className="system-statusbar">
        <span><b>READY</b>　{routeStatus(pathname)}</span>
        <span>{bankSize.toLocaleString()} records</span>
        <span>{syncLabel}</span>
      </footer>
    </div>
  );
}

function getSyncLabel(status: SyncStatus | undefined): string {
  if (status === "synced") return "CLOUD SYNC READY";
  if (status === "loading" || status === "syncing") return "CLOUD SYNC...";
  if (status === "error") return "DEVICE CACHE / RETRY";
  return "DEVICE CACHE";
}
