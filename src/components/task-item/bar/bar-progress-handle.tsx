import React from "react";
import styles from "./bar.module.css";

type BarProgressHandleProps = {
  progressPoint: string;
  taskIndex: number;
  onMouseDown: React.MouseEventHandler<SVGGElement>;
};
export const BarProgressHandle: React.FC<BarProgressHandleProps> = ({
  progressPoint,
  taskIndex,
  onMouseDown,
}) => {
  return (
    <polygon
      data-task_index={taskIndex}
      className={styles.barHandle}
      points={progressPoint}
      onMouseDown={onMouseDown}
    />
  );
};
