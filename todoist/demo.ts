import { Task } from "./api/types.ts";
import { isInProject, hasParentTask, isDueNow, hasDueDate } from './predicates.ts';
import { compareCreatedDate, compareDueDate, comparePriority } from "./comparators.ts";

import { readState } from "./cli/store.ts";
import * as coreCommands from "./cli/commands.ts";

const commands: Record<string, () => Promise<void>|void> = {
  ...coreCommands,
  inbox,
}

const command = Deno.args[0];

if (command in commands) {
  await commands[command]();
} else {
  console.error(`USAGE: demo <${Object.keys(commands).join('|')}>`);
  Deno.exit(1);
}

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

  console.log(tasks)
}

function renderTask(t: Task) {
  return `p${t.priority} ${t.content}${t.due ? ` (${t.due.date}, ${t.due.string})` : ""}`;
}
