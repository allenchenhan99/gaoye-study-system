# Study System Production Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the production React frontend’s generic cream-card visual system with the approved responsive Study System 1993 interface across every route without changing quiz, scoring, storage, or question-bank behavior.

**Architecture:** Introduce a shared application shell and a small block-meter primitive, then migrate each existing page onto semantic system-window classes backed by centralized Tailwind tokens and component CSS. Keep all domain hooks and route behavior unchanged; component tests assert accessible structure and state while existing flow tests guard regressions.

**Tech Stack:** React 18, TypeScript, React Router 6, Tailwind CSS 3, Vitest, React Testing Library, Vite.

---

### Task 1: Add design tokens and tested system primitives

**Files:**
- Create: `frontend/src/components/SystemShell.tsx`
- Create: `frontend/src/components/SystemShell.test.tsx`
- Create: `frontend/src/components/BlockMeter.tsx`
- Create: `frontend/src/components/BlockMeter.test.tsx`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`
- Modify: `frontend/index.html`

**Step 1: Write failing primitive tests**

`SystemShell.test.tsx` renders the component inside `MemoryRouter` and asserts:

```tsx
expect(screen.getByRole("banner")).toHaveTextContent("高業學習系統");
expect(screen.getByRole("navigation", { name: "系統選單" })).toBeInTheDocument();
expect(screen.getByRole("contentinfo")).toHaveTextContent("LOCAL DATA READY");
expect(screen.getByText("5,400 records")).toBeInTheDocument();
```

`BlockMeter.test.tsx` renders `<BlockMeter value={78} label="整體正確率" />` and asserts role `progressbar`, `aria-valuenow="78"`, and exactly ten segments of which eight have `data-filled="true"`.

**Step 2: Run the tests to verify RED**

Run: `cd frontend && npm test -- src/components/SystemShell.test.tsx src/components/BlockMeter.test.tsx`

Expected: FAIL because both modules are missing.

**Step 3: Implement the minimal primitives**

`SystemShell` props:

```ts
interface SystemShellProps {
  bankSize: number;
  children: React.ReactNode;
}
```

It uses `useLocation()` to derive a short status label, renders semantic `<header>`, `<nav aria-label="系統選單">`, `<main>`, and `<footer>`, and exposes only real links: Home, Learning (`#/`), Records (`#/stats`), Wrong Book, Favorites.

`BlockMeter` clamps values to 0–100 and rounds filled cells with `Math.round(value / 10)`. It renders a labeled `role="progressbar"` container and ten presentational segments.

**Step 4: Replace the token system**

In `tailwind.config.js`, replace paper/pine/gold tokens with:

```js
machine: "#D8D7D1",
charcoal: "#24262B",
instruction: "#C93636",
crt: "#315C8C",
document: "#F4F2E9",
correct: { DEFAULT: "#2F7755", bg: "#DDEBE3" },
wrong: { DEFAULT: "#B33535", bg: "#F0DADA" },
warning: { DEFAULT: "#A66A16", bg: "#F2E6CF" },
```

Keep compatibility aliases only where needed during migration, then remove them in Task 6.

In `index.css`, add the shared classes from the design spec: `.system-window`, `.system-panel`, `.system-button`, `.system-button-primary`, `.system-tab`, `.system-tab-active`, `.system-label`, `.system-table`, `.status-cell`, option state classes, focus-visible, and reduced-motion rules. All shadows must be hard offsets with zero blur.

In `index.html`, change the theme color and pre-paint background to Machine Gray; remove Noto Serif and IBM Plex network font requests. Keep Noto Sans TC only if desired, with system fallbacks.

**Step 5: Verify GREEN**

Run: `cd frontend && npm test -- src/components/SystemShell.test.tsx src/components/BlockMeter.test.tsx`

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/src/components/SystemShell.tsx frontend/src/components/SystemShell.test.tsx frontend/src/components/BlockMeter.tsx frontend/src/components/BlockMeter.test.tsx frontend/src/index.css frontend/tailwind.config.js frontend/index.html
git commit -m "feat: add study system design primitives"
```

### Task 2: Integrate the application shell and redesign Home

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `frontend/src/pages/Home.tsx`
- Create: `frontend/src/pages/Home.test.tsx`

**Step 1: Write failing shell and Home tests**

Extend `App.test.tsx` with an assertion that the rendered practice route sits inside the banner/status shell and still completes the existing answer flow.

In `Home.test.tsx`, build a progress fixture with 326 completed questions and subject totals. Assert:

- `開始學習`, `錯題本`, `收藏`, and `統計` navigation are visible;
- all four modes link to the existing route targets;
- bank size is formatted as `5,400`;
- overall accuracy derived from the fixture is shown, not a hard-coded mockup value;
- clear-all invokes the supplied progress action after confirmation.

**Step 2: Run the tests to verify RED**

Run: `cd frontend && npm test -- src/App.test.tsx src/pages/Home.test.tsx`

Expected: Home test FAIL and shell assertions FAIL.

**Step 3: Integrate `SystemShell`**

Move `HashRouter` to wrap `SystemShell`, pass `bank.questions.length`, render all existing routes as children, and delete old `TopBar`/`Footer`. Keep `PracticeRoute` and `ReviewRoute` at module scope to preserve the fixed remount behavior.

**Step 4: Rebuild Home from live data**

Create the approved desktop layout:

- `aside` chapter index with route-aware links and bank size;
- lesson workspace with page header;
- `BlockMeter` progress summary;
- four ordered lesson rows using existing route destinations;
- subject record table using real `perSubject` values;
- clear progress as a system action with the existing confirmation.

Use responsive utilities so the chapter index becomes a horizontal nav below 820px.

**Step 5: Verify GREEN and existing flow**

Run: `cd frontend && npm test -- src/App.test.tsx src/pages/Home.test.tsx`

Expected: PASS, including the “answer does not remount” regression.

**Step 6: Commit**

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/pages/Home.tsx frontend/src/pages/Home.test.tsx
git commit -m "feat: apply study system shell and home"
```

