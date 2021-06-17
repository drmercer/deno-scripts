import { SyncState } from "./sync.ts";

const StateKey = "todoist:state";

export function readState(): SyncState|undefined {
  const str = localStorage.getItem(StateKey);
  if (!str) {
    return undefined;
  }
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn("Error parsing saved state:", err);
    return undefined;
  }
}

export function writeState(state: SyncState | undefined): void {
  if (state) {
    localStorage.setItem(StateKey, JSON.stringify(state));
  } else {
    localStorage.removeItem(StateKey);
  }
}
