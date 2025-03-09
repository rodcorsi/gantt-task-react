import React, { useEffect, useRef, useState } from "react";

import { BarTask } from "../../types/bar-task";
import { TooltipContentProps } from "../../types/public-types";
import styles from "./tooltip.module.css";

export type TooltipProps = {
  task: BarTask;
  arrowIndent: number;
  rtl: boolean;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  headerHeight: number;
  taskListWidth: number;
  scrollX: number;
  scrollY: number;
  rowHeight: number;
  fontSize: string;
  fontFamily: string;
  TooltipContent: React.FC<TooltipContentProps>;
};

type PositionResult = {
  x: number;
  y: number;
};

/**
 * Calculate the best position for the tooltip to ensure it fits on screen
 */
const calculateTooltipPosition = (
  tooltipWidth: number,
  tooltipHeight: number,
  task: BarTask,
  rowHeight: number,
  rtl: boolean,
  svgContainerHeight: number,
  svgContainerWidth: number,
  scrollX: number,
  scrollY: number,
  arrowIndent: number,
  headerHeight: number,
  taskListWidth: number
): PositionResult => {
  // Task position (center point)
  const taskCenterX = rtl ? task.x1 : task.x2;
  const taskY = task.index * rowHeight - scrollY + headerHeight;

  // Adjusted task position considering taskListWidth
  const adjustedTaskX = rtl
    ? taskCenterX - scrollX
    : taskCenterX + taskListWidth - scrollX;

  // Calculate available space in each direction
  const spaceRight =
    taskListWidth + svgContainerWidth - (adjustedTaskX + arrowIndent * 1.5);
  const spaceLeft = adjustedTaskX - arrowIndent * 1.5;
  const spaceTop = taskY - headerHeight;
  const spaceBottom = svgContainerHeight - taskY;

  // Check if tooltip fits in each direction
  const fitsRight = tooltipWidth < spaceRight;
  const fitsLeft = tooltipWidth < spaceLeft;
  const fitsTop = tooltipHeight < spaceTop;
  const fitsBottom = tooltipHeight < spaceBottom;

  // Determine best position for the tooltip
  let x: number;
  let y: number;

  // Prefer right side placement if RTL is false, left side if RTL is true
  if (rtl) {
    // RTL logic - prefer left placements
    if (fitsLeft && fitsTop) {
      x = adjustedTaskX - arrowIndent * 1.5 - tooltipWidth;
      y = taskY - tooltipHeight - arrowIndent;
    } else if (fitsLeft && fitsBottom) {
      x = adjustedTaskX - arrowIndent * 1.5 - tooltipWidth;
      y = taskY + arrowIndent;
    } else if (fitsRight && fitsTop) {
      x = adjustedTaskX + arrowIndent * 1.5;
      y = taskY - tooltipHeight - arrowIndent;
    } else if (fitsRight && fitsBottom) {
      x = adjustedTaskX + arrowIndent * 1.5;
      y = taskY + arrowIndent;
    } else {
      // Fallback to the position with most space
      if (spaceLeft >= spaceRight) {
        // Use left side
        x = Math.max(0, adjustedTaskX - arrowIndent * 1.5 - tooltipWidth);
        y =
          spaceTop >= spaceBottom
            ? Math.max(headerHeight, taskY - tooltipHeight - arrowIndent)
            : Math.min(svgContainerHeight - tooltipHeight, taskY + arrowIndent);
      } else {
        // Use right side
        x = Math.min(
          taskListWidth + svgContainerWidth - tooltipWidth,
          adjustedTaskX + arrowIndent * 1.5
        );
        y =
          spaceTop >= spaceBottom
            ? Math.max(headerHeight, taskY - tooltipHeight - arrowIndent)
            : Math.min(svgContainerHeight - tooltipHeight, taskY + arrowIndent);
      }
    }
  } else {
    // LTR logic - prefer right placements
    if (fitsRight && fitsTop) {
      x = adjustedTaskX + arrowIndent * 1.5;
      y = taskY - tooltipHeight - arrowIndent;
    } else if (fitsRight && fitsBottom) {
      x = adjustedTaskX + arrowIndent * 1.5;
      y = taskY + arrowIndent;
    } else if (fitsLeft && fitsTop) {
      x = adjustedTaskX - arrowIndent * 1.5 - tooltipWidth;
      y = taskY - tooltipHeight - arrowIndent;
    } else if (fitsLeft && fitsBottom) {
      x = adjustedTaskX - arrowIndent * 1.5 - tooltipWidth;
      y = taskY + arrowIndent;
    } else {
      // Fallback to the position with most space
      if (spaceRight >= spaceLeft) {
        // Use right side
        x = Math.min(
          taskListWidth + svgContainerWidth - tooltipWidth,
          adjustedTaskX + arrowIndent * 1.5
        );
        y =
          spaceTop >= spaceBottom
            ? Math.max(headerHeight, taskY - tooltipHeight - arrowIndent)
            : Math.min(svgContainerHeight - tooltipHeight, taskY + arrowIndent);
      } else {
        // Use left side
        x = Math.max(
          taskListWidth,
          adjustedTaskX - arrowIndent * 1.5 - tooltipWidth
        );
        y =
          spaceTop >= spaceBottom
            ? Math.max(headerHeight, taskY - tooltipHeight - arrowIndent)
            : Math.min(svgContainerHeight - tooltipHeight, taskY + arrowIndent);
      }
    }
  }

  // Ensure tooltip stays within boundaries
  x = Math.max(
    taskListWidth,
    Math.min(taskListWidth + svgContainerWidth - tooltipWidth, x)
  );
  y = Math.max(headerHeight, Math.min(svgContainerHeight - tooltipHeight, y));

  return { x, y };
};

