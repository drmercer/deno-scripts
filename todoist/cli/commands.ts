import password from "../../io/password.ts";
import { readState, writeState } from "./store.ts";
import { doSync, mergeState, SyncState } from "../sync.ts";
import { Todoist } from "../api/api.ts";

export function init() {
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

export async function sync() {
  const accessToken = localStorage.getItem("todoist:token");
  if (!accessToken) {
    console.error("Run td init first to set your Todoist access token");
    return;
  }
  const oldState = readState();

  console.log("Syncing...");
  const state = await doSync(accessToken, oldState);

  writeState(state);

  console.log("State saved:", summarizeState(state));
}

export async function add([taskText]: string[]) {
  const accessToken = localStorage.getItem("todoist:token");
  if (!accessToken) {
    console.error("Run td init first to set your Todoist access token");
    return;
  }

  console.log(`Adding '${taskText}'...`);
  const result = await Todoist(accessToken).quickAdd(taskText);
  if (!result.success) {
    console.error("Failed to create new task", result);
    return;
  }
  const task = result.data;

  const oldState = readState();
  if (!oldState) {
    return;
  }

  const state = mergeState(oldState, {
    tasks: [task],
  });

  writeState(state);
}

export function status() {
  const state = readState();
  if (state) {
    console.log("Current Todoist state:", summarizeState(state));
  } else {
    console.log("No Todoist state found. Do a sync first.");
  }
}

export function clear() {
  writeState(undefined);
}

// A little helper for summarizing the currently synced state
function summarizeState(state: SyncState) {
  return {
    tasks: state.tasks.length,
    projects: state.projects.length,
  };
}
