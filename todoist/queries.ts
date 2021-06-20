import { Project, Task } from "./api/types.ts";

export const hasDueDate = (t: Task) => !!t.due;

// https://developer.todoist.com/sync/v8/#due-dates
export const dateStringHasDueTime = (s: string) => s.includes(":");

export const hasDueTime = (t: Task) => !!t.due && dateStringHasDueTime(t.due.date);

// Need to ensure due date includes a time so JS will interpret it in local time instead of UTC.
const dateStringToDate = (s: string) => dateStringHasDueTime(s) ? new Date(s) : new Date(s + "T00:00:00")

export const getDueDate = (t: Task): Date | undefined => t.due ? dateStringToDate(t.due.date) : undefined;

/**
 * Returns true if the due date is today (or earlier) and the due time is unset or earlier than the current time.
 */
export const isDueNow = (t: Task) => {
  const date = getDueDate(t);
  return date ? date < new Date() : false;
}

export const hasParentTask = (t: Task) => !!t.parent_id;

export const isInProject = (p: Project) => (t: Task) => t.project_id === p.id
