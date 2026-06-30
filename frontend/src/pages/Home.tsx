import { Link } from "react-router-dom";
import type { useLocalProgress } from "../hooks/useLocalProgress";

const MODES = [
  { to: "/practice/year", label: "年份練習", desc: "選年份次別科目" },
  { to: "/practice/random", label: "隨機練習", desc: "全題庫隨機" },
  { to: "/practice/subject", label: "科目練習", desc: "三科擇一" },
  { to: "/exam", label: "模擬考", desc: "50 題計時" },
  { to: "/review/wrong", label: "錯題本", desc: "答錯自動收錄" },
  { to: "/review/favorites", label: "收藏", desc: "標星題目" },
  { to: "/stats", label: "統計", desc: "作答與正確率" },
];

export function Home({ progress }: { progress: ReturnType<typeof useLocalProgress> }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-1">高業考古題練習</h1>
      <p className="text-sm text-gray-600 mb-4">
        證券商高級業務員・已作答 {progress.store.stats.totalDone} 題・錯題 {progress.store.wrongBook.length}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {MODES.map((m) => (
          <Link key={m.to} to={m.to} className="p-4 bg-white rounded shadow hover:bg-gray-50">
            <div className="font-semibold">{m.label}</div>
            <div className="text-xs text-gray-500">{m.desc}</div>
          </Link>
        ))}
      </div>
      <button className="mt-6 text-sm text-red-600 underline"
        onClick={() => { if (confirm("確定清除所有進度？")) progress.clearAll(); }}>
        清除所有進度
      </button>
    </div>
  );
}
