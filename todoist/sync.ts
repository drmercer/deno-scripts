import { Project, Task } from './api/types.ts';
import { SyncResponse, Todoist } from './api/api.ts';

export interface SyncState {
  syncTime: number;
  syncToken: string;
  tasks: Task[];
  projects: Project[];
}

export async function doSync(accessToken: string, oldState?: SyncState): Promise<SyncState> {
  const result = await Todoist(accessToken).sync({
    resourceTypes: ['items', 'projects'],
    syncToken: oldState?.syncToken,
  });
  if (!result.success) {
    throw new Error("Failed sync. " + JSON.stringify(result));
  }
  const changes = resultToState(result.data);
  return oldState ? mergeState(oldState, changes) : changes;
}

export function resultToState(result: SyncResponse, timestamp = new Date()): SyncState {
  return {
    syncTime: timestamp.getTime(),
    syncToken: result.sync_token,
    tasks: result.items ?? [],
    projects: result.projects ?? [],
  };
}

export function mergeState(oldState: SyncState, changes: Partial<SyncState>): SyncState {
  return {
    syncTime: changes.syncTime || oldState.syncTime,
    syncToken: changes.syncToken || oldState.syncToken,
    tasks: mergeTasks(oldState.tasks, changes.tasks || []),
    projects: mergeProjects(oldState.projects, changes.projects || []),
  }
}

function mergeByKey<T>(a: T[], b: T[], key: keyof T): T[] {
  return a
    .filter(ae => !b.find(be => ae[key] === be[key]))
    .concat(b);
}

export function mergeTasks(oldTasks: Task[], newTasks: Task[]): Task[] {
  const merged = mergeByKey(oldTasks, newTasks, 'id')
    .filter(shouldKeepTask)
  return merged;
}

function shouldKeepTask(t: Task): boolean {
  return !t.is_deleted;
}

export function mergeProjects(oldProjects: Project[], newProjects: Project[]): Project[] {
  return mergeByKey(oldProjects, newProjects, 'id');
}
