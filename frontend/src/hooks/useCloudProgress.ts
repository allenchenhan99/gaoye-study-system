import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Choice, Question } from "../lib/types";
import {
  defaultStore,
  loadStore,
  loadStoreFromKey,
  recordAnswer as recordAnswerInStore,
  recordExam as recordExamInStore,
  removeLegacyStore,
  removeWrong as removeWrongInStore,
  saveStoreToKey,
  toggleFavorite,
  type Store,
} from "../lib/store";
import { isCorrect } from "../lib/scoring";
import {
  buildStoreFromCloud,
  getUserCacheKey,
  hasMeaningfulProgress,
  type CloudProgressRows,
} from "../lib/cloudProgress";
import { supabase } from "../lib/supabase";

export interface ProgressBackend {
  load: () => Promise<Store>;
  importLocal: (clientId: string, store: Store) => Promise<void>;
  recordAnswer: (
    operationId: string,
    question: Pick<Question, "id" | "subject">,
    choice: Choice,
    correct: boolean
  ) => Promise<void>;
  setFavorite: (questionId: string, active: boolean) => Promise<void>;
  removeWrong: (questionId: string) => Promise<void>;
  recordExam: (operationId: string, date: string, score: number, total: number) => Promise<void>;
  clearAll: (operationId: string) => Promise<void>;
}

export type SyncStatus = "loading" | "syncing" | "synced" | "error" | "unavailable";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json | undefined };

const CLIENT_ID_KEY = "gaoye-client-id-v1";

type QueuedOperation =
  | {
      kind: "answer";
      operationId: string;
      questionId: string;
      subject: Question["subject"];
      choice: Choice;
      correct: boolean;
    }
  | { kind: "favorite"; operationId: string; questionId: string; active: boolean }
  | { kind: "remove-wrong"; operationId: string; questionId: string }
  | { kind: "exam"; operationId: string; date: string; score: number; total: number }
  | { kind: "clear"; operationId: string };

export function getSyncQueueKey(userId: string): string {
  return `gaoye-sync-queue-v1:${userId}`;
}

function makeOperationId(): string {
  return globalThis.crypto.randomUUID();
}

function getClientId(): string {
  const saved = localStorage.getItem(CLIENT_ID_KEY);
  if (saved) return saved;
  const clientId = makeOperationId();
  localStorage.setItem(CLIENT_ID_KEY, clientId);
  return clientId;
}

function throwOnError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function loadQueue(key: string): QueuedOperation[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isQueuedOperation) : [];
  } catch {
    return [];
  }
}

function isQueuedOperation(value: unknown): value is QueuedOperation {
  if (!value || typeof value !== "object") return false;
  const operation = value as Record<string, unknown>;
  if (typeof operation.operationId !== "string" || typeof operation.kind !== "string") return false;
  if (operation.kind === "clear") return true;
  if (operation.kind === "favorite") {
    return typeof operation.questionId === "string" && typeof operation.active === "boolean";
  }
  if (operation.kind === "remove-wrong") return typeof operation.questionId === "string";
  if (operation.kind === "exam") {
    return typeof operation.date === "string"
      && typeof operation.score === "number"
      && typeof operation.total === "number";
  }
  return operation.kind === "answer"
    && typeof operation.questionId === "string"
    && (operation.subject === "law" || operation.subject === "investment" || operation.subject === "finance")
    && (operation.choice === "A" || operation.choice === "B" || operation.choice === "C" || operation.choice === "D")
    && typeof operation.correct === "boolean";
}

function saveQueue(key: string, queue: QueuedOperation[]): void {
  localStorage.setItem(key, JSON.stringify(queue));
}

async function executeQueuedOperation(backend: ProgressBackend, operation: QueuedOperation): Promise<void> {
  if (operation.kind === "answer") {
    await backend.recordAnswer(
      operation.operationId,
      { id: operation.questionId, subject: operation.subject },
      operation.choice,
      operation.correct
    );
    return;
  }
  if (operation.kind === "favorite") {
    await backend.setFavorite(operation.questionId, operation.active);
    return;
  }
  if (operation.kind === "remove-wrong") {
    await backend.removeWrong(operation.questionId);
    return;
  }
  if (operation.kind === "exam") {
    await backend.recordExam(
      operation.operationId,
      operation.date,
      operation.score,
      operation.total
    );
    return;
  }
  await backend.clearAll(operation.operationId);
}

