import { endOfDay } from "../date/relative.ts";
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

  const eod = endOfDay();

  const tasks = state.tasks
    .filter(t => t.project_id === inboxProject?.id)
    .filter(t => !t.parent_id)
    .filter(t => t.due ? new Date(t.due.date) < eod : true)
    .sort((a, b) => -comparePriority(a, b) || compareDueDate(a, b) || compareCreatedDate(a, b))
    .map(t => t.content + (t.due ? ` (${t.due.date}, ${t.due.string})` : ""))

  console.log(tasks)
}
