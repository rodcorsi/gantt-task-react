import "@rodcorsi/gantt-task-react/dist/gantt-task-react.css";

import { Gantt, Task, ViewMode } from "@rodcorsi/gantt-task-react";
import React, { Profiler } from "react";
import {
  createLongTasks,
  getStartEndDateForProject,
  initTasks,
} from "./helper";

import { ViewSwitcher } from "./components/view-switcher";

// Custom styles component to demonstrate CSS variable overrides
const CustomTheme = () => {
  return (
    <style>
      {`
        :root {
          /* Override the CSS variables */
          --gantt-text-color: #fff;
          --gantt-alternate-text-color: yellow;

          --gantt-background-color: #333;
          --gantt-alternate-background-color: #666;

          --gantt-border-color: blue;

          --gantt-handle-color: orange;
          --gantt-expander-color: red;
        }
      `}
    </style>
  );
};

// Init
const App = () => {
  const [view, setView] = React.useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = React.useState<Task[]>(initTasks());
  const [isChecked, setIsChecked] = React.useState(true);
  const [byResource, setByResouce] = React.useState(false);
  const [isLimitedHeight, setIsLimitedHeight] = React.useState(false);
  const [useCustomTheme, setUseCustomTheme] = React.useState(false);
  const [isLongTasks, setIsLongTasks] = React.useState(false);

  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map(t => (t.id === task.id ? task : t));
    if (task.project) {
      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      const project = newTasks[newTasks.findIndex(t => t.id === task.project)];
      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        newTasks = newTasks.map(t =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter(t => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    alert("On Double Click event Id:" + task.id);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  return (
    <div className="Wrapper">
      {useCustomTheme && <CustomTheme />}
      <ViewSwitcher
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        onByResourceChange={setByResouce}
        isChecked={isChecked}
        byResource={byResource}
      />
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={isLimitedHeight}
            onChange={() => setIsLimitedHeight(!isLimitedHeight)}
          />
          Limited Height
        </label>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={useCustomTheme}
            onChange={() => setUseCustomTheme(!useCustomTheme)}
          />
          Custom Theme
        </label>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={isLongTasks}
            onChange={() => {
              setIsLongTasks(!isLongTasks);
              if (isLongTasks) {
                setTasks(initTasks());
              } else {
                setTasks(createLongTasks());
              }
            }}
          />
          Long Tasks
        </label>
      </div>
      <h3>{`Gantt With ${isLimitedHeight ? "Limited" : "Unlimited"} Height`}</h3>
      <Profiler
        id="gantt"
        onRender={(_id, phase, actualDuration) => {
          console.info(`phase:${phase} duration:${actualDuration}ms`);
        }}
      >
        <Gantt
          tasks={tasks}
          variant={byResource ? "resource" : "task"}
          viewMode={view}
          onDateChange={handleTaskChange}
          onDelete={handleTaskDelete}
          onProgressChange={handleProgressChange}
          onDoubleClick={handleDblClick}
          onClick={handleClick}
          onSelect={handleSelect}
          onExpanderClick={handleExpanderClick}
          listCellWidth={isChecked ? "155px" : ""}
          columnWidth={columnWidth}
          ganttHeight={isLimitedHeight ? 300 : undefined}
        />
      </Profiler>
    </div>
  );
};

export default App;