export const Tooltip: React.FC<TooltipProps> = ({
  task,
  rowHeight,
  rtl,
  svgContainerHeight,
  svgContainerWidth,
  scrollX,
  scrollY,
  arrowIndent,
  fontSize,
  fontFamily,
  headerHeight,
  taskListWidth,
  TooltipContent,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [relatedY, setRelatedY] = useState(0);
  const [relatedX, setRelatedX] = useState(0);

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;

      const { x, y } = calculateTooltipPosition(
        tooltipWidth,
        tooltipHeight,
        task,
        rowHeight,
        rtl,
        svgContainerHeight,
        svgContainerWidth,
        scrollX,
        scrollY,
        arrowIndent,
        headerHeight,
        taskListWidth
      );

      setRelatedY(y);
      setRelatedX(x);
    }
  }, [
    tooltipRef,
    task,
    arrowIndent,
    scrollX,
    scrollY,
    headerHeight,
    taskListWidth,
    rowHeight,
    svgContainerHeight,
    svgContainerWidth,
    rtl,
  ]);

  return (
    <div
      ref={tooltipRef}
      className={
        relatedX
          ? styles.tooltipDetailsContainer
          : styles.tooltipDetailsContainerHidden
      }
      style={{ left: relatedX, top: relatedY }}
    >
      <TooltipContent task={task} fontSize={fontSize} fontFamily={fontFamily} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<TooltipContentProps> = ({
  task,
  fontSize,
  fontFamily,
}) => {
  const style = {
    fontSize,
    fontFamily,
  };
  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <b style={{ fontSize: fontSize + 6 }}>{`${
        task.name
      }: ${task.start.getDate()}-${
        task.start.getMonth() + 1
      }-${task.start.getFullYear()} - ${task.end.getDate()}-${
        task.end.getMonth() + 1
      }-${task.end.getFullYear()}`}</b>
      {task.end.getTime() - task.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>{`Duration: ${~~(
          (task.end.getTime() - task.start.getTime()) /
          (1000 * 60 * 60 * 24)
        )} day(s)`}</p>
      )}

      <p className={styles.tooltipDefaultContainerParagraph}>
        {!!task.progress && `Progress: ${task.progress} %`}
      </p>
    </div>
  );
};
