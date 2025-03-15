import React from "react";
import { TaskItemProps } from "../task-item";
import styles from "./milestone.module.css";

export const Milestone: React.FC<TaskItemProps> = ({
  task,
  isDateChangeable,
  isSelected,
  onMouseDownMove,
}) => {
  const transform = `rotate(45 ${task.x1 + task.height * 0.356}
    ${task.y + task.height * 0.85})`;

  return (
    <g tabIndex={0} className={styles.milestoneWrapper}>
      <rect
        data-task_index={task.index}
        fill={
          isSelected
            ? task.styles.backgroundSelectedColor
            : task.styles.backgroundColor
        }
        x={task.x1}
        width={task.height}
        y={task.y}
        height={task.height}
        rx={task.barCornerRadius}
        ry={task.barCornerRadius}
        transform={transform}
        className={styles.milestoneBackground}
        onMouseDown={isDateChangeable ? onMouseDownMove : undefined}
      />
    </g>
  );
};
