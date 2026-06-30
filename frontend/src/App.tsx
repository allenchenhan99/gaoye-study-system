import { useMemo } from "react";
import { HashRouter, Routes, Route, useParams } from "react-router-dom";
import { useQuestionBank } from "./hooks/useQuestionBank";
import { useLocalProgress } from "./hooks/useLocalProgress";
import { Home } from "./pages/Home";
import { PracticeSetup } from "./pages/PracticeSetup";
import { ExamRunner } from "./pages/ExamRunner";
import { ReviewBook } from "./pages/ReviewBook";
import { Stats } from "./pages/Stats";
import { sampleQuestions } from "./lib/sampling";

export default function App() {
  const bank = useQuestionBank();
  const progress = useLocalProgress();
  const examQuestions = useMemo(
    () => sampleQuestions(bank.questions, { count: 50 }),
    [bank.questions]
  );

  if (bank.loading) return <div className="p-8 text-center">題庫載入中…</div>;

  const common = { questions: bank.questions, explanations: bank.explanations, progress };

  function PracticeRoute() {
    const { mode } = useParams();
    const m = (mode as "year" | "random" | "subject") ?? "random";
    return <PracticeSetup key={m} mode={m} {...common} />;
  }
  function ReviewRoute() {
    const { kind } = useParams();
    return (
      <ReviewBook kind={(kind as "wrong" | "favorites") ?? "wrong"}
        byId={bank.byId} explanations={bank.explanations} progress={progress} />
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home progress={progress} />} />
          <Route path="/practice/:mode" element={<PracticeRoute />} />
          <Route path="/exam" element={
            <ExamRunner questions={examQuestions} explanations={bank.explanations} progress={progress} />
          } />
          <Route path="/review/:kind" element={<ReviewRoute />} />
          <Route path="/stats" element={<Stats progress={progress} />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
