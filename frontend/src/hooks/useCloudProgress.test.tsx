import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Question } from "../lib/types";
import { defaultStore, recordAnswer, saveStore } from "../lib/store";
import { getUserCacheKey } from "../lib/cloudProgress";
import { getSyncQueueKey, useCloudProgress, type ProgressBackend } from "./useCloudProgress";

const question: Question = {
  id: "114-1-law-001",
  year: 114,
  round: 1,
  roundLabel: "第1次",
  subject: "law",
  subjectLabel: "L",
  number: 1,
  stem: "題目",
  options: { A: "甲", B: "乙", C: "丙", D: "丁" },
  answer: "C",
};

function createBackend(cloudStore = defaultStore()): ProgressBackend {
  return {
    load: vi.fn().mockResolvedValue(cloudStore),
    importLocal: vi.fn().mockResolvedValue(undefined),
    recordAnswer: vi.fn().mockResolvedValue(undefined),
    setFavorite: vi.fn().mockResolvedValue(undefined),
    removeWrong: vi.fn().mockResolvedValue(undefined),
    recordExam: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
  };
}

describe("useCloudProgress", () => {
  beforeEach(() => localStorage.clear());

  it("imports meaningful legacy progress once before loading the user's cloud store", async () => {
    saveStore(recordAnswer(defaultStore(), question, "C"));
    const cloudStore = recordAnswer(defaultStore(), question, "C");
    const backend = createBackend(cloudStore);
    const { result } = renderHook(() => useCloudProgress("user-1", backend));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(backend.importLocal).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      stats: expect.objectContaining({ totalDone: 1 }),
    }));
    expect(backend.load).toHaveBeenCalledOnce();
    expect(result.current.store.stats.totalDone).toBe(1);
    expect(JSON.parse(localStorage.getItem(getUserCacheKey("user-1")) ?? "null")).toMatchObject({
      stats: { totalDone: 1 },
    });
  });

  it("updates the device cache immediately and syncs an idempotent answer operation", async () => {
    const backend = createBackend();
    const { result } = renderHook(() => useCloudProgress("user-2", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.answer(question, "A"));

    expect(result.current.store.wrongBook).toContain(question.id);
    expect(result.current.store.stats.totalDone).toBe(1);
    expect(backend.recordAnswer).toHaveBeenCalledWith(
      expect.any(String),
      { id: question.id, subject: question.subject },
      "A",
      false
    );
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
  });

  it("keeps cached progress available when the network load fails", async () => {
    const cached = recordAnswer(defaultStore(), question, "C");
    localStorage.setItem(getUserCacheKey("user-3"), JSON.stringify(cached));
    const backend = createBackend();
    vi.mocked(backend.load).mockRejectedValueOnce(new Error("offline"));

    const { result } = renderHook(() => useCloudProgress("user-3", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.store.stats.totalDone).toBe(1);
    expect(result.current.syncStatus).toBe("error");
    expect(result.current.syncError).toMatch(/雲端進度/);
  });

  it("still loads cloud progress when the one-time legacy import fails", async () => {
    saveStore(recordAnswer(defaultStore(), question, "A"));
    const cloudStore = recordAnswer(defaultStore(), question, "C");
    const backend = createBackend(cloudStore);
    vi.mocked(backend.importLocal).mockRejectedValueOnce(new Error("invalid legacy payload"));

    const { result } = renderHook(() => useCloudProgress("user-import-error", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(backend.load).toHaveBeenCalledOnce();
    expect(result.current.store.progress[question.id].correct).toBe(true);
    expect(result.current.syncStatus).toBe("error");
    expect(result.current.syncError).toMatch(/本機進度尚未匯入/);
    expect(localStorage.getItem("gaoye-store-v1")).not.toBeNull();
  });

  it("persists failed mutations and retries them after the next mount", async () => {
    const offlineBackend = createBackend();
    vi.mocked(offlineBackend.recordAnswer).mockRejectedValueOnce(new Error("offline"));
    const first = renderHook(() => useCloudProgress("user-4", offlineBackend));
    await waitFor(() => expect(first.result.current.loading).toBe(false));

    act(() => first.result.current.answer(question, "A"));
    await waitFor(() => expect(first.result.current.syncStatus).toBe("error"));
    const queuedOperation = JSON.parse(localStorage.getItem(getSyncQueueKey("user-4")) ?? "[]")[0];
    expect(queuedOperation).toMatchObject({ kind: "answer", questionId: question.id });
    first.unmount();

    const syncedStore = recordAnswer(defaultStore(), question, "A");
    const recoveredBackend = createBackend();
    vi.mocked(recoveredBackend.load)
      .mockResolvedValueOnce(defaultStore())
      .mockResolvedValueOnce(syncedStore);
    const second = renderHook(() => useCloudProgress("user-4", recoveredBackend));

    await waitFor(() => expect(second.result.current.syncStatus).toBe("synced"));
    expect(recoveredBackend.recordAnswer).toHaveBeenCalledWith(
      queuedOperation.operationId,
      { id: question.id, subject: question.subject },
      "A",
      false
    );
    expect(second.result.current.store.stats.totalDone).toBe(1);
    expect(JSON.parse(localStorage.getItem(getSyncQueueKey("user-4")) ?? "[]")).toEqual([]);
  });

  it("serializes mutations so clear-all cannot overtake a pending answer", async () => {
    let finishAnswer: (() => void) | undefined;
    const answerPending = new Promise<void>((resolve) => { finishAnswer = resolve; });
    const backend = createBackend();
    vi.mocked(backend.recordAnswer).mockReturnValueOnce(answerPending);
    const { result } = renderHook(() => useCloudProgress("user-ordered", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.answer(question, "A");
      result.current.clearAll();
    });

    expect(backend.recordAnswer).toHaveBeenCalledOnce();
    expect(backend.clearAll).not.toHaveBeenCalled();
    const clearOperation = JSON.parse(
      localStorage.getItem(getSyncQueueKey("user-ordered")) ?? "[]"
    )[1];

    await act(async () => finishAnswer?.());
    await waitFor(() => expect(backend.clearAll).toHaveBeenCalledWith(clearOperation.operationId));
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
    expect(result.current.store.stats.totalDone).toBe(0);
  });

  it("retries the durable queue when the browser reports connectivity is back", async () => {
    const backend = createBackend();
    vi.mocked(backend.setFavorite).mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useCloudProgress("user-online", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.toggleFav(question.id));
    await waitFor(() => expect(result.current.syncStatus).toBe("error"));

    act(() => window.dispatchEvent(new Event("online")));

    await waitFor(() => expect(backend.setFavorite).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.syncStatus).toBe("synced"));
    expect(JSON.parse(localStorage.getItem(getSyncQueueKey("user-online")) ?? "[]")).toEqual([]);
  });

  it("reloads cloud progress when connectivity returns after the initial load failed", async () => {
    const cloudStore = recordAnswer(defaultStore(), question, "C");
    const backend = createBackend(cloudStore);
    vi.mocked(backend.load).mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() => useCloudProgress("user-reload", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.syncStatus).toBe("error");
    expect(result.current.store.stats.totalDone).toBe(0);

    act(() => window.dispatchEvent(new Event("online")));

    await waitFor(() => expect(backend.load).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.store.stats.totalDone).toBe(1));
    expect(result.current.syncStatus).toBe("synced");
  });

  it("does not let an online reload overwrite a mutation made while its snapshot is loading", async () => {
    let finishStaleReload: ((store: ReturnType<typeof defaultStore>) => void) | undefined;
    const staleReload = new Promise<ReturnType<typeof defaultStore>>((resolve) => {
      finishStaleReload = resolve;
    });
    const syncedStore = recordAnswer(defaultStore(), question, "A");
    const backend = createBackend();
    vi.mocked(backend.load)
      .mockRejectedValueOnce(new Error("offline"))
      .mockReturnValueOnce(staleReload)
      .mockResolvedValueOnce(syncedStore);
    const { result } = renderHook(() => useCloudProgress("user-race", backend));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(backend.load).toHaveBeenCalledTimes(2));

    act(() => result.current.answer(question, "A"));
    await waitFor(() => expect(backend.recordAnswer).toHaveBeenCalledOnce());
    await act(async () => finishStaleReload?.(defaultStore()));

    await waitFor(() => expect(backend.load).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(result.current.store.stats.totalDone).toBe(1));
    expect(result.current.store.wrongBook).toContain(question.id);
  });
});
