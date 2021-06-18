import { Task } from "./api/types.ts";

export function comparePriority(a: Task, b: Task): number {
  if (a.priority > b.priority) {
    return 1;
  } else if (a.priority < b.priority) {
    return -1;
  } else {
    return 0;
  }
}

export function compareDueDate(a: Task, b: Task): number {
  if (!b.due) {
    return 1;
  } else if (!a.due) {
    return -1;
  } else {
    return new Date(a.due.date).getTime() - new Date(b.due.date).getTime();
  }
}

export function compareCreatedDate(a: Task, b: Task): number {
  return compareStringDates(a.date_added, b.date_added);
}

export function compareStringDates(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime();
}
