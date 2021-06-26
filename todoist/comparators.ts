import { getDueDate } from './queries.ts';
import { Task } from "./api/types.ts";
import { CompareFn, compareNumbers, map } from "https://danmercer.net/deno/common/sort/comparators.ts";

export const comparePriority: CompareFn<Task> = map(
  t => t.priority,
  compareNumbers,
);

/**
 * Sorts by due date, puting tasks with no due date **last**.
 */
export const compareDueDate: CompareFn<Task> = map(
  t => getDueDate(t)?.getTime() ?? Number.POSITIVE_INFINITY,
  compareNumbers,
);

export const compareStringDates: CompareFn<string> = map(
  s => new Date(s).getTime(),
  compareNumbers,
);

export const compareCreatedDate: CompareFn<Task> = map(
  t => t.date_added,
  compareStringDates,
);

export const compareProjectOrder: CompareFn<Task> = map(
  t => -t.child_order,
  compareNumbers,
);
