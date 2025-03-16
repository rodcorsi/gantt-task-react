import React, { useEffect, useRef } from "react";
import { Task, TaskListTableProps } from "../../types/public-types";

import { useGanttStore } from "../gantt/gantt-context";
import { useShallow } from "zustand/react/shallow";

export type TaskListProps = {
  rowWidth: string;
  taskListRef: React.RefObject<HTMLDivElement>;
  horizontalContainerClass?: string;
};

export const TaskList: React.FC<TaskListProps> = ({
  rowWidth,
  taskListRef,
  horizontalContainerClass,
}) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const [
    headerHeight,
    fontFamily,
    fontSize,
    rowHeight,
    scrollY,
    tasks,
    resources,
    variant,
    onExpanderClick,
    locale,
    ganttHeight,
    TaskListHeader,
    TaskListTable,
    setSelectedTask,
    selectedTask,
  ] = useGanttStore(
    useShallow(s => [
      s.headerHeight,
      s.fontFamily,
      s.fontSize,
      s.rowHeight,
      s.scrollY,
      s.tasks,
      s.resources,
      s.variant,
      s.onExpanderClick,
      s.locale,
      s.ganttHeight,
      s.TaskListHeader,
      s.TaskListTable,
      s.setSelectedTask,
      s.selectedTask,
    ])
  );
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
    variant,
  };
  const selectedTaskId = selectedTask ? selectedTask.id : "";
  const handleExpanderClick = (task: Task) => {
    if (onExpanderClick && task.hideChildren !== undefined) {
      onExpanderClick({ ...task, hideChildren: !task.hideChildren });
    }
  };
  const tableProps: TaskListTableProps = {
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
    onExpanderClick: handleExpanderClick,
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
