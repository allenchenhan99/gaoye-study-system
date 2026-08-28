import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const privacyPath = resolve(process.cwd(), "public/privacy.html");
const privacyHtml = existsSync(privacyPath) ? readFileSync(privacyPath, "utf8") : "";
const indexPath = resolve(process.cwd(), "index.html");
const indexHtml = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";

describe("public privacy page", () => {
  it("discloses how authentication and per-user learning progress are handled", () => {
    expect(privacyHtml).toContain("高業學習系統隱私權政策");
    expect(privacyHtml).toContain("Google 帳號基本資料");
    expect(privacyHtml).toContain("學習進度");
    expect(privacyHtml).toContain("每位使用者只能存取自己的資料");
    expect(privacyHtml).toContain("Supabase");
    expect(privacyHtml).toContain("GitHub Pages");
    expect(privacyHtml).toContain("不會出售");
    expect(privacyHtml).toContain("刪除");
    expect(privacyHtml).toContain('href="./"');
  });

  it("publishes the Google Search Console ownership token on the homepage", () => {
    expect(indexHtml).toContain(
      '<meta name="google-site-verification" content="nRk5p2IhuUCD7vBMjSyXZiYkP0UKhWgB_Un6HtZuJnA" />'
    );
  });
});
