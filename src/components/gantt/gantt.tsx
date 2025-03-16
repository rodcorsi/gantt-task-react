import { GanttProps, ViewMode } from "../../types/public-types";
import {
  GanttPropsWithDefault,
  GanttStoreProvider,
  useGanttStore,
} from "./gantt-context";
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { StandardTooltipContent, Tooltip } from "../other/tooltip";
import { TaskList, TaskListProps } from "../task-list/task-list";

import { BarTask } from "../../types/bar-task";
import { CalendarProps } from "../calendar/calendar";
import { GridProps } from "../grid/grid";
import { HorizontalScroll } from "../other/horizontal-scroll";
import { TaskGantt } from "./task-gantt";
import { TaskListHeaderDefault } from "../task-list/task-list-header";
import { TaskListTableDefault } from "../task-list/task-list-table";
import { VerticalScroll } from "../other/vertical-scroll";
import styles from "./gantt.module.css";
import { useShallow } from "zustand/react/shallow";

export const Gantt: React.FC<GanttProps> = props => {
  const ganttProps: GanttPropsWithDefault = {
    headerHeight: 50,
    columnWidth: 60,
    listCellWidth: "155px",
    rowHeight: 50,
    ganttHeight: 0,
    viewMode: ViewMode.Day,
    variant: "task",
    preStepsCount: 1,
    locale: "en-GB",
    barFill: 60,
    barCornerRadius: 3,
    barProgressColor: "#a3a3ff",
    barProgressSelectedColor: "#8282f5",
    barBackgroundColor: "#b8c2cc",
    barBackgroundSelectedColor: "#aeb8c2",
    projectProgressColor: "#7db59a",
    projectProgressSelectedColor: "#59a985",
    projectBackgroundColor: "#fac465",
    projectBackgroundSelectedColor: "#f7bb53",
    milestoneBackgroundColor: "#f1c453",
    milestoneBackgroundSelectedColor: "#f29e4c",
    rtl: false,
    handleWidth: 8,
    timeStep: 300000,
    arrowColor: "grey",
    fontFamily:
      "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
    fontSize: "14px",
    arrowIndent: 20,
    todayColor: "rgba(252, 248, 227, 0.5)",
    TooltipContent: StandardTooltipContent,
    TaskListHeader: TaskListHeaderDefault,
    TaskListTable: TaskListTableDefault,
    ...props,
  };
  return (
    <GanttStoreProvider ganttProps={ganttProps}>
      <GanttContent />
    </GanttStoreProvider>
  );
};

