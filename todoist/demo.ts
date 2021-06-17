import { endOfDay } from "../date/relative.ts";
import password from "../io/password.ts";
import { compareCreatedDate, compareDueDate, comparePriority } from "./comparators.ts";
import { readState, writeState } from "./store.ts";
import { doSync, SyncState } from "./sync.ts";

const command = Deno.args[0];

if (command === "init") {
  init();
} else if (command === "sync") {
  await sync();
} else if (command === "summary") {
  summary();
} else if (command === "inbox") {
  inbox();
} else if (command === "clear") {
  clear();
} else {
  console.error(`USAGE: demo <init|sync|summary|inbox|clear>`);
  Deno.exit(1);
}

function init() {
  const accessToken = password("Enter your Todoist API token: ");
  if (accessToken === undefined) {
    console.warn("Aborted. No access token entered.");
  } else if (accessToken === '') {
    localStorage.removeItem("todoist:token");
    console.error("Access token cleared under origin " + window.location.origin);
  } else {
    localStorage.setItem("todoist:token", accessToken);
    console.log("Access token saved under origin " + window.location.origin);
  }
}

async function sync() {
  const accessToken = localStorage.getItem("todoist:token");
  if (!accessToken) {
    console.error("Run td init first to set your Todoist access token");
    return;
  }
  const oldState = readState();
  const state = await doSync(accessToken, oldState);

  writeState(state);

  console.log("Data saved.", summarizeState(state));
}

function summary() {
  const state = readState();
  if (state) {
    console.log("Todoist state: ", summarizeState(state));
  } else {
    console.log("No Todoist state found. Do a sync first.");
  }
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
    .sort((a, b) => comparePriority(a, b) || compareDueDate(a, b) || compareCreatedDate(a, b))
    .reverse()
    .map(t => t.content + (t.due ? ` (${t.due.date}, ${t.due.string})` : ""))

  console.log(tasks)
}

function clear() {
  writeState(undefined);
}

// ====================

function summarizeState(state: SyncState) {
  return {
    tasks: state.tasks.length,
    projects: state.projects.length,
  };
}
