import {
  BarMoveAction,
  GanttContentMoveAction,
} from "../../types/gantt-task-actions";
import React, { useEffect, useMemo, useState } from "react";
import { useGanttStore, useGanttStoreState } from "./gantt-context";

import { Arrow } from "../other/arrow";
import { BarTask } from "../../types/bar-task";
import { TaskItem } from "../task-item/task-item";
import { handleTaskBySVGMouseEvent } from "../../helpers/bar-helper";
import { isKeyboardEvent } from "../../helpers/other-helper";
import measureTextWidth from "../../helpers/measure-text-width";
import { useShallow } from "zustand/react/shallow";

export type TaskGanttContentProps = {
  svg?: React.RefObject<SVGSVGElement>;
};

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({ svg }) => {
  console.log("render task gantt content");
  const getStateStore = useGanttStoreState().getState;
  const [
    dates,
    rowHeight,
    columnWidth,
    timeStep,
    taskHeight,
    arrowColor,
    arrowIndent,
    fontFamily,
    fontSize,
    rtl,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    barTasks,
    variant,
    setGanttEvent,
    setSelectedTask,
    selectedTask,
    setFailedTask,
    setTooltipTask,
  ] = useGanttStore(
    useShallow(s => [
      s.dateSetup.dates,
      s.rowHeight,
      s.columnWidth,
      s.timeStep,
      s.taskHeight,
      s.arrowColor,
      s.arrowIndent,
      s.fontFamily,
      s.fontSize,
      s.rtl,
      s.onDateChange,
      s.onProgressChange,
      s.onDoubleClick,
      s.onClick,
      s.onDelete,
      s.barTasks,
      s.variant,
      s.setGanttEvent,
      s.setSelectedTask,
      s.selectedTask,
      s.setFailedTask,
      s.setTooltipTask,
    ])
  );
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const textMeasure = useMemo(
    () => measureTextWidth(fontSize, fontFamily),
    [fontFamily, fontSize]
  );
  const point = useMemo(() => svg?.current?.createSVGPoint(), [svg?.current]);
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
      const ganttEvent = getStateStore().ganttEvent;
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
        setGanttEvent({ ...ganttEvent, changedTask });
      }
    };

    const handleMouseUp = async (event: MouseEvent) => {
      const ganttEvent = getStateStore().ganttEvent;
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
        setGanttEvent({ action: "" });
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
        setGanttEvent({ action: "" });
      }

      // If operation is failed - return old state
      if (!operationSuccess) {
        setFailedTask(originalSelectedTask);
      }
    };

    if (svg?.current) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (svg?.current) {
        svg.current.removeEventListener("mousemove", handleMouseMove);
        svg.current.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [
    xStep,
    initEventX1Delta,
    onProgressChange,
    timeStep,
    onDateChange,
    svg,
    point,
    rtl,
    setFailedTask,
    getStateStore,
    setGanttEvent,
  ]);

  const getTaskByIndex = (taskIndex?: string) => {
    if (taskIndex) {
      return barTasks[parseInt(taskIndex)];
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
    setTooltipTask(getTaskByIndex(e.currentTarget.dataset.task_index));
  };
  const handleOnMouseLeave: React.MouseEventHandler<SVGGElement> = _e => {
    setTooltipTask(null);
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
        {barTasks.map(task => {
          return task.barChildren.map(child => {
            return (
              <Arrow
                key={`Arrow from ${task.id} to ${barTasks[child.index].id}`}
                taskFrom={task}
                taskTo={barTasks[child.index]}
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
        {barTasks.map(task => {
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
