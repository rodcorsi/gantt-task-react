import { BarDisplay } from "./bar-display";
import { BarProgressHandle } from "./bar-progress-handle";
import React from "react";
import { TaskItemProps } from "../task-item";
import { getProgressPoint } from "../../../helpers/bar-helper";
import styles from "./bar.module.css";

export const BarSmall: React.FC<TaskItemProps> = ({
  task,
  isProgressChangeable,
  isDateChangeable,
  onMouseDownMove,
  onMouseDownProgress,
  isSelected,
}) => {
  const progressPoint = getProgressPoint(
    task.progressWidth + task.x1,
    task.y,
    task.height
  );
  return (
    <g className={styles.barWrapper} tabIndex={0}>
      <BarDisplay
        x={task.x1}
        y={task.y}
        taskIndex={task.index}
        width={task.x2 - task.x1}
        height={task.height}
        progressX={task.progressX}
        progressWidth={task.progressWidth}
        barCornerRadius={task.barCornerRadius}
        styles={task.styles}
        isSelected={isSelected}
        onMouseDown={isDateChangeable ? onMouseDownMove : undefined}
      />
      <g className="handleGroup">
        {isProgressChangeable && (
          <BarProgressHandle
            taskIndex={task.index}
            progressPoint={progressPoint}
            onMouseDown={onMouseDownProgress}
          />
        )}
      </g>
    </g>
  );
};
