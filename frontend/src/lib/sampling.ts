import type { Question, Subject } from "./types";

interface FilterOpts { subject?: Subject; year?: number; round?: number; }
interface SampleOpts extends FilterOpts { count?: number; rng?: () => number; }

export function filterPool(pool: Question[], opts: FilterOpts): Question[] {
  return pool.filter(
    (q) =>
      (opts.subject === undefined || q.subject === opts.subject) &&
      (opts.year === undefined || q.year === opts.year) &&
      (opts.round === undefined || q.round === opts.round)
  );
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleQuestions(pool: Question[], opts: SampleOpts = {}): Question[] {
  const rng = opts.rng ?? Math.random;
  const filtered = filterPool(pool, opts);
  const shuffled = shuffle(filtered, rng);
  return opts.count === undefined ? shuffled : shuffled.slice(0, opts.count);
}