export function createSupabaseProgressBackend(userId: string): ProgressBackend | null {
  const client = supabase;
  if (!client) return null;

  return {
    async load() {
      const [questionProgress, subjectStats, favorites, wrongBook, examAttempts, settings] = await Promise.all([
        client.from("question_progress").select("question_id,answered_count,last_choice,last_correct").eq("user_id", userId),
        client.from("subject_stats").select("subject,done_count,correct_count").eq("user_id", userId),
        client.from("favorites").select("question_id").eq("user_id", userId),
        client.from("wrong_book").select("question_id").eq("user_id", userId),
        client.from("exam_attempts").select("completed_at,score,total").eq("user_id", userId).order("completed_at", { ascending: false }),
        client.from("user_settings").select("per_round_count,exam_timer_min,dark_mode").eq("user_id", userId).maybeSingle(),
      ]);

      for (const result of [questionProgress, subjectStats, favorites, wrongBook, examAttempts, settings]) {
        throwOnError(result.error);
      }

      return buildStoreFromCloud({
        questionProgress: (questionProgress.data ?? []) as CloudProgressRows["questionProgress"],
        subjectStats: (subjectStats.data ?? []) as CloudProgressRows["subjectStats"],
        favorites: (favorites.data ?? []) as CloudProgressRows["favorites"],
        wrongBook: (wrongBook.data ?? []) as CloudProgressRows["wrongBook"],
        examAttempts: (examAttempts.data ?? []) as CloudProgressRows["examAttempts"],
        settings: (settings.data ?? null) as CloudProgressRows["settings"],
      });
    },
    async importLocal(clientId, store) {
      const { error } = await client.rpc("import_local_progress", {
        p_client_id: clientId,
        p_payload: store as unknown as Json,
      });
      throwOnError(error);
    },
    async recordAnswer(operationId, question, choice, correct) {
      const { error } = await client.rpc("record_answer", {
        p_operation_id: operationId,
        p_question_id: question.id,
        p_subject: question.subject,
        p_choice: choice,
        p_correct: correct,
      });
      throwOnError(error);
    },
    async setFavorite(questionId, active) {
      if (active) {
        const { error } = await client.from("favorites").upsert(
          { user_id: userId, question_id: questionId },
          { onConflict: "user_id,question_id" }
        );
        throwOnError(error);
        return;
      }
      const { error } = await client.from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", questionId);
      throwOnError(error);
    },
    async removeWrong(questionId) {
      const { error } = await client.from("wrong_book")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", questionId);
      throwOnError(error);
    },
    async recordExam(operationId, date, score, total) {
      const { error } = await client.rpc("record_exam", {
        p_operation_id: operationId,
        p_completed_at: date,
        p_score: score,
        p_total: total,
      });
      throwOnError(error);
    },
    async clearAll(operationId) {
      const { error } = await client.rpc("clear_learning_progress", {
        p_operation_id: operationId,
      });
      throwOnError(error);
    },
  };
}

