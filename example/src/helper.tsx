import { Task } from "../../dist/types/public-types";

export function initTasks() {
  const currentDate = new Date();
  const tasks: Task[] = [
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Some Project",
      id: "ProjectSample",
      progress: 25,
      type: "project",
      hideChildren: false,
      displayOrder: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: "Idea",
      id: "Task 0",
      progress: 45,
      type: "task",
      project: "ProjectSample",
      resource: "Team 1",
      displayOrder: 2,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
      name: "Research",
      id: "Task 1",
      progress: 25,
      dependencies: ["Task 0"],
      type: "task",
      project: "ProjectSample",
      resource: "Team 2",
      displayOrder: 3,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
      name: "Discussion with team",
      id: "Task 2",
      progress: 10,
      dependencies: ["Task 1"],
      type: "task",
      project: "ProjectSample",
      resource: "Team 1",
      displayOrder: 4,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
      name: "Developing",
      id: "Task 3",
      progress: 2,
      dependencies: ["Task 2"],
      type: "task",
      project: "ProjectSample",
      resource: "Team 2",
      displayOrder: 5,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      name: "Review",
      id: "Task 4",
      type: "task",
      progress: 70,
      dependencies: ["Task 2"],
      project: "ProjectSample",
      resource: "Team 1",
      displayOrder: 6,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Release",
      id: "Task 6",
      progress: currentDate.getMonth(),
      type: "milestone",
      dependencies: ["Task 4"],
      project: "ProjectSample",
      displayOrder: 7,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: "Party Time",
      id: "Task 9",
      progress: 0,
      isDisabled: true,
      type: "task",
    },
  ];
  return tasks;
}

export function getStartEndDateForProject(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter(t => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
}

// createLongTasks creates random 5000 tasks
// date range of 2 months
// time between 10minutes to 3 days
// 100 resources
// 500 projects
export function createLongTasks(): Task[] {
  const tasks: Task[] = [];
  const currentDate = new Date();
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    0
  );

  // Create resources array
  const resources: string[] = [];
  for (let i = 0; i < 100; i++) {
    resources.push(`Resource ${i + 1}`);
  }

  // Create projects array
  const projects: string[] = [];
  for (let i = 0; i < 500; i++) {
    projects.push(`Project ${i + 1}`);
  }

  // Create 5000 random tasks
  for (let i = 0; i < 5000; i++) {
    // Random start date within the 2 month range
    const taskStart = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );

    // Random duration between 10 minutes and 3 days in milliseconds
    const minDuration = 10 * 60 * 1000; // 10 minutes
    const maxDuration = 3 * 24 * 60 * 60 * 1000; // 3 days
    const duration = minDuration + Math.random() * (maxDuration - minDuration);

    const taskEnd = new Date(taskStart.getTime() + duration);

    tasks.push({
      start: taskStart,
      end: taskEnd,
      name: `Task ${i + 1}`,
      id: `Task ${i + 1}`,
      progress: Math.floor(Math.random() * 100),
      type: "task",
      project: projects[Math.floor(Math.random() * projects.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      displayOrder: i + 1,
    });
  }

  return tasks;
}
