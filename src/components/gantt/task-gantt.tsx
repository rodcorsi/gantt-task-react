import { Calendar, CalendarProps } from "../calendar/calendar";
import { Grid, GridProps } from "../grid/grid";
import React, { useEffect, useRef } from "react";
import { TaskGanttContent, TaskGanttContentProps } from "./task-gantt-content";

import styles from "./gantt.module.css";
import { useGanttStoreState } from "./gantt-context";

export type TaskGanttProps = {
  gridProps: GridProps;
  calendarProps: CalendarProps;
  barProps: TaskGanttContentProps;
  ganttHeight: number;
};
export const TaskGantt: React.FC<TaskGanttProps> = ({
  gridProps,
  calendarProps,
  barProps,
  ganttHeight,
}) => {
  const ganttSVGRef = useRef<SVGSVGElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const verticalGanttContainerRef = useRef<HTMLDivElement>(null);
  const store = useGanttStoreState();
  const newBarProps = { ...barProps, svg: ganttSVGRef };
  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      if (
        state.scrollY != prevState.scrollY &&
        horizontalContainerRef.current
      ) {
        horizontalContainerRef.current.scrollTop = state.scrollY;
      }
      if (
        state.scrollX != prevState.scrollX &&
        verticalGanttContainerRef.current
      ) {
        verticalGanttContainerRef.current.scrollLeft = state.scrollX;
      }
    });
    return unsubscribe;
  }, []);
  return (
    <div
      className={styles.ganttVerticalContainer}
      ref={verticalGanttContainerRef}
      dir="ltr"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={gridProps.svgWidth}
        height={calendarProps.headerHeight}
        fontFamily={barProps.fontFamily}
      >
        <Calendar {...calendarProps} />
      </svg>
      <div
        ref={horizontalContainerRef}
        className={styles.horizontalContainer}
        style={
          ganttHeight
            ? { height: ganttHeight, width: gridProps.svgWidth }
            : { width: gridProps.svgWidth }
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={gridProps.svgWidth}
          height={
            (barProps.variant === "resource"
              ? barProps.resources.length
              : barProps.tasks.length) * barProps.rowHeight
          }
          fontFamily={barProps.fontFamily}
          ref={ganttSVGRef}
        >
          <Grid {...gridProps} />
          <TaskGanttContent {...newBarProps} />
        </svg>
      </div>
    </div>
  );
};
