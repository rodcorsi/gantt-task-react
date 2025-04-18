import React, { useMemo } from "react";

import { TaskListTableProps } from "../../types/public-types";
import styles from "./task-list-table.module.css";

const localeDateStringCache: { [key: string]: string } = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const TaskListTableDefault: React.FC<TaskListTableProps> = ({
  rowHeight,
  rowWidth,
  tasks,
  resources,
  variant,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );
  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {variant === "task"
        ? tasks.map(t => {
            let expanderSymbol = "";
            if (t.hideChildren === false) {
              expanderSymbol = "▼";
            } else if (t.hideChildren === true) {
              expanderSymbol = "▶";
            }

            return (
              <div
                className={styles.taskListTableRow}
                style={{ height: rowHeight }}
                key={`${t.id}row`}
              >
                <div
                  className={styles.taskListCell}
                  style={{
                    minWidth: rowWidth,
                    maxWidth: rowWidth,
                  }}
                  title={t.name}
                >
                  <div className={styles.taskListNameWrapper}>
                    <div
                      className={
                        expanderSymbol
                          ? styles.taskListExpander
                          : styles.taskListEmptyExpander
                      }
                      onClick={() => onExpanderClick(t)}
                    >
                      {expanderSymbol}
                    </div>
                    <div>{t.name}</div>
                  </div>
                </div>
                <div
                  className={styles.taskListCell}
                  style={{
                    minWidth: rowWidth,
                    maxWidth: rowWidth,
                  }}
                >
                  &nbsp;{toLocaleDateString(t.start, dateTimeOptions)}
                </div>
                <div
                  className={styles.taskListCell}
                  style={{
                    minWidth: rowWidth,
                    maxWidth: rowWidth,
                  }}
                >
                  &nbsp;{toLocaleDateString(t.end, dateTimeOptions)}
                </div>
              </div>
            );
          })
        : resources.map(resource => (
            <div
              className={styles.taskListTableRow}
              style={{ height: rowHeight }}
              key={resource + "row"}
            >
              <div
                className={styles.taskListCell}
                style={{
                  minWidth: rowWidth,
                  maxWidth: rowWidth,
                }}
                title={resource}
              >
                <div className={styles.taskListNameWrapper}>
                  <div className={styles.taskListEmptyExpander}></div>
                  <div>{resource}</div>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};
