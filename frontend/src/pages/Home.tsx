import { Link } from "react-router-dom";
import { BlockMeter } from "../components/BlockMeter";
import type { useLocalProgress } from "../hooks/useLocalProgress";
import type { Subject } from "../lib/types";

interface Lesson {
  to: string;
  label: string;
  description: string;
  meta: string;
  keyLabel: string;
}

const LESSONS: Lesson[] = [
  { to: "/practice/year", label: "年份練習", description: "依年度、次別與科目開啟完整試卷。", meta: "11 YEARS", keyLabel: "ENTER" },
  { to: "/practice/random", label: "隨機練習", description: "從全部題庫抽出 20 題快速複習。", meta: "20 ITEMS", keyLabel: "ENTER" },
  { to: "/practice/subject", label: "科目練習", description: "法規、投資學、財務分析，選一科集中練習。", meta: "3 SUBJECTS", keyLabel: "ENTER" },
  { to: "/exam", label: "模擬考", description: "50 題、60 分鐘，交卷後檢視完整解析。", meta: "60 MIN", keyLabel: "START" },
];

const SUBJECTS: { key: Subject; label: string }[] = [
  { key: "law", label: "證券交易法規" },
  { key: "investment", label: "證券投資學" },
  { key: "finance", label: "財務分析" },
];

interface HomeProps {
  progress: ReturnType<typeof useLocalProgress>;
  bankSize: number;
}

