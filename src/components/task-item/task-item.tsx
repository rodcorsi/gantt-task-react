import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { BarTask } from "../../types/bar-task";
import { GanttContentMoveAction } from "../../types/gantt-task-actions";
import { Milestone } from "./milestone/milestone";
import { Project } from "./project/project";
import React from "react";
import { VariantType } from "../../types/public-types";
import style from "./task-item.module.css";

export type TaskItemProps = {
  task: BarTask;
  variant: VariantType;
  arrowIndent: number;
  taskHeight: number;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  rtl: boolean;
  textWidth: number;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedTask: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
};

export const TaskItem: React.FC<TaskItemProps> = props => {
  const { task, variant, isDelete, taskHeight, textWidth, onEventStart } = {
    ...props,
  };
  const isTextInside = textWidth < task.x2 - task.x1;

  return (
    <g
      onKeyDown={e => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) onEventStart("delete", task, e);
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        onEventStart("mouseenter", task, e);
      }}
      onMouseLeave={e => {
        onEventStart("mouseleave", task, e);
      }}
      onDoubleClick={e => {
        onEventStart("dblclick", task, e);
      }}
      onClick={e => {
        onEventStart("click", task, e);
      }}
      onFocus={() => {
        onEventStart("select", task);
      }}
    >
      <SwitchTaskItem {...props} />
      {variant === "resource" && !isTextInside ? null : (
        <text
          x={getX(isTextInside, props)}
          y={task.y + taskHeight * 0.5}
          className={
            isTextInside
              ? style.barLabel
              : style.barLabel && style.barLabelOutside
          }
        >
          {task.name}
        </text>
      )}
    </g>
  );
};

const SwitchTaskItem: React.FC<TaskItemProps> = props => {
  switch (props.task.typeInternal) {
    case "milestone":
      return <Milestone {...props} />;
    case "project":
      return <Project {...props} />;
    case "smalltask":
      return <BarSmall {...props} />;
    default:
      return <Bar {...props} />;
  }
};

function getX(
  isTextInside: boolean,
  { task, textWidth, rtl, arrowIndent }: TaskItemProps
) {
  const width = task.x2 - task.x1;
  const hasChild = task.barChildren.length > 0;
  if (isTextInside) {
    return task.x1 + width * 0.5;
  }
  if (rtl) {
    return task.x1 - textWidth - arrowIndent * +hasChild - arrowIndent * 0.2;
  } else {
    return task.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
  }
}