### Task 3: Redesign question, explanation, progress, and timer states

**Files:**
- Modify: `frontend/src/components/QuestionCard.tsx`
- Modify: `frontend/src/components/QuestionCard.test.tsx`
- Modify: `frontend/src/components/ExplanationView.tsx`
- Modify: `frontend/src/components/ProgressBar.tsx`
- Modify: `frontend/src/components/Timer.tsx`
- Create: `frontend/src/components/Timer.test.tsx`

**Step 1: Extend tests before styling**

Update `QuestionCard.test.tsx` to assert every option button has `data-state`, the selected/correct/wrong values are exposed after reveal, the favorite control retains `aria-pressed`, and the explanation header reads `詳解資料`.

Add Timer tests using fake timers to assert normal status, warning status at 60 seconds, and `onExpire` at zero. Expose timer state via `data-state="normal|warning"` rather than testing full class strings.

**Step 2: Run tests to verify RED**

Run: `cd frontend && npm test -- src/components/QuestionCard.test.tsx src/components/Timer.test.tsx`

Expected: FAIL because state attributes and the new explanation label are absent.

**Step 3: Rebuild `QuestionCard` markup**

- Use `<article className="question-document system-window">`.
- Create a metadata title row with subject, year/round/question number, and `F8 收藏` control.
- Render option buttons as a two-column letter/text grid.
- Add `data-state={optionState(letter)}` to each option.
- Map states to centralized `.option-*` classes instead of long inline utility strings.
- Keep the existing `onSelect`, `disabled`, scoring, all-credit, animation, and verdict logic unchanged.

**Step 4: Redesign supporting components**

- `ExplanationView`: document subsection, `ANSWER REFERENCE / 詳解資料`, amber flagged system row, `DATA PENDING` empty state.
- `ProgressBar`: label plus `BlockMeter`, keeping current/total and derived percent.
- `Timer`: rectangular status cell with normal/warning data-state; keep effect semantics unchanged.

**Step 5: Verify GREEN**

Run: `cd frontend && npm test -- src/components/QuestionCard.test.tsx src/components/Timer.test.tsx src/pages/QuizRunner.test.tsx`

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/src/components/QuestionCard.tsx frontend/src/components/QuestionCard.test.tsx frontend/src/components/ExplanationView.tsx frontend/src/components/ProgressBar.tsx frontend/src/components/Timer.tsx frontend/src/components/Timer.test.tsx
git commit -m "feat: redesign study session components"
```

### Task 4: Redesign practice setup, quiz flow, and review states

**Files:**
- Modify: `frontend/src/pages/PracticeSetup.tsx`
- Modify: `frontend/src/pages/QuizRunner.tsx`
- Modify: `frontend/src/pages/QuizRunner.test.tsx`
- Modify: `frontend/src/pages/ReviewBook.tsx`
- Create: `frontend/src/pages/PracticeSetup.test.tsx`

**Step 1: Write failing setup tests**

Render each setup mode with a small fixture and assert:

- year mode shows year, round, and optional subject controls;
- random mode does not show year/round controls;
- selected controls expose `aria-pressed="true"`;
- available count updates after filtering;
- starting invokes the existing queue transition and shows the fixture question.

Extend `QuizRunner.test.tsx` to assert the completion result uses a status window and progress remains present while answering.

**Step 2: Run tests to verify RED**

Run: `cd frontend && npm test -- src/pages/PracticeSetup.test.tsx src/pages/QuizRunner.test.tsx`

Expected: FAIL on `aria-pressed` and new system-window structure.

**Step 3: Redesign `PracticeSetup`**

Build a `SETUP / PAGE 02` system window, square toggle key grids, a filter summary table, and red primary start key. Add `aria-pressed` to every toggle button. Preserve filter state and `sampleQuestions` calls exactly.

**Step 4: Redesign `QuizRunner` and `ReviewBook`**

- Add a session header with mode title, next/finish system button, and block progress.
- Keep the one-time question list snapshot and answer flow untouched.
- Render the done state as a result window.
- Render review empty states as system dialogs; non-empty states retain `QuizRunner`.

**Step 5: Verify GREEN**

Run: `cd frontend && npm test -- src/pages/PracticeSetup.test.tsx src/pages/QuizRunner.test.tsx src/App.test.tsx`

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/src/pages/PracticeSetup.tsx frontend/src/pages/PracticeSetup.test.tsx frontend/src/pages/QuizRunner.tsx frontend/src/pages/QuizRunner.test.tsx frontend/src/pages/ReviewBook.tsx
git commit -m "feat: redesign practice and review flows"
```