export function useCloudProgress(
  userId: string,
  backendOverride?: ProgressBackend | null
) {
  const defaultBackend = useMemo(() => createSupabaseProgressBackend(userId), [userId]);
  const backend = backendOverride === undefined ? defaultBackend : backendOverride;
  const cacheKey = getUserCacheKey(userId);
  const queueKey = getSyncQueueKey(userId);
  const [store, setStore] = useState<Store>(() => loadStoreFromKey(cacheKey));
  const storeRef = useRef(store);
  const queueRef = useRef<QueuedOperation[]>(loadQueue(queueKey));
  const flushPromiseRef = useRef<Promise<boolean> | null>(null);
  const mutationRevisionRef = useRef(0);
  const [loading, setLoading] = useState(Boolean(backend));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(backend ? "loading" : "unavailable");
  const [syncError, setSyncError] = useState<string | null>(null);

  const apply = useCallback((next: Store) => {
    storeRef.current = next;
    saveStoreToKey(cacheKey, next);
    setStore(next);
  }, [cacheKey]);

  const flushQueue = useCallback((): Promise<boolean> => {
    if (!backend) return Promise.resolve(false);
    if (flushPromiseRef.current) return flushPromiseRef.current;

    let resolvePending!: (value: boolean) => void;
    const pending = new Promise<boolean>((resolve) => { resolvePending = resolve; });
    flushPromiseRef.current = pending;

    void (async () => {
      let succeeded = false;
      setSyncStatus("syncing");
      setSyncError(null);

      try {
        while (queueRef.current.length > 0) {
          try {
            await executeQueuedOperation(backend, queueRef.current[0]);
          } catch {
            setSyncStatus("error");
            setSyncError("部分進度尚未同步，系統會在下次連線時自動重試。");
            return;
          }
          queueRef.current = queueRef.current.slice(1);
          saveQueue(queueKey, queueRef.current);
        }

        setSyncStatus("synced");
        setSyncError(null);
        succeeded = true;
      } catch {
        setSyncStatus("error");
        setSyncError("部分進度尚未同步，系統會在下次連線時自動重試。");
      } finally {
        flushPromiseRef.current = null;
        resolvePending(succeeded);
      }
    })();

    return pending;
  }, [backend, queueKey]);

  const enqueue = useCallback((operation: QueuedOperation) => {
    mutationRevisionRef.current += 1;
    queueRef.current = [...queueRef.current, operation];
    saveQueue(queueKey, queueRef.current);
    if (!backend) {
      setSyncStatus("error");
      setSyncError("進度已保留在這台裝置，登入服務恢復後會自動同步。");
      return;
    }
    void flushQueue();
  }, [backend, flushQueue, queueKey]);

  useEffect(() => {
    if (!backend) return;
    const retryWhenOnline = () => {
      void (async () => {
        try {
          while (await flushQueue()) {
            const revisionBeforeLoad = mutationRevisionRef.current;
            const cloudStore = await backend.load();
            if (
              queueRef.current.length > 0
              || mutationRevisionRef.current !== revisionBeforeLoad
            ) continue;
            apply(cloudStore);
            setSyncStatus("synced");
            setSyncError(null);
            return;
          }
        } catch {
          setSyncStatus("error");
          setSyncError("網路已恢復，但雲端進度讀取失敗；系統會保留裝置紀錄。");
        }
      })();
    };
    window.addEventListener("online", retryWhenOnline);
    return () => window.removeEventListener("online", retryWhenOnline);
  }, [apply, backend, flushQueue]);

  useEffect(() => {
    if (!backend) {
      setLoading(false);
      setSyncStatus("unavailable");
      return;
    }

    let active = true;
    const legacyStore = loadStore();
    const shouldImport = hasMeaningfulProgress(legacyStore);

    void (async () => {
      try {
        let importFailed = false;
        if (shouldImport) {
          try {
            await backend.importLocal(getClientId(), legacyStore);
            removeLegacyStore();
          } catch {
            importFailed = true;
          }
        }
        const cloudStore = await backend.load();
        if (!active) return;

        if (queueRef.current.length === 0) {
          apply(cloudStore);
        } else {
          const flushed = await flushQueue();
          if (!flushed || !active) return;
          apply(await backend.load());
        }

        if (importFailed) {
          setSyncStatus("error");
          setSyncError("雲端進度已載入，但舊的本機進度尚未匯入；下次登入會再試一次。");
        } else {
          setSyncStatus("synced");
          setSyncError(null);
        }
      } catch {
        if (!active) return;
        setSyncStatus("error");
        setSyncError("雲端進度讀取失敗，目前顯示這台裝置的最近紀錄。");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [apply, backend, flushQueue]);

  const answer = useCallback((question: Question, choice: Choice) => {
    const correct = isCorrect(question, choice);
    apply(recordAnswerInStore(storeRef.current, question, choice));
    enqueue({
      kind: "answer",
      operationId: makeOperationId(),
      questionId: question.id,
      subject: question.subject,
      choice,
      correct,
    });
  }, [apply, enqueue]);

  const toggleFav = useCallback((questionId: string) => {
    const active = !storeRef.current.favorites.includes(questionId);
    apply(toggleFavorite(storeRef.current, questionId));
    enqueue({ kind: "favorite", operationId: makeOperationId(), questionId, active });
  }, [apply, enqueue]);

  const removeWrong = useCallback((questionId: string) => {
    apply(removeWrongInStore(storeRef.current, questionId));
    enqueue({ kind: "remove-wrong", operationId: makeOperationId(), questionId });
  }, [apply, enqueue]);

  const recordExam = useCallback((score: number, total: number) => {
    const date = new Date().toISOString();
    apply(recordExamInStore(storeRef.current, { date, score, total }));
    enqueue({ kind: "exam", operationId: makeOperationId(), date, score, total });
  }, [apply, enqueue]);

  const clearAll = useCallback(() => {
    apply(defaultStore());
    enqueue({ kind: "clear", operationId: makeOperationId() });
  }, [apply, enqueue]);

  return {
    store,
    loading,
    syncStatus,
    syncError,
    answer,
    toggleFav,
    removeWrong,
    recordExam,
    clearAll,
  };
}
