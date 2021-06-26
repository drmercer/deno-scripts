import { Task } from "./api/types.ts";
import { mergeState, SyncState } from './sync.ts';
import { isInProject, hasParentTask, hasDueDate, getDueDate, isCompleted, isDueToday } from './queries.ts';
import { compareCreatedDate, compareDueDate, comparePriority, compareProjectOrder } from "./comparators.ts";

import { readState, readToken, writeState } from "./cli/store.ts";
import * as coreCommands from "./cli/commands.ts";
import { commandHandler } from "../cli-utils/command.ts";
import { Todoist } from "./api/api.ts";

function inbox() {
  const state = readState();
  if (!state) return;

  const tasks = inboxTasks(state)
    .map(renderTask)
    .join('\n');

  console.log(`=== Inbox tasks: ===\n${tasks}\n===`);
}

async function completeTopTask() {
  const accessToken = readToken();
  if (!accessToken) {
    console.error("Run td init first to set your Todoist access token");
    return;
  }

  const state = readState();
  if (!state) {
    console.error("No tasks synced. Run `td sync` first to download your tasks.");
    return;
  }

  const task = inboxTasks(state)[0];
  if (!task) {
    console.log("No tasks in inbox");
    return;
  }

  console.log(`Completing task '${task.content}'...`);
  const result = await Todoist(accessToken).complete(task.id);
  if (!result.success) {
    console.error("Failed to complete task", result);
    return;
  }

  const newState = mergeState(state, {
    tasks: [{
      ...task,
      checked: 1,
      // TODO this date string is in UTC timezone, is that a problem?
      date_completed: new Date().toISOString(),
    }],
  });

  writeState(newState);

  console.log(`Successfully completed task.`);
}

function inboxTasks(state: SyncState): Task[] {
  // NOTE not sure if this properly filters out team inboxes
  const inboxProject = state.projects.find(p => p.inbox_project === true);

  return state.tasks
    .filter(isInProject(inboxProject!))
    .filter(t => !hasParentTask(t) && !isCompleted(t))
    .filter(t => !hasDueDate(t) || isDueToday(t))
    .sort((a, b) => -comparePriority(a, b) || compareDueDate(a, b) || compareProjectOrder(a, b))
}

function renderTask(t: Task) {
  return `p${5 - t.priority} ${t.content}${t.due ? ` (${getDueDate(t)}, ${t.due.string})` : ""}`;
}

const handler = commandHandler({
  commands: {
    inbox,
    completeTopTask,
    ...coreCommands,
  },
  parentCommandName: 'td',
  defaultCommand: 'inbox',
});

const success = await handler(Deno.args);

Deno.exit(success ? 0 : 1);
