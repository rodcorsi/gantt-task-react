import React from "react";
import styles from "./bar.module.css";

type BarDateHandleProps = {
  x: number;
  y: number;
  taskIndex: number;
  width: number;
  height: number;
  barCornerRadius: number;
  onMouseDown: React.MouseEventHandler<SVGGElement>;
};
export const BarDateHandle: React.FC<BarDateHandleProps> = ({
  x,
  y,
  taskIndex,
  width,
  height,
  barCornerRadius,
  onMouseDown,
}) => {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      data-task_index={taskIndex}
      className={styles.barHandle}
      ry={barCornerRadius}
      rx={barCornerRadius}
      onMouseDown={onMouseDown}
    />
  );
};