export function Home({ progress, bankSize }: HomeProps) {
  const { totalDone, perSubject } = progress.store.stats;
  const totalCorrect = SUBJECTS.reduce((sum, subject) => sum + perSubject[subject.key].correct, 0);
  const overall = totalDone ? Math.round((totalCorrect / totalDone) * 100) : 0;

  return (
    <div className="grid min-h-[720px] grid-cols-[270px_minmax(0,1fr)] max-[820px]:block">
      <aside className="flex flex-col border-r-4 border-charcoal bg-machine p-5 max-[820px]:border-b-4 max-[820px]:border-r-0 max-[820px]:p-3">
        <div className="border-b-[3px] border-double border-line pb-5 max-[820px]:flex max-[820px]:items-center max-[820px]:gap-4 max-[820px]:pb-3">
          <span className="system-label">EDITION 1.14</span>
          <div className="system-disk mt-5 max-[820px]:mt-0" aria-hidden="true"><span /></div>
          <div>
            <h1 className="mt-4 text-[2rem] font-black leading-none max-[820px]:mt-0 max-[820px]:text-xl">高業<br className="max-[820px]:hidden" />考古題</h1>
            <p className="mt-2 text-xs text-ink-soft">證券商高級業務員</p>
          </div>
        </div>

        <nav className="mt-5 grid border-[3px] border-charcoal max-[820px]:mt-3 max-[820px]:grid-cols-4 max-[540px]:grid-cols-2" aria-label="章節索引">
          <IndexLink to="/" number="01" label="開始學習" active />
          <IndexLink to="/review/wrong" number="02" label="錯題本" count={progress.store.wrongBook.length} />
          <IndexLink to="/review/favorites" number="03" label="收藏" count={progress.store.favorites.length} />
          <IndexLink to="/stats" number="04" label="統計" />
        </nav>

        <div className="mt-auto bg-charcoal p-4 text-document max-[820px]:mt-3">
          <span className="block font-mono text-[0.58rem] font-bold">QUESTION DATABASE</span>
          <strong className="my-2 block font-mono text-3xl font-black text-[#9BC7F0]">{bankSize.toLocaleString()}</strong>
          <small className="block font-mono text-[0.58rem]">records indexed</small>
        </div>
      </aside>

      <section className="p-8 max-md:p-4">
        <header className="flex items-end justify-between gap-5 border-b-4 border-charcoal pb-4">
          <div>
            <span className="system-label">LESSON SELECT / PAGE 01</span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">請選擇今天的學習方式</h2>
            <p className="mt-1 text-sm text-ink-faint">進度會自動同步至你的 Google 帳號。</p>
          </div>
          <div className="font-mono text-5xl font-black text-crt max-sm:text-4xl">01<small className="text-xs text-ink-faint">/06</small></div>
        </header>

        <section className="system-window mt-5 grid grid-cols-[180px_minmax(160px,1fr)_90px] items-center gap-5 p-4 max-sm:grid-cols-[1fr_70px]" aria-label="目前學習進度">
          <div>
            <span className="system-label">學習進度</span>
            <strong className="mt-1 block text-sm">{totalDone.toLocaleString()} 題完成</strong>
            <small className="font-mono text-[0.56rem] text-ink-faint">OVERALL ACCURACY</small>
          </div>
          <BlockMeter value={overall} label="整體正確率" className="max-sm:col-span-2 max-sm:row-start-2" />
          <div className="text-right font-mono" data-overall-rate aria-label={`整體正確率 ${overall}%`}>
            <strong className="text-3xl font-black text-crt">{overall}</strong><span className="font-black">%</span>
          </div>
        </section>

        <ol className="mt-5 grid gap-2">
          {LESSONS.map((lesson, index) => (
            <li key={lesson.to}>
              <Link
                to={lesson.to}
                className={`lesson-row system-window grid min-h-[78px] grid-cols-[70px_minmax(170px,1fr)_110px_80px] items-stretch no-underline max-sm:grid-cols-[58px_1fr_58px] ${lesson.to === "/exam" ? "is-recommended" : ""}`}
              >
                <span className="grid place-items-center border-r-2 border-charcoal bg-machine p-2 text-center font-mono text-[0.58rem] font-bold">
                  {lesson.to === "/exam" ? "EXAM" : "LESSON"}<b className="block text-lg">{String(index + 1).padStart(2, "0")}</b>
                </span>
                <span className="p-3">
                  <strong className="block text-base">{lesson.label}</strong>
                  <small className="mt-1 block text-xs leading-5 text-ink-soft">{lesson.description}</small>
                </span>
                <span className="self-center font-mono text-[0.58rem] font-bold text-ink-faint max-sm:hidden">MODE<br /><b className="text-ink">{lesson.meta}</b></span>
                <span className="grid place-items-center bg-charcoal px-2 font-mono text-[0.58rem] font-bold text-document">{lesson.keyLabel} ↵</span>
              </Link>
            </li>
          ))}
        </ol>

        <section className="mt-6 border-t-[3px] border-charcoal pt-3" aria-label="科目別成績">
          <header className="mb-2 flex justify-between font-mono text-[0.62rem] font-bold">
            <span className="text-instruction">SUBJECT RECORD</span><b>科目別成績</b>
          </header>
          <div className="grid gap-2">
            {SUBJECTS.map((subject) => {
              const record = perSubject[subject.key];
              const rate = record.done ? Math.round((record.correct / record.done) * 100) : 0;
              return (
                <div key={subject.key} className="grid grid-cols-[130px_1fr_90px] items-center gap-3 text-xs max-sm:grid-cols-[100px_1fr_72px]">
                  <span>{subject.label}</span>
                  <BlockMeter value={rate} label={`${subject.label}正確率`} />
                  <em className="font-mono font-bold not-italic text-right">{record.correct} / {record.done}</em>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            className="system-button text-wrong"
            onClick={() => {
              if (confirm("確定清除所有進度？")) progress.clearAll();
            }}
          >
            清除所有進度
          </button>
        </div>
      </section>
    </div>
  );
}

function IndexLink({
  to,
  number,
  label,
  count,
  active = false,
}: {
  to: string;
  number: string;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`grid min-h-[52px] grid-cols-[32px_1fr_auto] items-center border-b-2 border-charcoal px-2 text-sm font-bold no-underline last:border-b-0 max-[820px]:border-b-0 max-[820px]:border-r-2 max-[540px]:border-b-2 ${active ? "bg-crt text-document" : "bg-document hover:bg-machine"}`}
    >
      <b className="font-mono text-[0.62rem]">{number}</b>
      <span>{label}</span>
      {count !== undefined && <small className="font-mono text-[0.58rem]">{count}</small>}
    </Link>
  );
}
