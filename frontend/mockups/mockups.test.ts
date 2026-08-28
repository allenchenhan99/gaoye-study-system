import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "mockups");

const concepts = [
  ["market-pocket", "股市掌機"],
  ["broker-terminal", "券商終端機"],
  ["license-quest", "應試 RPG"],
  ["cram-arcade", "補習班街機"],
  ["study-system", "日系教學軟體"],
  ["study-pet", "電子讀書寵物"],
] as const;

const sharedContent = [
  "證券商高級業務員",
  "年份練習",
  "隨機練習",
  "科目練習",
  "模擬考",
  "錯題本",
  "收藏",
  "統計",
];

describe.each(concepts)("%s mockup", (slug, title) => {
  test("provides the agreed standalone comparison content", () => {
    const path = resolve(root, slug, "index.html");

    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;

    const html = readFileSync(path, "utf8");
    expect(html).toContain('<meta name="viewport"');
    expect(html).toContain('href="../shared.css"');
    expect(html).toContain('href="./style.css"');
    expect(html).toContain(title);
    sharedContent.forEach((label) => expect(html).toContain(label));
    expect(html).not.toMatch(/src\/main\.(tsx|ts|jsx|js)/);
    expect(html).not.toMatch(/fetch\([^)]*(questions|explanations)\.json/);
  });
});

test("gallery links to all six concepts", () => {
  const path = resolve(root, "index.html");

  expect(existsSync(path)).toBe(true);
  if (!existsSync(path)) return;

  const html = readFileSync(path, "utf8");
  concepts.forEach(([slug]) => {
    expect(html).toContain(`href="./${slug}/index.html"`);
  });
});
