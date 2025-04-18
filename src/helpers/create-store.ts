import { useCallback, useSyncExternalStore } from "react";

type StateCreator<T> = (set: (fn: (prev: T) => T) => void, get: () => T) => T;

export type StoreApi<T> = {
  get: () => T;
  set: (fn: (prev: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
};

export default function createStore<T>(creator: StateCreator<T>): StoreApi<T> {
  let state: T;
  const listeners = new Set<() => void>();

  const get = () => state;
  const set = (fn: (prev: T) => T) => {
    const next = fn(state);
    if (next !== state) {
      state = next;
      listeners.forEach(l => l());
    }
  };

  state = creator(set, get);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { get, set, subscribe };
}

export function useStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U
): U {
  const getSnapshot = useCallback(
    () => selector(store.get()),
    [store, selector]
  );
  const subscribe = useCallback(
    (callback: () => void) => store.subscribe(callback),
    [store]
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}
