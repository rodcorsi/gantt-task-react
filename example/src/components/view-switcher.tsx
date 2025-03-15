import React from "react";
import { ViewMode } from "@rodcorsi/gantt-task-react";

type ViewSwitcherProps = {
  isChecked: boolean;
  byResource: boolean;
  onViewListChange: (isChecked: boolean) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  onByResourceChange: (byResource: boolean) => void;
};
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  onViewModeChange,
  onViewListChange,
  onByResourceChange,
  isChecked,
  byResource,
}) => {
  return (
    <div className="ViewContainer">
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.Hour)}
      >
        Hour
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.QuarterDay)}
      >
        Quarter of Day
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.HalfDay)}
      >
        Half of Day
      </button>
      <button className="Button" onClick={() => onViewModeChange(ViewMode.Day)}>
        Day
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.Week)}
      >
        Week
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.Month)}
      >
        Month
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.Year)}
      >
        Year
      </button>
      <button
        className="Button"
        onClick={() => onViewModeChange(ViewMode.QuarterYear)}
      >
        Year
      </button>
      <div className="Switch">
        <label className="Switch_Toggle">
          <input
            type="checkbox"
            defaultChecked={isChecked}
            onClick={() => onViewListChange(!isChecked)}
          />
          <span className="Slider" />
        </label>
        Show Task List
      </div>
      <div className="Switch">
        <label className="Switch_Toggle">
          <input
            type="checkbox"
            defaultChecked={byResource}
            onClick={() => onByResourceChange(!byResource)}
          />
          <span className="Slider" />
        </label>
        Show By Resource
      </div>
    </div>
  );
};
