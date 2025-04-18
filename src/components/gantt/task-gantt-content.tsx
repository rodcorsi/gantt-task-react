import {
  BarMoveAction,
  GanttContentMoveAction,
  GanttEvent,
} from "../../types/gantt-task-actions";
import { EventOption, VariantType } from "../../types/public-types";
import React, { useEffect, useState } from "react";

import { Arrow } from "../other/arrow";
import { BarTask } from "../../types/bar-task";
import { TaskItem } from "../task-item/task-item";
import { handleTaskBySVGMouseEvent } from "../../helpers/bar-helper";
import { isKeyboardEvent } from "../../helpers/other-helper";
import measureTextWidth from "../../helpers/measure-text-width";
import { useGanttStore } from "./gantt-context";

export type TaskGanttContentProps = {
  tasks: BarTask[];
  resources: string[];
  variant: VariantType;
  dates: Date[];
  ganttEvent: GanttEvent;
  selectedTask: BarTask | undefined;
  rowHeight: number;
  columnWidth: number;
  timeStep: number;
  svg?: React.RefObject<SVGSVGElement>;
  svgWidth: number;
  taskHeight: number;
  arrowColor: string;
  arrowIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  setGanttEvent: (value: GanttEvent) => void;
  setFailedTask: (value: BarTask | null) => void;
  setSelectedTask: (taskId: string) => void;
} & EventOption;

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  tasks,
  variant,
  dates,
  ganttEvent,
  selectedTask,
  rowHeight,
  columnWidth,
  timeStep,
  svg,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setFailedTask,
  setSelectedTask,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
}) => {
  const point = svg?.current?.createSVGPoint();
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const textMeasure = measureTextWidth(fontSize, fontFamily);
  const setTooltipTask = useGanttStore(state => state.setTooltipTask);

  // create xStep
  useEffect(() => {
    const dateDelta =
      dates[1].getTime() -
      dates[0].getTime() -
      dates[1].getTimezoneOffset() * 60 * 1000 +
      dates[0].getTimezoneOffset() * 60 * 1000;
    const newXStep = (timeStep * columnWidth) / dateDelta;
    setXStep(newXStep);
  }, [columnWidth, dates, timeStep]);

  useEffect(() => {
    const handleMouseMove = async (event: MouseEvent) => {
      if (!ganttEvent.changedTask || !point || !svg?.current) return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );

      const { isChanged, changedTask } = handleTaskBySVGMouseEvent(
        cursor.x,
        ganttEvent.action as BarMoveAction,
        ganttEvent.changedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );
      if (isChanged) {
        setGanttEvent({ action: ganttEvent.action, changedTask });
      }
    };

    const handleMouseUp = async (event: MouseEvent) => {
      const { action, originalSelectedTask, changedTask } = ganttEvent;
      if (!changedTask || !point || !svg?.current || !originalSelectedTask)
        return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );
      const { changedTask: newChangedTask } = handleTaskBySVGMouseEvent(
        cursor.x,
        action as BarMoveAction,
        changedTask,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );

      const isNotLikeOriginal =
        originalSelectedTask.start !== newChangedTask.start ||
        originalSelectedTask.end !== newChangedTask.end ||
        originalSelectedTask.progress !== newChangedTask.progress;

      // remove listeners
      svg.current.removeEventListener("mousemove", handleMouseMove);
      svg.current.removeEventListener("mouseup", handleMouseUp);
      setGanttEvent({ action: "" });
      setIsMoving(false);

      // custom operation start
      let operationSuccess = true;
      if (
        (action === "move" || action === "end" || action === "start") &&
        onDateChange &&
        isNotLikeOriginal
      ) {
        try {
          const result = await onDateChange(
            newChangedTask,
            newChangedTask.barChildren
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      } else if (onProgressChange && isNotLikeOriginal) {
        try {
          const result = await onProgressChange(
            newChangedTask,
            newChangedTask.barChildren
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      }

      // If operation is failed - return old state
      if (!operationSuccess) {
        setFailedTask(originalSelectedTask);
      }
    };

    if (
      !isMoving &&
      (ganttEvent.action === "move" ||
        ganttEvent.action === "end" ||
        ganttEvent.action === "start" ||
        ganttEvent.action === "progress") &&
      svg?.current
    ) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
      setIsMoving(true);
    }
  }, [
    ganttEvent,
    xStep,
    initEventX1Delta,
    onProgressChange,
    timeStep,
    onDateChange,
    svg,
    isMoving,
    point,
    rtl,
    setFailedTask,
    setGanttEvent,
  ]);

  const getTaskByIndex = (taskIndex?: string) => {
    if (taskIndex) {
      return tasks[parseInt(taskIndex)];
    }
    return;
  };

  const handleOnKeyDown: React.KeyboardEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    if (task && !task.isDisabled && e.key === "Delete") {
      handleBarEventStart("delete", task, e);
    }
    e.stopPropagation();
  };
  const handleOnMouseEnter: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && setTooltipTask(task);
  };
  const handleOnMouseLeave: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && setTooltipTask(null);
  };
  const handleOnDoubleClick: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("dblclick", task, e);
  };
  const handleOnClick: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("click", task, e);
  };
  const handleOnFocus: React.FocusEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("select", task);
  };
  const handleOnMouseDownMove: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("move", task, e);
  };
  const handleOnMouseDownProgress: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("progress", task, e);
  };
  const handleOnMouseDownStart: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("start", task, e);
  };
  const handleOnMouseDownEnd: React.MouseEventHandler<SVGGElement> = e => {
    const task = getTaskByIndex(e.currentTarget.dataset.task_index);
    task && handleBarEventStart("end", task, e);
  };
  /**
   * Method is Start point of task change
   */
  const handleBarEventStart = async (
    action: GanttContentMoveAction,
    task: BarTask,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (!event) {
      if (action === "select") {
        setSelectedTask(task.id);
      }
    }
    // Keyboard events
    else if (isKeyboardEvent(event)) {
      if (action === "delete") {
        if (onDelete) {
          try {
            const result = await onDelete(task);
            if (result !== undefined && result) {
              setGanttEvent({ action, changedTask: task });
            }
          } catch (error) {
            console.error("Error on Delete. " + error);
          }
        }
      }
    }
    // Mouse Events
    else if (action === "dblclick") {
      !!onDoubleClick && onDoubleClick(task);
    } else if (action === "click") {
      !!onClick && onClick(task);
    }
    // Change task event start
    else if (action === "move") {
      if (!svg?.current || !point) return;
      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg.current.getScreenCTM()?.inverse()
      );
      setInitEventX1Delta(cursor.x - task.x1);
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    } else {
      setGanttEvent({
        action,
        changedTask: task,
        originalSelectedTask: task,
      });
    }
  };

  return (
    <g className="content">
      <g className="arrows" fill={arrowColor} stroke={arrowColor}>
        {tasks.map(task => {
          return task.barChildren.map(child => {
            return (
              <Arrow
                key={`Arrow from ${task.id} to ${tasks[child.index].id}`}
                taskFrom={task}
                taskTo={tasks[child.index]}
                rowHeight={rowHeight}
                taskHeight={taskHeight}
                arrowIndent={arrowIndent}
                rtl={rtl}
              />
            );
          });
        })}
      </g>
      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {tasks.map(task => {
          return (
            <TaskItem
              task={task}
              variant={variant}
              arrowIndent={arrowIndent}
              taskHeight={taskHeight}
              isProgressChangeable={!!onProgressChange && !task.isDisabled}
              isDateChangeable={!!onDateChange && !task.isDisabled}
              textWidth={textMeasure(task.name)}
              key={task.id}
              isSelected={!!selectedTask && task.id === selectedTask.id}
              rtl={rtl}
              onKeyDown={handleOnKeyDown}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
              onDoubleClick={handleOnDoubleClick}
              onClick={handleOnClick}
              onFocus={handleOnFocus}
              onMouseDownMove={handleOnMouseDownMove}
              onMouseDownProgress={handleOnMouseDownProgress}
              onMouseDownStart={handleOnMouseDownStart}
              onMouseDownEnd={handleOnMouseDownEnd}
            />
          );
        })}
      </g>
    </g>
  );
};
