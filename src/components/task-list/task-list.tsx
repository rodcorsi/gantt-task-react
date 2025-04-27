import React, { useEffect, useRef } from "react";
import {
  Task,
  TaskListHeaderProps,
  TaskListTableProps,
  VariantType,
} from "../../types/public-types";

import { BarTask } from "../../types/bar-task";
import { useGanttStoreState } from "../gantt/gantt-context";

export type TaskListProps = {
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  rowHeight: number;
  ganttHeight: number;
  locale: string;
  tasks: Task[];
  resources: string[];
  variant: VariantType;
  taskListRef: React.RefObject<HTMLDivElement>;
  horizontalContainerClass?: string;
  selectedTask: BarTask | undefined;
  setSelectedTask: (task: string) => void;
  onExpanderClick: (task: Task) => void;
  TaskListHeader: React.FC<TaskListHeaderProps>;
  TaskListTable: React.FC<TaskListTableProps>;
};

export const TaskList: React.FC<TaskListProps> = ({
  headerHeight,
  fontFamily,
  fontSize,
  rowWidth,
  rowHeight,
  tasks,
  resources,
  variant,
  selectedTask,
  setSelectedTask,
  onExpanderClick,
  locale,
  ganttHeight,
  taskListRef,
  horizontalContainerClass,
  TaskListHeader,
  TaskListTable,
}) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const store = useGanttStoreState();
  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      if (
        state.scrollY != prevState.scrollY &&
        horizontalContainerRef.current
      ) {
        horizontalContainerRef.current.scrollTop = state.scrollY;
      }
    });
    return unsubscribe;
  }, []);

  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
    variant,
  };
  const selectedTaskId = selectedTask ? selectedTask.id : "";
  const tableProps = {
    rowHeight,
    rowWidth,
    fontFamily,
    fontSize,
    tasks,
    resources,
    variant,
    locale,
    selectedTaskId: selectedTaskId,
    setSelectedTask,
    onExpanderClick,
  };

  return (
    <div ref={taskListRef}>
      <TaskListHeader {...headerProps} />
      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <TaskListTable {...tableProps} />
      </div>
    </div>
  );
};
