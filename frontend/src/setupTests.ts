import "@testing-library/jest-dom";

// jsdom 在此設定下 localStorage 不完整（缺 clear）；提供記憶體版確保測試穩定。
class MemStorage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  clear() {
    this.m.clear();
  }
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
}
Object.defineProperty(globalThis, "localStorage", {
  value: new MemStorage(),
  writable: true,
});
