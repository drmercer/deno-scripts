import password from "../../io/password.ts";
import { readState, writeState } from "./store.ts";
import { doSync, SyncState } from "../sync.ts";

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
