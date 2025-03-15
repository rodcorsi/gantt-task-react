import React from "react";
import style from "./bar.module.css";

type BarDisplayProps = {
  x: number;
  y: number;
  taskIndex: number;
  width: number;
  height: number;
  isSelected: boolean;
  /* progress start point */
  progressX: number;
  progressWidth: number;
  barCornerRadius: number;
  styles: {
    backgroundColor: string;
    backgroundSelectedColor: string;
    progressColor: string;
    progressSelectedColor: string;
  };
  onMouseDown?: React.MouseEventHandler<SVGGElement>;
};
export const BarDisplay: React.FC<BarDisplayProps> = ({
  x,
  y,
  taskIndex,
  width,
  height,
  isSelected,
  progressX,
  progressWidth,
  barCornerRadius,
  styles,
  onMouseDown,
}) => {
  return (
    <g onMouseDown={onMouseDown} data-task_index={taskIndex}>
      <rect
        x={x}
        width={width}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={
          isSelected ? styles.backgroundSelectedColor : styles.backgroundColor
        }
        className={style.barBackground}
      />
      <rect
        x={progressX}
        width={progressWidth}
        y={y}
        height={height}
        ry={barCornerRadius}
        rx={barCornerRadius}
        fill={isSelected ? styles.progressSelectedColor : styles.progressColor}
      />
    </g>
  );
};
