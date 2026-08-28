# Pixel-art Homepage Mockups Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone browser gallery containing six responsive, visually distinct pixel-art homepage mockups for the high-level securities exam platform.

**Architecture:** Add a self-contained `frontend/mockups/` static site that Vite can serve without importing it into the existing React application. Each concept owns its HTML and CSS, while a small shared stylesheet and SVG sprite provide reset, accessibility, and reusable crisp-edge primitives. A Vitest manifest test guards the required pages, shared content, viewport metadata, and isolation from production routes.

**Tech Stack:** Semantic HTML5, plain CSS, inline SVG sprite, existing Vite dev server, Vitest, jsdom.

---

### Task 1: Add the mockup contract test

**Files:**
- Create: `frontend/mockups/mockups.test.ts`

**Step 1: Write the failing test**

Create a table for these six slugs and titles:

```ts
const concepts = [
  ["market-pocket", "股市掌機"],
  ["broker-terminal", "券商終端機"],
  ["license-quest", "應試 RPG"],
  ["cram-arcade", "補習班街機"],
  ["study-system", "日系教學軟體"],
  ["study-pet", "電子讀書寵物"],
] as const;
```

For every concept, read `mockups/<slug>/index.html` and assert:

- the file exists;
- it includes `<meta name="viewport"`;
- it links `../shared.css` and `./style.css`;
- it includes the concept title, `證券商高級業務員`, `年份練習`, `隨機練習`, `科目練習`, `模擬考`, `錯題本`, `收藏`, and `統計`;
- it does not include React entry scripts or production data fetches.

Read `mockups/index.html` and assert that all six relative links are present.

**Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- mockups/mockups.test.ts`

Expected: FAIL because the mockup pages do not exist.

**Step 3: Add only the test file**

Use `node:fs` and `node:path`; resolve paths from `process.cwd()` so the test is stable when invoked from `frontend/`.

**Step 4: Commit the failing contract**

```bash
git add frontend/mockups/mockups.test.ts
git commit -m "test: define pixel mockup gallery contract"
```

### Task 2: Create the shared mockup foundation and gallery

**Files:**
- Create: `frontend/mockups/index.html`
- Create: `frontend/mockups/shared.css`
- Create: `frontend/mockups/gallery.css`
- Create: `frontend/mockups/assets/pixel-icons.svg`

**Step 1: Build the semantic gallery**

Create a compact intro plus a six-card grid. Each card must show its index, Chinese and English title, palette strip, a one-line layout description, and a direct link to `./<slug>/index.html`. Include a note instructing the reviewer to resize the browser to compare desktop and mobile layouts.

**Step 2: Establish shared primitives**

In `shared.css`, add:

- box sizing, zeroed body margin, system Traditional Chinese font stack;
- `--pixel-shadow` and `--pixel-shadow-small` hard-shadow tokens;
- `.pixel-frame`, `.pixel-button`, `.pixel-label`, `.sr-only` primitives;
- crisp SVG/image rendering;
- visible `:focus-visible` rules;
- reduced-motion override;
- a reusable four-cell pixel corner treatment without rounded corners, blur, glass, or gradients.

**Step 3: Draw reusable icons**

Create one symbol sprite with `book`, `dice`, `chart`, `timer`, `star`, and `warning` symbols. Use integer view boxes, solid fills, and `shape-rendering="crispEdges"`.

**Step 4: Style the gallery as a neutral comparison surface**

The gallery should remain dark gray and restrained so it does not bias the six concepts. It must fit three cards per row at desktop, two at tablet, and one at mobile.

**Step 5: Run the contract test**

Run: `cd frontend && npm test -- mockups/mockups.test.ts`

Expected: still FAIL because the six concept pages are missing, while the gallery-link assertion passes.

**Step 6: Commit**

```bash
git add frontend/mockups/index.html frontend/mockups/shared.css frontend/mockups/gallery.css frontend/mockups/assets/pixel-icons.svg
git commit -m "feat: add pixel mockup gallery shell"
```

### Task 3: Build Market Pocket and Broker Terminal 88

**Files:**
- Create: `frontend/mockups/market-pocket/index.html`
- Create: `frontend/mockups/market-pocket/style.css`
- Create: `frontend/mockups/broker-terminal/index.html`
- Create: `frontend/mockups/broker-terminal/style.css`

**Step 1: Build Market Pocket markup**

Use a centered `<main class="handheld">` containing shell label, LCD screen, boot ticker, three HUD stats, four practice rows, three utility links, and an inert physical-control area. The practice rows are anchors so keyboard focus can be evaluated.

**Step 2: Style Market Pocket**

Use only the approved five-color LCD palette. Render a stepped plastic shell using borders and hard inset shadows. At 760px and below, remove the outer table surface and let the handheld occupy the viewport width. Keep the LCD text contrast above 4.5:1.

**Step 3: Build Broker Terminal markup**

Use a top quote tape, a three-column terminal workspace, function-key navigation, performance table, and command-line status footer. Use `<table>` for actual metrics and `<nav>` for commands.

**Step 4: Style Broker Terminal**

Use the approved black/amber/green/red palette, 1px grid lines, square blocks, tabular numerals, and a single scanline overlay below content. At 760px and below, order content as status → function keys → performance and remove any fixed column widths.

**Step 5: Verify partial contract**

Run: `cd frontend && npm test -- mockups/mockups.test.ts`

Expected: Market Pocket and Broker Terminal cases PASS; four remaining concept cases FAIL.

**Step 6: Commit**

```bash
git add frontend/mockups/market-pocket frontend/mockups/broker-terminal
git commit -m "feat: add handheld and terminal mockups"
```

### Task 4: Build License Quest and Cram School Arcade

**Files:**
- Create: `frontend/mockups/license-quest/index.html`
- Create: `frontend/mockups/license-quest/style.css`
- Create: `frontend/mockups/cram-arcade/index.html`
- Create: `frontend/mockups/cram-arcade/style.css`

**Step 1: Build License Quest markup**

Use a game HUD header, an asymmetric hero with a CSS pixel candidate avatar, an EXP meter, and a quest board. Map law, investment, and finance to named regions; make mock exam the gold-highlighted main quest. Keep review tools in a compact inventory strip.

**Step 2: Style License Quest**

Use stepped panels, dark navy sky, forest green panels, and gold highlights. The avatar is the signature element; surrounding decoration remains restrained. At mobile width, convert the avatar panel to a horizontal HUD and stack quests vertically.

**Step 3: Build Cram School Arcade markup**

Use a marquee title, four mode-select tiles, a compact score ranking, and bottom utility controls. Ensure the visual order is title → current record → mode choice → review tools.

**Step 4: Style Cram School Arcade**

Use the approved navy/red/yellow/blue palette and offset hard shadows. Add one `PRESS START` animation, disabled under reduced motion. At mobile width, use a two-column mode grid and remove purely decorative cabinet edges.

**Step 5: Verify partial contract**

Run: `cd frontend && npm test -- mockups/mockups.test.ts`

Expected: four concept cases PASS; Study System and Study Pet cases FAIL.

**Step 6: Commit**

```bash
git add frontend/mockups/license-quest frontend/mockups/cram-arcade
git commit -m "feat: add RPG and arcade mockups"
```

### Task 5: Build Study System 1993 and Study Pet

**Files:**
- Create: `frontend/mockups/study-system/index.html`
- Create: `frontend/mockups/study-system/style.css`
- Create: `frontend/mockups/study-pet/index.html`
- Create: `frontend/mockups/study-pet/style.css`

**Step 1: Build Study System markup**

Use a faux application title bar, left chapter index, right lesson workspace, numbered mode rows, disk/status line, and shortcut legend. Use semantic headings and ordered lists so the manual-like hierarchy remains clear without CSS.

**Step 2: Style Study System**

Use machine gray, charcoal, instruction red, CRT blue, and paper white. Use one-pixel rules, compact window controls, and no ornamental texture. At mobile width, transform the chapter index into a horizontal tab strip and make the lesson workspace single-column.

**Step 3: Build Study Pet markup**

Use a pixel room scene, CSS pet sprite, speech bubble, three growth meters, today's task, four primary modes, and three utility actions. The pet state must be the visual interpretation of the same progress data shown numerically elsewhere.

**Step 4: Style Study Pet**

Use berry/mint/custard/plum/milk, thick two-tone outlines, and minimal hard shadows. Avoid generic rounded bento cards: panels should use notched pixel corners. At mobile width, put the pet stage first and arrange modes as a two-column control pad.

**Step 5: Run the contract test**

Run: `cd frontend && npm test -- mockups/mockups.test.ts`

Expected: PASS for the gallery and all six concepts.

**Step 6: Commit**

```bash
git add frontend/mockups/study-system frontend/mockups/study-pet
git commit -m "feat: add study system and pet mockups"
```

### Task 6: Perform responsive and regression verification

**Files:**
- Modify if required: `frontend/mockups/**/*.css`

**Step 1: Run automated regression checks**

Run:

```bash
cd frontend
npm test
npm run build
```

Expected: all Vitest suites PASS and Vite production build exits successfully. The existing React bundle must remain unchanged except for normal build artifacts.

**Step 2: Start the preview server**

Run: `cd frontend && npm run dev -- --host 127.0.0.1`

Expected: Vite reports a local URL and `/mockups/` opens the gallery.

**Step 3: Capture desktop references**

For the gallery and each concept, inspect at 1440 × 1000. Confirm:

- no clipped sections or horizontal scroll;
- each concept is visibly distinct at first glance;
- all common content is present;
- the signature element dominates only one area;
- no cream-serif-gradient AI-dashboard styling survives unintentionally.

**Step 4: Capture mobile references**

Inspect each concept at 390 × 844. Confirm readable Chinese, at least 44px primary targets, reordered—not merely scaled—layouts, and no fixed-width overflow.

**Step 5: Fix visual defects and rerun checks**

Repeat the targeted screenshots after any CSS change, then rerun `npm test` and `npm run build`.

**Step 6: Commit final QA adjustments**

```bash
git add frontend/mockups
git commit -m "fix: polish responsive pixel mockups"
```

### Task 7: Hand off the comparison set

**Files:**
- No source changes required unless gallery copy needs correction.

**Step 1: Report the gallery location**

Provide the clickable local path to `frontend/mockups/index.html` and the local Vite URL `/mockups/`.

**Step 2: Summarize the six concepts concisely**

List each concept by name and its strongest differentiator. Ask the user to select one concept or combine named elements from two concepts.

**Step 3: Preserve scope**

Do not migrate a selected style into the production React app until the user explicitly chooses a direction.
