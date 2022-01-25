import { getDueDate, getProjectOrder, getUserPriority } from './queries.ts';
import { Task } from "./api/types.ts";
import { CompareFn, compareNumbers, map } from "https://esm.sh/@drmercer/lentils@0.0.3/cjs/common/sort/comparators.js";

export const compareUserPriority: CompareFn<Task> = map(
  getUserPriority,
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
  getProjectOrder,
  compareNumbers,
);
