import { useMemo } from "react";
import { HashRouter, Routes, Route, useParams } from "react-router-dom";
import { useQuestionBank } from "./hooks/useQuestionBank";
import { useLocalProgress } from "./hooks/useLocalProgress";
import type { Bank } from "./hooks/useQuestionBank";
import { Home } from "./pages/Home";
import { PracticeSetup } from "./pages/PracticeSetup";
import { ExamRunner } from "./pages/ExamRunner";
import { ReviewBook } from "./pages/ReviewBook";
import { Stats } from "./pages/Stats";
import { sampleQuestions } from "./lib/sampling";

type Progress = ReturnType<typeof useLocalProgress>;

// 這兩個路由元件必須定義在 App 外部（module scope）。
// 若寫在 App 內，每次作答觸發 App 重繪都會產生新的函式身分，
// React 會把整個練習/錯題本子樹卸載重掛，導致 QuizRunner 狀態被重置
// （答完就跳回第一題、看不到正解與詳解）。
function PracticeRoute({ bank, progress }: { bank: Bank; progress: Progress }) {
  const { mode } = useParams();
  const m = (mode as "year" | "random" | "subject") ?? "random";
  return (
    <PracticeSetup
      key={m}
      mode={m}
      questions={bank.questions}
      explanations={bank.explanations}
      progress={progress}
    />
  );
}

function ReviewRoute({ bank, progress }: { bank: Bank; progress: Progress }) {
  const { kind } = useParams();
  return (
    <ReviewBook
      kind={(kind as "wrong" | "favorites") ?? "wrong"}
      byId={bank.byId}
      explanations={bank.explanations}
      progress={progress}
    />
  );
}

export default function App() {
  const bank = useQuestionBank();
  const progress = useLocalProgress();
  const examQuestions = useMemo(
    () => sampleQuestions(bank.questions, { count: 50 }),
    [bank.questions]
  );

  if (bank.loading) return <LoadingScreen />;

  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home progress={progress} bankSize={bank.questions.length} />} />
            <Route path="/practice/:mode" element={<PracticeRoute bank={bank} progress={progress} />} />
            <Route
              path="/exam"
              element={
                <ExamRunner questions={examQuestions} explanations={bank.explanations} progress={progress} />
              }
            />
            <Route path="/review/:kind" element={<ReviewRoute bank={bank} progress={progress} />} />
            <Route path="/stats" element={<Stats progress={progress} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

function TopBar() {
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-3 sm:px-6">
        <a href="#/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-pine font-serif text-sm font-black text-paper">
            高
          </span>
          <span className="font-serif text-base font-bold tracking-wide text-ink">高業考古題</span>
        </a>
        <span className="ml-auto eyebrow hidden sm:block">應試精練</span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-line/70">
      <div className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-ink-faint sm:px-6">
        歷屆題庫僅供複習之用 · 答案與詳解以主管機關公告為準 · 進度儲存於本機瀏覽器
      </div>
    </footer>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-12 w-12 animate-pulse place-items-center rounded-lg bg-pine font-serif text-lg font-black text-paper">
          高
        </span>
        <p className="font-mono text-sm tracking-widest text-ink-faint">題庫載入中…</p>
      </div>
    </div>
  );
}
