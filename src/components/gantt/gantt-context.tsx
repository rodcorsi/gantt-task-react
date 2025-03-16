import { GanttProps, Task } from "../../types/public-types";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { StoreApi, createStore, useStore } from "zustand";
import { ganttDateRange, seedDates } from "../../helpers/date-helper";
import { removeHiddenTasks, sortTasks } from "../../helpers/other-helper";

import { BarTask } from "../../types/bar-task";
import { DateSetup } from "../../types/date-setup";
import { GanttEvent } from "../../types/gantt-task-actions";
import { convertToBarTasks } from "../../helpers/bar-helper";
import tasksToResources from "../../helpers/tasks-to-resources";

export type GanttPropsWithDefault = Required<
  Omit<
    GanttProps,
    | "viewDate"
    | "onSelect"
    | "onDoubleClick"
    | "onClick"
    | "onDateChange"
    | "onProgressChange"
    | "onDelete"
    | "onExpanderClick"
  >
> &
  Pick<
    GanttProps,
    | "viewDate"
    | "onSelect"
    | "onDoubleClick"
    | "onClick"
    | "onDateChange"
    | "onProgressChange"
    | "onDelete"
    | "onExpanderClick"
  >;

export interface GanttState extends GanttPropsWithDefault {
  ganttEvent: GanttEvent;
  barTasks: BarTask[];
  resources: string[];
  dateSetup: DateSetup;
  scrollX: number;
  scrollY: number;
  taskHeight: number;
  selectedTask?: BarTask;
  tooltipTask?: BarTask | null;
  setGanttProps: (props: GanttPropsWithDefault) => void;
  setGanttEvent: (ganttEvent: GanttEvent) => void;
  setDateSetup: (dateSetup: DateSetup) => void;
  setScrollY: (value: number) => void;
  setScrollX: (value: number) => void;
  setSelectedTask: (taskId: string | null) => void;
  setFailedTask: (failedTask: BarTask) => void;
  setTooltipTask: (task?: BarTask | null) => void;
}

const GanttStoreContext = createContext<StoreApi<GanttState> | null>(null);

interface GanttStoreProviderProps {
  children: ReactNode;
  ganttProps: GanttPropsWithDefault;
}

export const GanttStoreProvider: React.FC<GanttStoreProviderProps> = ({
  children,
  ganttProps,
}) => {
  const storeRef = useRef<StoreApi<GanttState>>();
  const isFirstRender = useRef(true);
  if (!storeRef.current) {
    storeRef.current = createGanttStore(ganttProps);
  }
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    storeRef.current!.getState().setGanttProps(ganttProps);
  }, [...Object.values(ganttProps)]);
  return (
    <GanttStoreContext.Provider value={storeRef.current}>
      {children}
    </GanttStoreContext.Provider>
  );
};

export function useGanttStore<T>(selector: (state: GanttState) => T): T {
  return useStore(useGanttStoreState(), selector);
}

export function useGanttStoreState() {
  const store = useContext(GanttStoreContext);
  if (!store) {
    throw new Error("useGanttStore must be used within a GanttStoreProvider");
  }
  return store;
}

function createGanttStore(ganttProps: GanttPropsWithDefault) {
  return createStore<GanttState>((set, get) => ({
    ...ganttProps,
    ganttEvent: {
      action: "",
    },
    scrollY: 0,
    ...taskChangeEvents(ganttProps),
    setGanttProps: ganttProps => set(taskChangeEvents(ganttProps, get)),
    setGanttEvent: ganttEvent => {
      const { changedTask, action } = ganttEvent;
      const { barTasks } = get();
      if (changedTask) {
        if (action === "delete") {
          set({
            ganttEvent: { action: "" },
            barTasks: barTasks.filter(t => t.id !== changedTask.id),
          });
        } else if (
          action === "move" ||
          action === "end" ||
          action === "start" ||
          action === "progress"
        ) {
          const prevStateTask = barTasks.find(t => t.id === changedTask.id);
          if (
            prevStateTask &&
            (prevStateTask.start.getTime() !== changedTask.start.getTime() ||
              prevStateTask.end.getTime() !== changedTask.end.getTime() ||
              prevStateTask.progress !== changedTask.progress)
          ) {
            // actions for change
            set({
              ganttEvent,
              barTasks: barTasks.map(t =>
                t.id === changedTask.id ? changedTask : t
              ),
            });
          }
        } else {
          set({ ganttEvent });
        }
      }
      {
        set({ ganttEvent });
      }
    },
    setDateSetup: dateSetup => set({ dateSetup }),
    setScrollY: scrollY => set({ scrollY }),
    setScrollX: scrollX => set({ scrollX }),
    setSelectedTask: taskId => {
      const { selectedTask, barTasks, onSelect } = get();
      const newSelectedTask = barTasks.find(t => t.id === taskId);
      const oldSelectedTask = barTasks.find(
        t => !!selectedTask && t.id === selectedTask.id
      );
      if (onSelect) {
        if (oldSelectedTask) {
          onSelect(oldSelectedTask, false);
        }
        if (newSelectedTask) {
          onSelect(newSelectedTask, true);
        }
      }
      set({ selectedTask: newSelectedTask });
    },
    setFailedTask: failedTask => {
      set({
        barTasks: get().barTasks.map(t =>
          t.id !== failedTask.id ? t : failedTask
        ),
      });
    },
    setTooltipTask: tooltipTask => set({ tooltipTask }),
  }));
}

function taskChangeEvents(
  props: GanttPropsWithDefault,
  get?: () => GanttState
) {
  const taskHeight = (props.rowHeight * props.barFill) / 100;
  const scrollX = get?.().scrollX;
  let filteredTasks: Task[];
  if (props.onExpanderClick) {
    filteredTasks = removeHiddenTasks(props.tasks);
  } else {
    filteredTasks = props.tasks;
  }
  filteredTasks = filteredTasks.sort(sortTasks);
  const [startDate, endDate] = ganttDateRange(
    filteredTasks,
    props.viewMode,
    props.preStepsCount
  );
  let newDates = seedDates(startDate, endDate, props.viewMode);
  let newScrollX = scrollX ?? -1;
  if (props.rtl) {
    newDates = newDates.reverse();
    if (newScrollX === -1) {
      newScrollX = newDates.length * props.columnWidth;
    }
  }
  return {
    ...props,
    resources:
      props.variant === "resource" ? tasksToResources(props.tasks) : [],
    scrollX: newScrollX,
    dateSetup: { dates: newDates, viewMode: props.viewMode },
    taskHeight,
    barTasks: convertToBarTasks({
      tasks: filteredTasks,
      dates: newDates,
      taskHeight,
      columnWidth: props.columnWidth,
      rtl: props.rtl,
      rowHeight: props.rowHeight,
      variant: props.variant,
      barCornerRadius: props.barCornerRadius,
      handleWidth: props.handleWidth,
      barProgressColor: props.barProgressColor,
      barProgressSelectedColor: props.barProgressSelectedColor,
      barBackgroundColor: props.barBackgroundColor,
      barBackgroundSelectedColor: props.barBackgroundSelectedColor,
      projectProgressColor: props.projectProgressColor,
      projectProgressSelectedColor: props.projectProgressSelectedColor,
      projectBackgroundColor: props.projectBackgroundColor,
      projectBackgroundSelectedColor: props.projectBackgroundSelectedColor,
      milestoneBackgroundColor: props.milestoneBackgroundColor,
      milestoneBackgroundSelectedColor: props.milestoneBackgroundSelectedColor,
    }),
  };
}