const GanttContent: React.FC = () => {
  console.log("render gantt content");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [
    tasks,
    headerHeight,
    columnWidth,
    listCellWidth,
    rowHeight,
    ganttHeight,
    viewMode,
    variant,
    locale,
    rtl,
    fontSize,
    fontFamily,
    todayColor,
    viewDate,
    dateSetup,
    scrollX,
    scrollY,
    setScrollX,
    setScrollY,
    resources,
  ] = useGanttStore(
    useShallow(s => [
      s.tasks,
      s.headerHeight,
      s.columnWidth,
      s.listCellWidth,
      s.rowHeight,
      s.ganttHeight,
      s.viewMode,
      s.variant,
      s.locale,
      s.rtl,
      s.fontSize,
      s.fontFamily,
      s.todayColor,
      s.viewDate,
      s.dateSetup,
      s.scrollX,
      s.scrollY,
      s.setScrollX,
      s.setScrollY,
      s.resources,
    ])
  );
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
    undefined
  );

  const [taskListWidth, setTaskListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight);

  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  const ganttFullHeight =
    (variant === "resource" ? resources.length : tasks.length) * rowHeight;
  const svgWidth = dateSetup.dates.length * columnWidth;

  useEffect(() => {
    console.log("useEffect 1", [
      viewDate,
      columnWidth,
      dateSetup.dates,
      dateSetup.viewMode,
      viewMode,
      currentViewDate,
      setCurrentViewDate,
    ]);
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !currentViewDate) ||
        (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf()
      );
      if (index === -1) {
        return;
      }
      setCurrentViewDate(viewDate);
      setScrollX(columnWidth * index);
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    currentViewDate,
    setCurrentViewDate,
  ]);

  useEffect(() => {
    console.log("useEffect 2", [
      taskListRef.current,
      listCellWidth,
      variant,
      taskListRef.current?.offsetWidth,
    ]);
    if (!listCellWidth) {
      setTaskListWidth(0);
    }
    if (taskListRef.current) {
      setTaskListWidth(taskListRef.current.offsetWidth);
    }
  }, [taskListRef.current, listCellWidth, variant]);

  useEffect(() => {
    console.log("useEffect 2.5", [wrapperRef, taskListWidth]);
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - taskListWidth);
    }
  }, [wrapperRef, taskListWidth]);

  useEffect(() => {
    console.log("useEffect 3", [
      ganttHeight,
      tasks.length,
      resources.length,
      headerHeight,
      rowHeight,
    ]);
    if (ganttHeight) {
      setSvgContainerHeight(ganttHeight + headerHeight);
    } else if (variant === "task") {
      setSvgContainerHeight(tasks.length * rowHeight + headerHeight);
    } else if (variant === "resource") {
      setSvgContainerHeight(resources.length * rowHeight + headerHeight);
    }
  }, [ganttHeight, tasks.length, resources.length, headerHeight, rowHeight]);

  // scroll events
  useEffect(() => {
    console.log("useEffect 4", [
      wrapperRef,
      scrollY,
      scrollX,
      ganttHeight,
      svgWidth,
      rtl,
      ganttFullHeight,
    ]);
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    wrapperRef,
    scrollY,
    scrollX,
    ganttHeight,
    svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setScrollY(newScrollY);
    }
    setIgnoreScrollEvent(true);
  };

  const gridProps: GridProps = {
    rows: variant === "resource" ? resources.length : tasks.length,
    columnWidth,
    svgWidth,
    rowHeight,
    dates: dateSetup.dates,
    todayColor,
    rtl,
  };
  const calendarProps: CalendarProps = {
    dateSetup,
    locale,
    viewMode,
    headerHeight,
    columnWidth,
    fontFamily,
    fontSize,
    rtl,
  };

  const tableProps: TaskListProps = {
    rowWidth: listCellWidth,
    taskListRef,
    horizontalContainerClass: styles.horizontalContainer,
  };
  return (
    <div>
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        ref={wrapperRef}
      >
        {listCellWidth && <TaskList {...tableProps} />}
        <TaskGantt
          gridProps={gridProps}
          calendarProps={calendarProps}
          barProps={{}}
          ganttHeight={ganttHeight}
        />
        <TooltipContext
          svgContainerHeight={svgContainerHeight}
          svgContainerWidth={svgContainerWidth}
          taskListWidth={taskListWidth}
          svgWidth={svgWidth}
        />
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          scroll={scrollY}
          onScroll={handleScrollY}
          rtl={rtl}
        />
      </div>
      <HorizontalScroll
        svgWidth={svgWidth}
        taskListWidth={taskListWidth}
        scroll={scrollX}
        rtl={rtl}
        onScroll={handleScrollX}
      />
    </div>
  );
};

const TooltipContext: React.FC<{
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  taskListWidth: number;
}> = props => {
  const task = useGanttStore(s => s.tooltipTask);
  if (!task) {
    return null;
  }
  return <TooltipContextShow task={task} {...props} />;
};

const TooltipContextShow: React.FC<{
  task: BarTask;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  taskListWidth: number;
}> = props => {
  const [
    arrowIndent,
    rowHeight,
    fontFamily,
    fontSize,
    scrollX,
    scrollY,
    headerHeight,
    rtl,
    TooltipContent,
  ] = useGanttStore(
    useShallow(s => [
      s.arrowIndent,
      s.rowHeight,
      s.fontFamily,
      s.fontSize,
      s.scrollX,
      s.scrollY,
      s.headerHeight,
      s.rtl,
      s.TooltipContent,
    ])
  );
  return (
    <Tooltip
      {...props}
      arrowIndent={arrowIndent}
      rowHeight={rowHeight}
      fontFamily={fontFamily}
      fontSize={fontSize}
      scrollX={scrollX}
      scrollY={scrollY}
      headerHeight={headerHeight}
      TooltipContent={TooltipContent}
      rtl={rtl}
    />
  );
};
