import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { BarTask } from "../../types/bar-task";
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
  isSelected: boolean;
  rtl: boolean;
  textWidth: number;
  onKeyDown: React.KeyboardEventHandler<SVGGElement>;
  onMouseEnter: React.MouseEventHandler<SVGGElement>;
  onMouseLeave: React.MouseEventHandler<SVGGElement>;
  onDoubleClick: React.MouseEventHandler<SVGGElement>;
  onClick: React.MouseEventHandler<SVGGElement>;
  onFocus: React.FocusEventHandler<SVGGElement>;
  onMouseDownMove: React.MouseEventHandler<SVGGElement>;
  onMouseDownProgress: React.MouseEventHandler<SVGGElement>;
  onMouseDownStart: React.MouseEventHandler<SVGGElement>;
  onMouseDownEnd: React.MouseEventHandler<SVGGElement>;
};

export const TaskItem: React.FC<TaskItemProps> = props => {
  const {
    task,
    variant,
    taskHeight,
    textWidth,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onDoubleClick,
    onClick,
    onFocus,
  } = {
    ...props,
  };
  const isTextInside = textWidth < task.x2 - task.x1;

  return (
    <g
      data-task_index={task.index}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onFocus={onFocus}
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
