import { endOfDay } from "../date/relative.ts";
import { Project, Task } from "./api/types.ts";

export const hasDueDate = (t: Task) => !!t.due;

// https://developer.todoist.com/sync/v8/#due-dates
export const dateStringHasDueTime = (s: string) => s.includes(":");

export const hasDueTime = (t: Task) => !!t.due && dateStringHasDueTime(t.due.date);

// Need to ensure due date includes a time so JS will interpret it in local time instead of UTC.
const dateStringToDate = (s: string) => dateStringHasDueTime(s) ? new Date(s) : new Date(s + "T23:59:59")

export const getDueDate = (t: Task): Date | undefined => t.due ? dateStringToDate(t.due.date) : undefined;

/**
 * Returns true if the due date is today (or earlier) and the due time is earlier than the current time.
 */
export const isOverdue = (t: Task) => (getDueDate(t) || Number.POSITIVE_INFINITY) < new Date();

/**
 * @deprecated prefer isOverdue()
 */
export const isDueNow = isOverdue;

export const isDueToday = (t: Task) => (getDueDate(t) || Number.POSITIVE_INFINITY) < endOfDay();

export const hasParentTask = (t: Task) => !!t.parent_id;

export const isInProject = (p: Project) => (t: Task) => t.project_id === p.id

export const isCompleted = (t: Task) => !!t.checked;
