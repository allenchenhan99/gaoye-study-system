import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

interface SystemShellProps {
  bankSize: number;
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

export function SystemShell({ bankSize, children }: SystemShellProps) {
  const { pathname } = useLocation();

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
          <span aria-hidden="true" /> LOCAL DATA READY
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
        <span className="system-edition">114 年度版</span>
      </nav>

      <main className="system-main">{children}</main>

      <footer className="system-statusbar">
        <span><b>READY</b>　{routeStatus(pathname)}</span>
        <span>{bankSize.toLocaleString()} records</span>
        <span>LOCAL DATA READY</span>
      </footer>
    </div>
  );
}
