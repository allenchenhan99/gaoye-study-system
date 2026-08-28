import { useMemo } from "react";
import { HashRouter, Routes, Route, useParams } from "react-router-dom";
import { useQuestionBank } from "./hooks/useQuestionBank";
import { useCloudProgress } from "./hooks/useCloudProgress";
import { useAuth, type AuthUser } from "./hooks/useAuth";
import type { Bank } from "./hooks/useQuestionBank";
import { Home } from "./pages/Home";
import { PracticeSetup } from "./pages/PracticeSetup";
import { ExamRunner } from "./pages/ExamRunner";
import { ReviewBook } from "./pages/ReviewBook";
import { Stats } from "./pages/Stats";
import { sampleQuestions } from "./lib/sampling";
import { SystemShell } from "./components/SystemShell";
import { PublicLanding } from "./components/PublicLanding";

type Progress = ReturnType<typeof useCloudProgress>;

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
  const auth = useAuth();

  if (auth.status === "loading") return <LoadingScreen label="登入狀態確認中…" />;

  if (auth.status !== "authenticated" || !auth.user) {
    return (
      <PublicLanding
        configured={auth.status !== "unconfigured"}
        busy={auth.busy}
        error={auth.error}
        onSignIn={auth.signIn}
      />
    );
  }

  return (
    <AuthenticatedApp
      user={auth.user}
      onSignOut={auth.signOut}
      accountBusy={auth.busy}
      accountError={auth.error}
    />
  );
}

function AuthenticatedApp({
  user,
  onSignOut,
  accountBusy,
  accountError,
}: {
  user: AuthUser;
  onSignOut: () => Promise<void>;
  accountBusy: boolean;
  accountError: string | null;
}) {
  const bank = useQuestionBank();
  const progress = useCloudProgress(user.id);
  const examQuestions = useMemo(
    () => sampleQuestions(bank.questions, { count: 50 }),
    [bank.questions]
  );

  if (bank.loading || progress.loading) return <LoadingScreen label="個人學習資料載入中…" />;

  return (
    <HashRouter>
      <SystemShell
        bankSize={bank.questions.length}
        user={user}
        onSignOut={onSignOut}
        accountBusy={accountBusy}
        accountError={accountError}
        syncStatus={progress.syncStatus}
        syncError={progress.syncError}
      >
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
      </SystemShell>
    </HashRouter>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-machine p-4">
      <div className="system-window w-full max-w-sm p-5">
        <div className="system-label">DISK A: READING</div>
        <div className="mt-4 grid grid-cols-8 gap-1" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} className="h-5 border-2 border-charcoal bg-crt" />
          ))}
        </div>
        <p className="mt-4 font-mono text-sm font-bold text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
