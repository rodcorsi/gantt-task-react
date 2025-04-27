import React, { SyntheticEvent, useEffect, useRef } from "react";

import styles from "./horizontal-scroll.module.css";
import { useGanttStoreState } from "../gantt/gantt-context";

export const HorizontalScroll: React.FC<{
  svgWidth: number;
  taskListWidth: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
}> = ({ svgWidth, taskListWidth, rtl, onScroll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const store = useGanttStoreState();
  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      if (state.scrollX != prevState.scrollX && scrollRef.current) {
        scrollRef.current.scrollLeft = state.scrollX;
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div
      dir="ltr"
      style={{
        margin: rtl
          ? `0px ${taskListWidth}px 0px 0px`
          : `0px 0px 0px ${taskListWidth}px`,
      }}
      className={styles.scrollWrapper}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ width: svgWidth }} className={styles.scroll} />
    </div>
  );
};