### Task 5: Redesign exam and statistics pages

**Files:**
- Modify: `frontend/src/pages/ExamRunner.tsx`
- Modify: `frontend/src/pages/Stats.tsx`
- Create: `frontend/src/pages/Stats.test.tsx`

**Step 1: Write failing statistics tests**

Render Stats with a fixture and assert:

- the overall percentage is represented by a progressbar;
- wrong/favorite counts are shown;
- all three subject rows display correct/attempted counts;
- no SVG circular progress element remains.

**Step 2: Run test to verify RED**

Run: `cd frontend && npm test -- src/pages/Stats.test.tsx`

Expected: FAIL because current Stats renders an SVG ring and no progressbar.

**Step 3: Redesign `ExamRunner`**

Use a sticky rectangular toolbar with back, answered count, Timer, and red submit key. Convert the result card into a system result window. Preserve submit guarding, scoring, progress recording, and scroll behavior.

**Step 4: Redesign `Stats`**

Replace `Ring` with `BlockMeter` and a large tabular percentage. Present wrong/favorite counts as record cells and subjects as a compact system table with horizontal block-style meters.

**Step 5: Verify GREEN**

Run: `cd frontend && npm test -- src/pages/Stats.test.tsx src/components/Timer.test.tsx`

Expected: PASS.

**Step 6: Commit**

```bash
git add frontend/src/pages/ExamRunner.tsx frontend/src/pages/Stats.tsx frontend/src/pages/Stats.test.tsx
git commit -m "feat: redesign exam and statistics views"
```

### Task 6: Remove compatibility styles and verify the full application

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/tailwind.config.js`
- Modify if required: `frontend/src/**/*.tsx`

**Step 1: Search for old design language**

Run:

```bash
cd frontend
rg -n "font-serif|rounded-full|rounded-xl|rounded-xl2|bg-gradient|shadow-card|paper|pine|gold" src tailwind.config.js
```

Expected: no production use except intentional correct/warning naming or markdown content. Mockups are out of scope for this search.

**Step 2: Remove compatibility aliases and fix remaining production classes**

Delete old theme tokens once no source references them. Replace any surviving soft card/pill styling with the approved semantic system classes.

**Step 3: Run complete automated verification**

Run:

```bash
cd frontend
npm test
npm run build
```

Expected: all tests PASS; TypeScript and Vite build exit 0.

**Step 4: Run localhost route checks**

With Vite running, request `/`, `/#/practice/random`, `/#/exam`, `/#/review/wrong`, and `/#/stats`; confirm HTTP 200 and no console-breaking build errors.

**Step 5: Perform responsive visual QA**

Inspect at 1440 × 1000 and 390 × 844:

- Home at zero and populated progress;
- setup pages for all three modes;
- unanswered, correct, wrong, all-credit, flagged, and no-explanation question states;
- quiz completion;
- exam before and after submit;
- empty wrong/favorite records;
- statistics;
- loading screen.

Confirm no horizontal overflow, primary targets at least 44px, and no old cream-serif-rounded visual patterns.

**Step 6: Commit final polish**

```bash
git add frontend/src frontend/index.html frontend/tailwind.config.js
git commit -m "fix: polish responsive study system theme"
```

### Task 7: Final branch verification and handoff

**Files:**
- No source changes unless verification finds a defect.

**Step 1: Review the diff against the design spec**

Run: `git diff 5f32943...HEAD -- frontend/src frontend/index.html frontend/tailwind.config.js`

Confirm no domain logic, question data, store schema, or route target changed.

**Step 2: Run fresh verification**

Run: `cd frontend && npm test && npm run build`

Expected: all suites pass and build succeeds.

**Step 3: Report the production localhost URL**

Provide `http://127.0.0.1:4175/` and note that `/mockups/` remains available for comparison.

**Step 4: Complete the feature branch**

Use `superpowers:finishing-a-development-branch`, preserve the base worktree’s untracked `.claude/`, and offer safe integration options.
