import { Project, Task } from "./api/types.ts";

export const hasDueDate = (t: Task) => !!t.due;

export const hasParentTask = (t: Task) => !!t.parent_id;

/**
 * Returns true if the due date is today (or earlier) and the due time is unset or earlier than the current time.
 */
export const isDueNow = (t: Task) => !!t.due && new Date(t.due.date) < new Date();

export const isInProject = (p: Project) => (t: Task) => t.project_id === p.id
