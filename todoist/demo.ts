import { Task } from "./api/types.ts";
import { isInProject, hasParentTask, isDueNow, hasDueDate, getDueDate } from './queries.ts';
import { compareCreatedDate, compareDueDate, comparePriority } from "./comparators.ts";

import { readState } from "./cli/store.ts";
import * as coreCommands from "./cli/commands.ts";
import { commandHandler } from "../cli-utils/command.ts";

function inbox() {
  const state = readState();
  if (!state) return;

  // NOTE not sure if this properly filters out team inboxes
  const inboxProject = state.projects.find(p => p.inbox_project === true);

  const tasks = state.tasks
    .filter(isInProject(inboxProject!))
    .filter(t => !hasParentTask(t))
    .filter(t => !hasDueDate(t) || isDueNow(t))
    .sort((a, b) => -comparePriority(a, b) || compareDueDate(a, b) || compareCreatedDate(a, b))
    .map(renderTask)
    .join('\n');

  console.log(`=== Inbox tasks: ===\n${tasks}\n===`);
}

function renderTask(t: Task) {
  return `p${t.priority} ${t.content}${t.due ? ` (${getDueDate(t)}, ${t.due.string})` : ""}`;
}

const handler = commandHandler({
  commands: {
    inbox,
    ...coreCommands,
  },
  parentCommandName: 'td',
  defaultCommand: 'inbox',
});

const success = await handler(Deno.args);

Deno.exit(success ? 0 : 1);
