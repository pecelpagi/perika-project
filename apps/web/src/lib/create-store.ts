import { useSyncExternalStore } from "react";

export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const get = () => state;

  return {
    get,
    set(patch: Partial<T>) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener());
    },
    use: () => useSyncExternalStore(subscribe, get),
  };
}
