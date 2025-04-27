import React, { ReactNode, createContext, useContext, useRef } from "react";
import createStore, { StoreApi, useStore } from "../../helpers/create-store";

import { BarTask } from "../../types/bar-task";

export type GanttState = {
  tooltipTask?: BarTask | null;
  setTooltipTask: (task?: BarTask | null) => void;
  scrollY: number;
  setScrollY: (y: number) => void;
  scrollX: number;
  setScrollX: (y: number) => void;
};

function createGanttStore() {
  return createStore<GanttState>(set => ({
    tooltipTask: undefined,
    setTooltipTask: task => set(state => ({ ...state, tooltipTask: task })),
    scrollY: 0,
    setScrollY: scrollY => set(state => ({ ...state, scrollY })),
    scrollX: -1,
    setScrollX: scrollX => set(state => ({ ...state, scrollX })),
  }));
}

const GanttStoreContext = createContext<StoreApi<GanttState> | null>(null);

interface GanttStoreProviderProps {
  children: ReactNode;
}

export const GanttStoreProvider: React.FC<GanttStoreProviderProps> = ({
  children,
}) => {
  const storeRef = useRef<StoreApi<GanttState>>();
  if (!storeRef.current) {
    storeRef.current = createGanttStore();
  }
  return (
    <GanttStoreContext.Provider value={storeRef.current}>
      {children}
    </GanttStoreContext.Provider>
  );
};

export function useGanttStore<T>(selector: (state: GanttState) => T): T {
  return useStore(useGanttStoreState(), selector);
}

export function useGanttStoreState() {
  const store = useContext(GanttStoreContext);
  if (!store) {
    throw new Error("useGanttStore must be used within a GanttStoreProvider");
  }
  return store;
}
