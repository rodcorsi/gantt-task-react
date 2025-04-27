import React, { SyntheticEvent, useEffect, useRef } from "react";

import styles from "./vertical-scroll.module.css";
import { useGanttStoreState } from "../gantt/gantt-context";

export const VerticalScroll: React.FC<{
  ganttHeight: number;
  ganttFullHeight: number;
  headerHeight: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}> = ({ ganttHeight, ganttFullHeight, headerHeight, rtl, onScroll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const store = useGanttStoreState();
  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      if (state.scrollY != prevState.scrollY && scrollRef.current) {
        scrollRef.current.scrollTop = state.scrollY;
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div
      style={{
        height: ganttHeight,
        marginTop: headerHeight,
        marginLeft: rtl ? "" : "-1rem",
      }}
      className={styles.scroll}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ height: ganttFullHeight, width: 1 }} />
    </div>
  );
};
