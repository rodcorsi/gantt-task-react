import { Task } from "../types/public-types";

export default function tasksToResources(tasks: Task[]): string[] {
  const resources = Array.from(new Set(tasks.map(t => t.resource || "")));
  resources.sort();
  return resources;
}
