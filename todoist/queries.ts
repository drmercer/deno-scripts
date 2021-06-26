import { endOfDay } from "../date/relative.ts";
import { Project, Task } from "./api/types.ts";
import { dateStringIncludesTime, dateStringToDate } from "./util/date.ts";

export const hasDueDate = (t: Task) => !!t.due;

export const hasDueTime = (t: Task) => !!t.due && dateStringIncludesTime(t.due.date);

export const getDueDate = (t: Task): Date | undefined => t.due ? dateStringToDate(t.due.date, "23:59:59") : undefined;

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

export const getProjectOrder = (t: Task) => t.child_order;

export const isCompleted = (t: Task) => !!t.checked;

export const getUserPriority = (t: Task) => 5 - t.priority;
